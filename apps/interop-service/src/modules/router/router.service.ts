/**
 * Router Service: Main orchestrator for the interoperability layer
 *
 * Steps involved:
 * 1. Message validation
 * 2. Transformation to CloudEvents
 * 3. Route mapping lookup
 * 4. Sending to OpenHIM
 * 5. Retry logic
 * 6. Audit logging
 */

import type { Logger } from "pino";
import type { RabbitMQMessage } from "../../common/types/message";
import type { ExecutionResult, RouteMapping, RouterContext } from "../../common/types/router";
import type { Env } from "../../config/env";
import {
  createTraceparent,
  extractTraceparent,
} from "../../common/infrastructure/cloudevents/formatter";
import { PassThroughTransformer } from "../transformers/transformer.base";
import {
  safeValidate,
  messageEnvelopeSchema,
} from "../../common/utils/validation";
import { OpenHIMClient } from "../../common/infrastructure/http/openhim-client";
import { TransformerRegistry } from "../transformers/registry";
import { RouteMappingRepository } from "../route-mapping/route-mapping.repository";
import { AuditLogRepository } from "../audit/audit-log.repository";

// Router Service - orchestrates the entire event flow
export class RouterService {
  private logger: Logger;

  constructor(
    private env: Env,
    private openHIMClient: OpenHIMClient,
    private transformerRegistry: TransformerRegistry,
    private routeMappingRepo: RouteMappingRepository,
    private auditLogRepo: AuditLogRepository,
    logger: Logger,
  ) {
    this.logger = logger;
  }

