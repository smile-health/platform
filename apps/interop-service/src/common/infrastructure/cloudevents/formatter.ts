// CloudEvents Formatter to transform SMILE events into CNCF CloudEvents format

import { randomUUID } from "crypto";
import type { CloudEvent, SmileCloudEvent } from "../../types/cloudevents";
import type { RabbitMQMessage, MessageContext } from "../../types/message";

// Options for formatting a CloudEvent
interface FormatOptions {
  includeContext?: boolean;

  // Custom event source (defaults to 'urn:smile:orders')
  source?: string;

  dataschema?: string;
  traceparent?: string;

  // extensions to add to the CloudEvent
  extensions?: Record<string, unknown>;
}

// Formats a RabbitMQ message as a CloudEvent
export function formatAsCloudEvent(
  message: RabbitMQMessage,
  options: FormatOptions = {}
): SmileCloudEvent {
  const {
    includeContext = false,
    source = "urn:smile:orders",
    dataschema,
    traceparent,
    extensions = {},
  } = options;

  const eventId = randomUUID();
  const eventTime = new Date(message.timestamp).toISOString();
  const eventType = getEventType(message.topic);

  // Extract subject if available (e.g., order_id from payload)
  const subject = extractSubject(message.topic, message.payload);

  // Build the base CloudEvent
  const cloudEvent: SmileCloudEvent = {
    specversion: "1.0",
    type: eventType,
    source,
    id: eventId,
    time: eventTime,
    datacontenttype: "application/json",
    data: ensurePayloadIsObject(message.payload),
    subject,
  };

  // Add optional fields if provided
  if (dataschema) {
    cloudEvent.dataschema = dataschema;
  }

  if (traceparent) {
    cloudEvent.traceparent = traceparent;
  }

  // Add message context as extension attributes if requested
  if (includeContext && message.context) {
    addContextAsExtensions(cloudEvent, message.context);
  }

  // Add any additional custom extensions
  if (Object.keys(extensions).length > 0) {
    Object.assign(cloudEvent, extensions);
  }

  return cloudEvent;
}

// Derives the CloudEvent type from a RabbitMQ topic
// e.g. getEventType('order.created') => 'com.smile.order.created'
export function getEventType(topic: string): string {
  // Replace hyphens with dots for consistency and add SMILE namespace
  const normalized = topic.replace(/-/g, ".");
  return `com.smile.${normalized}`;
}

/**
 * Extracts the subject from an event payload
 * based on known topic patterns, needed in case the subject is not explicitly provided
 * e.g. extractSubject('order.created', { order_id: '123' }) => 'order_123'
 */
export function extractSubject(
  topic: string,
  payload: unknown
): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const obj = payload as Record<string, unknown>;

  // Map topics to their ID fields
  const idFieldMaps: Record<string, string> = {
    "order.": "order_id",
    "order-comment.": "id",
    "order-item-stock.": "id",
    "order-status.": "order_id",
  };

  // Find matching topic prefix
  for (const [prefix, idField] of Object.entries(idFieldMaps)) {
    if (topic.startsWith(prefix)) {
      const id = obj[idField];
      if (id) {
        // Extract topic entity name (e.g., 'order' from 'order.created')
        const entity = prefix.replace(/\.$/, "").replace(/-/g, "_");
        return `${entity}_${id}`;
      }
    }
  }

  return undefined;
}

// Ensures the payload is a valid object for the data field
// Add a generic object for payload 'schema is mapped to event'
export function ensurePayloadIsObject(
  payload: unknown
): Record<string, unknown> {
  if (payload === null || payload === undefined) {
    return {};
  }

  if (typeof payload === "object" && !Array.isArray(payload)) {
    return payload as Record<string, unknown>;
  }

  // Wrap primitives and arrays in an object
  return {
    value: payload,
  };
}

// Future: Adds message context as CloudEvent extension attributes
// Extension attributes follow CloudEvents extension naming conventions
export function addContextAsExtensions(
  event: CloudEvent<Record<string, unknown>>,
  context: MessageContext
): void {
  // Add non-undefined context fields as extensions
  // CloudEvents allows custom extension attributes

  if (context.program_id) {
    event.program_id = context.program_id;
  }

  if (context.workspace_id) {
    event.workspace_id = context.workspace_id;
  }

  if (context.user_id) {
    event.user_id = context.user_id;
  }

  if (context.user_email) {
    event.user_email = context.user_email;
  }

  if (context.request_id) {
    event.request_id = context.request_id;
  }

  if (context.trace_id) {
    event.trace_id = context.trace_id;
  }
}

// Create a W3C traceparent header value for distributed tracing
// See: https://w3c.github.io/trace-context/
export function createTraceparent(
  traceId: string = generateTraceId(),
  parentId: string = generateSpanId(),
  traceFlags: string = "01"
): string {
  return `00-${traceId}-${parentId}-${traceFlags}`;
}

// Generates a random W3C trace ID
// 32 hex characters (16 bytes)
export function generateTraceId(): string {
  return randomUUID().replace(/-/g, "");
}

// Generates a random W3C span ID
// 16 hex characters (8 bytes)
export function generateSpanId(): string {
  return randomUUID().replace(/-/g, "").substring(0, 16);
}

// Extracts traceparent from headers if present
export function extractTraceparent(
  headers: Record<string, string> | undefined
): string | undefined {
  if (!headers) {
    return undefined;
  }

  // Try different case variations (HTTP headers can have different casing)
  return (
    headers["traceparent"] ||
    headers["Traceparent"] ||
    headers["TRACEPARENT"] ||
    undefined
  );
}

// Validate the CloudEvent against the CloudEvents specification
export function isValidCloudEvent(event: unknown): event is CloudEvent {
  if (!event || typeof event !== "object") {
    return false;
  }

  const e = event as Record<string, unknown>;

  // Check required fields
  return (
    e.specversion === "1.0" &&
    typeof e.type === "string" &&
    typeof e.source === "string" &&
    typeof e.id === "string" &&
    typeof e.time === "string" &&
    typeof e.datacontenttype === "string" &&
    e.data !== undefined
  );
}

// Converts the CloudEvent to JSON
export function serializeCloudEvent(event: CloudEvent): string {
  return JSON.stringify(event);
}

// Parse the JSON string into a CloudEvent
export function deserializeCloudEvent(json: string): CloudEvent | null {
  try {
    const parsed = JSON.parse(json);
    if (isValidCloudEvent(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
