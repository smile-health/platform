/**
 * RabbitMQ Event Consumer that subscribes to message queue and processes incoming events
 * Parsing message payloads, Validating message structure and Handling errors gracefully
 */

import type { Channel, ConsumeMessage } from "amqplib";
import type { Logger } from "pino";
import type { RabbitMQMessage } from "../../types/message";
import type { ExecutionResult } from "../../types/router";
import { safeValidate, messageEnvelopeSchema } from "../../utils/validation";

// Message handler callback. Returns the ExecutionResult so the consumer can
// decide whether to ack, retry, or permanently drop the message.
export type MessageHandler = (
  message: RabbitMQMessage,
) => Promise<ExecutionResult>;

//Consumer configuration
export interface ConsumerConfig {
  exchange: string | string[]; // Name(s) of the exchange(s) to subscribe to
  exchangeType?: string; // usually 'topic' or 'fanout'
  queue: string;
  routingPatterns?: string | string[]; // Routing key patterns for binding (not needed for fanout)
  prefetch?: number; // Max messages to prefetch at once (default: 1)
  autoAck?: boolean; // Whether to automatically acknowledge messages (default: false)
  maxRetries?: number; // Max republish attempts for retryable (OpenHIM send) failures (default: 3)
}

// RabbitMQ Event Consumer
export class EventConsumer {
  private channel: Channel;
  private queue: string;
  private consumerTag: string | null = null;
  private isRunning = false;
  private maxRetries: number;

  constructor(
    channel: Channel,
    queue: string,
    private logger: Logger,
    maxRetries: number = 3,
  ) {
    this.channel = channel;
    this.queue = queue;
    this.maxRetries = maxRetries;
  }

  // Starts consuming messages from the queue
  async start(
    handler: MessageHandler,
    prefetch: number = 1,
    autoAck: boolean = false,
  ): Promise<void> {
    try {
      // Set quality of service
      await this.channel.prefetch(prefetch);

      this.logger.info(
        { queue: this.queue, prefetch, autoAck },
        "Starting event consumer",
      );

      // Start consuming
      const response = await this.channel.consume(
        this.queue,
        (msg) => this.onMessage(msg, handler, autoAck),
        { noAck: autoAck },
      );

      this.consumerTag = response.consumerTag;
      this.isRunning = true;

      this.logger.info(
        { consumerTag: this.consumerTag },
        "Event consumer started",
      );
    } catch (error) {
      this.logger.error({ error }, "Failed to start consumer");
      throw error;
    }
  }

  // Stops consuming messages from the queue
  async stop(): Promise<void> {
    if (!this.isRunning || !this.consumerTag) {
      return;
    }

    try {
      this.logger.info({ consumerTag: this.consumerTag }, "Stopping consumer");
      await this.channel.cancel(this.consumerTag);
      this.isRunning = false;
      this.consumerTag = null;
      this.logger.info("Consumer stopped");
    } catch (error) {
      this.logger.error({ error }, "Error stopping consumer");
      throw error;
    }
  }

  // Checks if consumer is currently running
  isActive(): boolean {
    return this.isRunning;
  }