  // Handles an incoming RabbitMQ message
  async handleEvent(message: RabbitMQMessage): Promise<ExecutionResult> {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    this.logger.debug(
      { executionId, topic: message.topic, payload: message.payload },
      "Starting event processing",
    );

    try {
      // Step 1: Validate message envelope
      const validationResult = safeValidate(messageEnvelopeSchema, message);

      if (!validationResult.success) {
        this.logger.error(
          { executionId, errors: validationResult.errors },
          "Message validation failed",
        );

        return this.createErrorResult(
          executionId,
          message.topic,
          "Message validation failed",
          startTime,
        );
      }

      const validatedMessage = validationResult.data as RabbitMQMessage;

      // Step 2: Look up route mapping
      const routeMapping = this.routeMappingRepo.getMappingByTopic(
        validatedMessage.topic,
      );

      if (!routeMapping || !routeMapping.enabled) {
        this.logger.warn(
          { executionId, topic: validatedMessage.topic },
          "No enabled route mapping found",
        );

        return this.createErrorResult(
          executionId,
          validatedMessage.topic,
          "No route mapping found",
          startTime,
        );
      }

      // Step 3: Create router context
      const context = this.createContext(
        executionId,
        validatedMessage,
        routeMapping,
        extractTraceparent(validatedMessage.headers),
      );

      // Step 4: Transform to CloudEvents — Two-layer approach
      //
      // Layer 1 (env flag): ENABLE_PAYLOAD_TRANSFORMATION=false → skip the registry entirely,
      //   wrap the raw SMILE payload in a CloudEvent as-is via PassThroughTransformer.
      //
      // Layer 2 (per-topic): ENABLE_PAYLOAD_TRANSFORMATION=true → ask the registry for a
      //   transformer. The registry always returns one: the registered specific transformer
      //   for this topic, or PassThroughTransformer as the automatic fallback for topics
      //   that have no specific transformer registered.
      //
      // The include_context flag on the route mapping controls whether the SMILE request
      // context (program_id, user_id, etc.) is embedded as CloudEvent extension attributes.
      const contextToPass = routeMapping.include_context
        ? validatedMessage.context
        : undefined;

      let cloudEvent;
      let transformerClass = "PassThroughTransformer";

      try {
        if (!this.env.ENABLE_PAYLOAD_TRANSFORMATION) {
          // Layer 1: transformation disabled globally — PassThrough for all topics
          this.logger.debug(
            { executionId, topic: validatedMessage.topic },
            "Payload transformation disabled - using PassThroughTransformer",
          );
          const passthroughTransformer = new PassThroughTransformer(
            validatedMessage.topic,
          );
          transformerClass = passthroughTransformer.constructor.name;
          cloudEvent = passthroughTransformer.transform(
            validatedMessage.payload,
            contextToPass,
          );
        } else {
          // Layer 2: transformation enabled — registry returns specific or PassThrough fallback
          const transformer = this.transformerRegistry.get(
            validatedMessage.topic,
          );
          transformerClass = transformer.constructor.name;
          this.logger.debug(
            {
              executionId,
              topic: validatedMessage.topic,
              transformerClass,
            },
            "Transforming payload",
          );
          cloudEvent = transformer.transform(
            validatedMessage.payload,
            contextToPass,
          );
        }
      } catch (error) {
        this.logger.error({ executionId, error }, "Transformation failed");

        // Extract fields from raw payload for audit logging
        const payload = validatedMessage.payload as Record<string, unknown>;
        const orderId = String(payload.id ?? payload.order_id ?? "");
        const programId = String(payload.program_id ?? "");
        const userId = String(payload.created_by ?? "");

        const endpointUrl = `${this.env.OPENHIM_HTTP_PROTOCOL}://${this.env.OPENHIM_HTTP_HOST}:${this.env.OPENHIM_HTTP_PORT}${routeMapping.request_path}`;

        await this.auditLogRepo.logFailure({
          topic: validatedMessage.topic,
          channelId: routeMapping.openhim_channel_id,
          endpoint: endpointUrl,
          error: `Transformation error: ${error instanceof Error ? error.message : String(error)}`,
          executionTimeMs: Date.now() - startTime,
          attemptNumber: (validatedMessage.retryCount ?? 0) + 1,
          traceId: context.traceId,
          orderId: orderId || undefined,
          programId: programId || undefined,
          userId: userId || undefined,
          userEmail: context.messageContext?.user_email,
          requestId: context.requestId,
        });

        return this.createErrorResult(
          executionId,
          validatedMessage.topic,
          "Transformation failed",
          startTime,
        );
      }

      // Step 5: Send to OpenHIM with retries
      const sendResult = await this.sendToOpenHIM(
        context,
        cloudEvent,
        routeMapping,
        JSON.stringify(cloudEvent),
      );

      // Step 6: Log execution result
      const totalExecutionTime = Date.now() - startTime;

      // Extract audit fields from CloudEvent, passing the request ID from context
      const auditFields = this.extractAuditFields(cloudEvent, context.requestId);

      if (sendResult.success) {
        await this.auditLogRepo.logSuccess({
          topic: validatedMessage.topic,
          channelId: routeMapping.openhim_channel_id,
          endpoint: sendResult.endpointUrl,
          httpStatusCode: sendResult.httpStatusCode || 0,
          executionTimeMs: totalExecutionTime,
          payload: JSON.stringify(cloudEvent),
          attemptNumber: (validatedMessage.retryCount ?? 0) + 1,
          traceId: context.traceId,
          orderId: auditFields.orderId || undefined,
          programId: auditFields.programId || undefined,
          userId: auditFields.userId || undefined,
          userEmail: auditFields.userEmail || context.messageContext?.user_email,
          requestId: auditFields.requestId,
        });
      } else {
        // Log OpenHIM request failures (transformation succeeded but sending failed).
        await this.auditLogRepo.logFailure({
          topic: validatedMessage.topic,
          channelId: routeMapping.openhim_channel_id,
          endpoint: sendResult.endpointUrl,
          error: sendResult.errorMessage || "OpenHIM request failed",
          httpStatusCode: sendResult.httpStatusCode || undefined,
          executionTimeMs: totalExecutionTime,
          payload: JSON.stringify(cloudEvent),
          attemptNumber: (validatedMessage.retryCount ?? 0) + 1,
          traceId: context.traceId,
          orderId: auditFields.orderId || undefined,
          programId: auditFields.programId || undefined,
          userId: auditFields.userId || undefined,
          userEmail: auditFields.userEmail || context.messageContext?.user_email,
          requestId: auditFields.requestId,
          response: sendResult.response ? JSON.stringify(sendResult.response) : undefined,
        });
      }

      return {
        executionId,
        topic: validatedMessage.topic,
        success: sendResult.success,
        status: sendResult.success ? "success" : "failure",
        transformation: {
          success: true,
          cloudEvent,
          metadata: {
            transformerClass,
            executionTimeMs: Date.now() - startTime,
            dataSize: JSON.stringify(cloudEvent).length,
          },
        },
        routing: {
          success: sendResult.success,
          response: sendResult.httpStatusCode
            ? {
                status: sendResult.httpStatusCode,
                body: sendResult.response,
                headers: {},
                responseTimeMs: sendResult.executionTimeMs || 0,
                isSuccess: sendResult.success,
                errorMessage: sendResult.errorMessage,
                attemptsCount: sendResult.retryCount + 1,
              }
            : undefined,
          metadata: {
            channelId: routeMapping.openhim_channel_id,
            endpoint: sendResult.endpointUrl,
            httpStatusCode: sendResult.httpStatusCode,
            executionTimeMs: sendResult.executionTimeMs || 0,
            retryCount: sendResult.retryCount || 0,
            totalAttemptsMs: totalExecutionTime,
          },
        },
        totalExecutionTimeMs: totalExecutionTime,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        errorMessage: sendResult.errorMessage,
        context,
      };
    } catch (error) {
      this.logger.error(
        { executionId, error },
        "Unhandled error during event processing",
      );

      return this.createErrorResult(
        executionId,
        message.topic,
        `Unhandled error: ${error instanceof Error ? error.message : String(error)}`,
        startTime,
      );
    }
  }

