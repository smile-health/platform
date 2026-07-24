// Router Service Types and Interfaces

import type { CloudEvent } from "./cloudevents";
import type { RabbitMQMessage, MessageContext } from "./message";
import type { OpenHIMResponse } from "./openhim";

// Route mapping configuration from the database
export interface RouteMapping {
  id: number;
  rabbitmq_topic: string;
  enabled: boolean;
  openhim_channel_id: string;
  openhim_channel_name: string;
  http_method: string;
  request_path: string;
  headers_json?: string | null; // Additional HTTP headers as JSON string
  include_context: boolean; // Whether to include message context in transformation
  auth_type: string;
  auth_config_json?: string | null;
  max_retries: number;
  retry_backoff_ms: number;
  retry_backoff_multiplier: number;
  expected_status_codes: string; // Comma-separated list of expected HTTP status codes
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  description?: string | null;
}

// Router context during event processing
export interface RouterContext {
  executionId: string;
  requestId?: string;
  traceId?: string; // W3C trace ID
  originalMessage: RabbitMQMessage;
  routeMapping: RouteMapping;
  cloudEvent?: CloudEvent<Record<string, unknown>>;
  messageContext?: MessageContext;
  startTime: number;
  retryCount: number;
  shouldContinue: boolean;
}

// Result of event transformation
export interface TransformationResult {
  success: boolean;
  cloudEvent?: CloudEvent<Record<string, unknown>>;
  errorMessage?: string;
  metadata: {
    transformerClass: string;
    executionTimeMs: number;
    dataSize: number;
  }; // Metadata about the transformation
}

// Result of sending event to OpenHIM
export interface RoutingResult {
  success: boolean;
  response?: OpenHIMResponse;
  errorMessage?: string;
  metadata: {
    channelId: string;
    endpoint: string;
    httpStatusCode?: number;
    executionTimeMs: number;
    retryCount: number;
    totalAttemptsMs: number;
  }; // Metadata about the routing
}

// Complete execution result for an event
export interface ExecutionResult {
  executionId: string;
  topic: string; // RabbitMQ topic that was processed
  success: boolean;
  status: "success" | "failure" | "retry" | "skipped";
  transformation: TransformationResult;
  routing?: RoutingResult;
  totalExecutionTimeMs: number;
  startTime: string;
  endTime: string;
  errorMessage?: string;
  context?: RouterContext;
}

// Options for router processing
export interface RouterOptions {
  continueOnTransformationError: boolean;
  continueOnRoutingError: boolean;
  storeFailedEvents: boolean;
  maxRetryTimeMs: number;
}

// Event processor callback
export type EventProcessor = (
  message: RabbitMQMessage,
  context: RouterContext
) => Promise<ExecutionResult>;

// Transformer interface
export interface ITransformer {
  transform(
    data: unknown,
    context: MessageContext | undefined
  ): CloudEvent<Record<string, unknown>>;

  // Get supported topics for this transformer
  getSupportedTopics(): string[];
}

// Helper to parse expected status codes from route mapping
export function parseExpectedStatusCodes(codes: string): number[] {
  return codes
    .split(",")
    .map((code) => code.trim())
    .map(Number)
    .filter((code) => !isNaN(code));
}

// Helper to parse headers JSON from route mapping
export function parseHeaders(
  headersJson: string | null | undefined
): Record<string, string> {
  if (!headersJson) {
    return {};
  }

  try {
    return JSON.parse(headersJson);
  } catch {
    return {};
  }
}

// Helper to parse auth config from route mapping
export function parseAuthConfig(
  authJson: string | null | undefined
): Record<string, unknown> {
  if (!authJson) {
    return {};
  }

  try {
    return JSON.parse(authJson);
  } catch {
    return {};
  }
}