  // Handles an individual message from the queue. Parses, validates, routes to handler,
  // and decides ack / retry / drop based on the execution result.
  private async onMessage(
    msg: ConsumeMessage | null,
    handler: MessageHandler,
    autoAck: boolean,
  ): Promise<void> {
    if (!msg) {
      return;
    }

    const startTime = Date.now();
    const topic = msg.fields.exchange;

    try {
      // Parse message content
      const content = msg.content.toString("utf-8");
      const rawData = JSON.parse(content);

      // SMILE publishes: { headers: {...}, payload: {...}, context: {...} }
      const retryCount = parseInt(
        String(msg.properties.headers?.["x-retry-count"] ?? "0"),
        10,
      );
      const envelope = {
        topic,
        payload: rawData.payload || rawData,
        timestamp: Date.now(),
        messageId: msg.properties.messageId,
        headers:
          rawData.headers ||
          (msg.properties.headers as Record<string, string> | undefined),
        context: rawData.context || undefined,
        retryCount,
      };

      this.logger.debug(
        {
          topic,
          messageId: envelope.messageId,
          hasContext: !!envelope.context,
          retryCount: msg.properties.headers?.["x-retry-count"] ?? 0,
        },
        "Message envelope created",
      );

      // Validate envelope schema
      const validationResult = safeValidate(messageEnvelopeSchema, envelope);

      if (!validationResult.success) {
        // Schema validation failures are never retryable — the same message
        // will fail every time. Drop immediately with a clear error log.
        this.logger.error(
          { errors: validationResult.errors, topic },
          "Message dropped — invalid envelope (non-retryable)",
        );
        if (!autoAck) {
          this.channel.nack(msg, false, false);
        }
        return;
      }

      const parsedMessage = validationResult.data as RabbitMQMessage;

      this.logger.debug(
        { topic: parsedMessage.topic, messageId: parsedMessage.messageId },
        "Dispatching message to router",
      );

      // Call the handler and await the full execution result.
      // handleEvent() never throws — all errors are captured in ExecutionResult.
      const result = await handler(parsedMessage);
      const duration = Date.now() - startTime;

      if (result.success) {
        // Successfully processed and pushed to OpenHIM — acknowledge.
        if (!autoAck) {
          this.channel.ack(msg);
        }
        this.logger.debug(
          {
            topic: parsedMessage.topic,
            executionId: result.executionId,
            durationMs: duration,
            httpStatus: result.routing?.response?.status,
          },
          "Message processed successfully - acknowledged",
        );
        return;
      }

      // --- Failure path ---
      // A failure is retryable only when transformation succeeded but the OpenHIM send failed.
      // For anything else (validation, missing route mapping, transformation error), retrying won't help.
      // configuration or data problem — retrying the same message won't help.
      const isRetryable =
        result.transformation.success === true &&
        result.routing !== undefined &&
        result.routing.success === false;

      if (!isRetryable) {
        if (!autoAck) {
          this.channel.ack(msg);
        }
        this.logger.warn(
          {
            topic: parsedMessage.topic,
            executionId: result.executionId,
            errorMessage: result.errorMessage,
            durationMs: duration,
          },
          "Message dropped - non-retryable failure (acked without retry)",
        );
        return;
      }

      // Retryable failure — apply header-based retry counter.
      // On each attempt the message is republished to the same exchange with an incremented x-retry-count header.
      // The original is nacked without requeue so only the republished copy remains in the queue.
      if (retryCount < this.maxRetries) {
        const nextRetryCount = retryCount + 1;

        this.channel.publish(
          msg.fields.exchange,
          msg.fields.routingKey,
          msg.content,
          {
            contentType: msg.properties.contentType,
            contentEncoding: msg.properties.contentEncoding,
            messageId: msg.properties.messageId,
            correlationId: msg.properties.correlationId,
            replyTo: msg.properties.replyTo,
            headers: {
              ...((msg.properties.headers as Record<string, unknown>) || {}),
              "x-retry-count": nextRetryCount,
              "x-original-topic": msg.fields.exchange,
              "x-last-error": result.errorMessage ?? "OpenHIM send failure",
              "x-last-attempt-at": new Date().toISOString(),
            },
          },
        );

        if (!autoAck) {
          this.channel.nack(msg, false, false); // remove original; republished copy is in queue
        }

        this.logger.warn(
          {
            topic: parsedMessage.topic,
            executionId: result.executionId,
            retryCount: nextRetryCount,
            maxRetries: this.maxRetries,
            errorMessage: result.errorMessage,
            durationMs: duration,
          },
          `Message requeued for retry (attempt ${nextRetryCount}/${this.maxRetries})`,
        );
      } else {
        // Max retries exhausted — permanently drop with a clear error log so
        // the operator knows exactly which message was lost and why.
        if (!autoAck) {
          this.channel.nack(msg, false, false);
        }
        this.logger.error(
          {
            topic: parsedMessage.topic,
            executionId: result.executionId,
            retryCount,
            maxRetries: this.maxRetries,
            errorMessage: result.errorMessage,
            messageId: msg.properties.messageId,
            durationMs: duration,
          },
          "Message permanently dropped - max retries exhausted",
        );
      }
    } catch (error) {
      // Unexpected error (JSON parse failure, programming error, etc.). These are not application-level failures — drop and log clearly.
      const duration = Date.now() - startTime;
      this.logger.error(
        { error, topic, durationMs: duration },
        "Unexpected error processing message - dropped (non-retryable)",
      );
      if (!autoAck) {
        this.channel.nack(msg, false, false);
      }
    }
  }
}

// Creates and configures an event consumer, helper function for easier consumer setup
export async function createEventConsumer(
  channel: Channel,
  config: ConsumerConfig,
  logger: Logger,
): Promise<EventConsumer> {
  const {
    exchange,
    exchangeType = "topic",
    queue,
    routingPatterns,
    prefetch = 1,
    autoAck = false,
  } = config;

  try {
    // Support single exchange or multiple exchanges
    const exchanges = Array.isArray(exchange) ? exchange : [exchange];

    // Declare and bind to each exchange
    for (const exch of exchanges) {
      // Declare exchange
      await channel.assertExchange(exch, exchangeType, { durable: true });
      logger.debug({ exchange: exch, exchangeType }, "Exchange asserted");
    }

    // Declare queue (only once)
    await channel.assertQueue(queue, { durable: true });
    logger.debug({ queue }, "Queue asserted");

    // Bind queue to exchanges
    for (const exch of exchanges) {
      if (exchangeType === "fanout") {
        // For fanout exchanges, routing key is ignored (use empty string)
        await channel.bindQueue(queue, exch, "");
        logger.debug(
          { queue, exchange: exch, type: "fanout" },
          "Queue bound to fanout exchange",
        );
      } else {
        // For topic/direct exchanges, use routing patterns
        const patterns = Array.isArray(routingPatterns)
          ? routingPatterns
          : routingPatterns
            ? [routingPatterns]
            : [""];

        for (const pattern of patterns) {
          await channel.bindQueue(queue, exch, pattern);
          logger.debug(
            { queue, exchange: exch, pattern },
            "Queue bound to exchange",
          );
        }
      }
    }

    // Create consumer
    const consumer = new EventConsumer(
      channel,
      queue,
      logger,
      config.maxRetries ?? 3,
    );

    return consumer;
  } catch (error) {
    logger.error({ error, config }, "Failed to create event consumer");
    throw error;
  }
}