  // Sends CloudEvent to OpenHIM with retry logic
  private async sendToOpenHIM(
    context: RouterContext,
    cloudEvent: Record<string, unknown>,
    routeMapping: RouteMapping,
    payload: string,
  ) {
    const expectedCodes = routeMapping.expected_status_codes
      .split(",")
      .map((code: string) => parseInt(code.trim(), 10));

    // Build the OpenHIM endpoint URL from environment variables and route mapping path
    const endpointUrl = `${this.env.OPENHIM_HTTP_PROTOCOL}://${this.env.OPENHIM_HTTP_HOST}:${this.env.OPENHIM_HTTP_PORT}${routeMapping.request_path}`;

    this.logger.debug(
      { endpointUrl, channelId: routeMapping.openhim_channel_id },
      "Sending CloudEvent to OpenHIM channel",
    );

    const clientKey = context.messageContext?.client_key;

    const response = await this.openHIMClient.send(
      {
        headers: {
          "Content-Type": "application/json",
          "X-Trace-ID": context.traceId || "unknown",
          "X-Request-ID": context.requestId || context.executionId,
          // Forward integration client so OpenHIM mediators can route per client
          ...(clientKey ? { "X-Integration-Client": clientKey } : {}),
        },
        body: payload,
        timestamp: Date.now(),
      },
      expectedCodes,
      endpointUrl,
      {
        maxRetries: routeMapping.max_retries ?? undefined,
        retryBackoffMs: routeMapping.retry_backoff_ms ?? undefined,
        retryBackoffMultiplier:
          routeMapping.retry_backoff_multiplier ?? undefined,
      },
    );

    return {
      success: response.isSuccess,
      response: response.body,
      httpStatusCode: response.status,
      errorMessage: response.errorMessage,
      executionTimeMs: response.responseTimeMs,
      retryCount: response.attemptsCount - 1,
      endpointUrl, // Return the full URL for audit logging
    };
  }

  // Creates router context for an event
  private createContext(
    executionId: string,
    message: RabbitMQMessage,
    routeMapping: RouteMapping,
    traceparent?: string,
  ): RouterContext {
    const traceId = traceparent || createTraceparent();

    return {
      executionId,
      requestId: message.context?.request_id,
      traceId,
      originalMessage: message,
      routeMapping,
      messageContext: message.context,
      startTime: Date.now(),
      retryCount: 0,
      shouldContinue: true,
    };
  }

  // Creates an error result for failed processing
  private createErrorResult(
    executionId: string,
    topic: string,
    error: string,
    startTime: number,
  ): ExecutionResult {
    return {
      executionId,
      topic,
      success: false,
      status: "failure",
      transformation: {
        success: false,
        errorMessage: error,
        metadata: {
          transformerClass: "unknown",
          executionTimeMs: Date.now() - startTime,
          dataSize: 0,
        },
      },
      totalExecutionTimeMs: Date.now() - startTime,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date().toISOString(),
      errorMessage: error,
    };
  }

  // Generates unique execution ID
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  // Extracts audit fields from CloudEvent for logging
  private extractAuditFields(
    cloudEvent: Record<string, unknown>,
    requestId: string | undefined,
  ) {
    const data = (cloudEvent.data as Record<string, unknown>) || {};

    return {
      orderId: String(data.id || data.order_id || ""),
      programId: String(data.program_id || cloudEvent.program_id || ""),
      userId: String(data.created_by || ""),
      userEmail: String(cloudEvent.user_email || ""),
      requestId: requestId || "",
    };
  }
}

// Factory function to create router service instance
export function createRouterService(
  env: Env,
  openHIMClient: OpenHIMClient,
  transformerRegistry: TransformerRegistry,
  routeMappingRepo: RouteMappingRepository,
  auditLogRepo: AuditLogRepository,
  logger: Logger,
): RouterService {
  return new RouterService(
    env,
    openHIMClient,
    transformerRegistry,
    routeMappingRepo,
    auditLogRepo,
    logger,
  );
}
