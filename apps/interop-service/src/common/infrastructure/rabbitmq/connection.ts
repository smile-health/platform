/**
 * RabbitMQ Connection Module
 * Provides a factory function for RabbitMQ connections
 */

import amqplib, { type Connection, type Channel } from "amqplib";
import type { Logger } from "pino";
import type { Env } from "../../../config/env";

// RabbitMQ connection options
export interface RabbitMQConnectOptions {
  maxRetries?: number;
  retryDelayMs?: number;
}

// Default connection options
const DEFAULT_OPTIONS: Required<RabbitMQConnectOptions> = {
  maxRetries: 5,
  retryDelayMs: 2000,
};

// Creates a RabbitMQ connection with retry logic
export async function createRabbitMQConnection(
  env: Env,
  logger: Logger,
  options: RabbitMQConnectOptions = {}
): Promise<Connection> {
  const { maxRetries, retryDelayMs } = { ...DEFAULT_OPTIONS, ...options };

  const url = buildRabbitMQUrl(env);

  logger.info(
    {
      host: env.RABBITMQ_HOST,
      port: env.RABBITMQ_PORT,
      vhost: env.RABBITMQ_VHOST,
      protocol: env.RABBITMQ_PROTOCOL,
      username: env.RABBITMQ_USERNAME,
    },
    "Connecting to RabbitMQ"
  );

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connectionOptions: any = {
        protocol: env.RABBITMQ_PROTOCOL,
        hostname: env.RABBITMQ_HOST,
        port: env.RABBITMQ_PORT,
        username: env.RABBITMQ_USERNAME,
        password: env.RABBITMQ_PASSWORD,
        vhost: env.RABBITMQ_VHOST,
        heartbeat: 60,
        frameMax: 4194304, // 1MB frame size (default is 131072 bytes)
      };

      // For amqps (AWS MQ), we need to handle TLS properly
      if (env.RABBITMQ_PROTOCOL === "amqps") {
        // AWS MQ requires these settings for proper TLS connection
        connectionOptions.locale = "en_US";
      }

      const connection = await amqplib.connect(connectionOptions);

      logger.info("RabbitMQ connection established");

      // Handle connection close events
      connection.on("close", () => {
        logger.warn("RabbitMQ connection closed");
      });

      connection.on("error", (error) => {
        logger.error({ error }, "RabbitMQ connection error");
      });

      return connection;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        logger.warn(
          { attempt, maxRetries, error: lastError.message, retryDelayMs },
          `Failed to connect to RabbitMQ, retrying in ${retryDelayMs}ms`
        );
        await sleep(retryDelayMs);
      } else {
        logger.error(
          { attempt, maxRetries, error: lastError.message },
          "Failed to connect to RabbitMQ after max retries"
        );
      }
    }
  }

  throw new Error(
    `Failed to connect to RabbitMQ after ${maxRetries} attempts: ${lastError?.message}`
  );
}

// Creates a channel from an existing connection
export async function createChannel(
  connection: Connection,
  logger: Logger
): Promise<Channel> {
  try {
    const channel = await connection.createChannel();
    logger.debug("RabbitMQ channel created");
    return channel;
  } catch (error) {
    logger.error({ error }, "Failed to create RabbitMQ channel");
    throw error;
  }
}

// Closes a RabbitMQ connection gracefully
export async function closeRabbitMQConnection(
  connection: Connection,
  logger: Logger
): Promise<void> {
  try {
    logger.info("Closing RabbitMQ connection");
    await connection.close();
    logger.info("RabbitMQ connection closed");
  } catch (error) {
    logger.error({ error }, "Error closing RabbitMQ connection");
    throw error;
  }
}

// Declares an exchange and returns the exchange name (Idempotent)
export async function declareExchange(
  channel: Channel,
  exchange: string,
  type: string = "topic",
  logger: Logger
): Promise<string> {
  try {
    await channel.assertExchange(exchange, type, { durable: true });
    logger.debug({ exchange, type }, "Exchange declared");
    return exchange;
  } catch (error) {
    logger.error({ error, exchange }, "Failed to declare exchange");
    throw error;
  }
}

// Declares a queue and returns the queue name (Idempotent)
export async function declareQueue(
  channel: Channel,
  queue: string,
  logger: Logger
): Promise<string> {
  try {
    await channel.assertQueue(queue, { durable: true });
    logger.debug({ queue }, "Queue declared");
    return queue;
  } catch (error) {
    logger.error({ error, queue }, "Failed to declare queue");
    throw error;
  }
}

// Binds a queue to an exchange with a routing pattern
export async function bindQueue(
  channel: Channel,
  queue: string,
  exchange: string,
  pattern: string,
  logger: Logger
): Promise<void> {
  try {
    await channel.bindQueue(queue, exchange, pattern);
    logger.debug({ queue, exchange, pattern }, "Queue bound to exchange");
  } catch (error) {
    logger.error({ error, queue, exchange, pattern }, "Failed to bind queue");
    throw error;
  }
}

// Sets the QoS (quality of service) for the channel, Limits how many messages are delivered at once
export async function setQoS(
  channel: Channel,
  prefetch: number = 1,
  logger: Logger
): Promise<void> {
  try {
    await channel.prefetch(prefetch);
    logger.debug({ prefetch }, "QoS set");
  } catch (error) {
    logger.error({ error, prefetch }, "Failed to set QoS");
    throw error;
  }
}

// Builds the RabbitMQ connection URL from environment variables
function buildRabbitMQUrl(env: Env): string {
  const protocol = env.RABBITMQ_PROTOCOL || "amqp";
  const host = env.RABBITMQ_HOST;
  const port = env.RABBITMQ_PORT;
  const username = env.RABBITMQ_USERNAME;
  const password = env.RABBITMQ_PASSWORD;
  const vhost = encodeURIComponent(env.RABBITMQ_VHOST || "/");

  return `${protocol}://${username}:${password}@${host}:${port}/${vhost}`;
}

// Helper function to sleep for a specified duration
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
