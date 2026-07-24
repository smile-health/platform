/**
 * Base Transformer Class, Abstract base for all event transformers
 */

import { randomUUID } from "crypto";
import type { CloudEvent } from "../../common/types/cloudevents";
import type { MessageContext } from "../../common/types/message";

// Abstract base class for event transformers, Subclasses implement transform() for specific event types
export abstract class BaseTransformer {
  // The RabbitMQ topic this transformer handles, Examples: 'order.created', 'order.fulfilled'
  abstract readonly topic: string;

  // The CloudEvent type for this transformer, Examples: 'com.smile.order.created'
  abstract readonly cloudEventType: string;

  // Transforms raw event data to a CloudEvent
  abstract transform(
    payload: unknown,
    context?: MessageContext,
  ): CloudEvent<Record<string, unknown>>;

  // Extracts the subject (entity identifier) from the payload, Used for CloudEvent subject field
  abstract extractSubject(payload: unknown): string | undefined;

  // Creates a CloudEvent object with standard fields
  protected createCloudEvent(
    data: Record<string, unknown>,
    subject?: string,
    context?: MessageContext,
  ): CloudEvent<Record<string, unknown>> {
    const event: CloudEvent<Record<string, unknown>> = {
      specversion: "1.0",
      type: this.cloudEventType,
      source: "urn:smile:orders",
      id: randomUUID(),
      time: new Date().toISOString(),
      datacontenttype: "application/json",
      data,
    };

    if (subject) {
      event.subject = subject;
    }

    // Add context as extensions if provided
    if (context) {
      if (context.program_id) event.program_id = context.program_id;
      if (context.workspace_id) event.workspace_id = context.workspace_id;
      if (context.user_id) event.user_id = context.user_id;
      if (context.user_email) event.user_email = context.user_email;
      if (context.request_id) event.request_id = context.request_id;
      if (context.trace_id) event.trace_id = context.trace_id;
    }

    return event;
  }

  // Helper to safely extract a field from payload
  protected getField(payload: unknown, path: string): unknown {
    if (!payload || typeof payload !== "object") {
      return undefined;
    }

    const obj = payload as Record<string, unknown>;

    // Support nested paths like 'user.id'
    const parts = path.split(".");
    let current: unknown = obj;

    for (const part of parts) {
      if (current && typeof current === "object") {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  // Helper to validate required fields are present
  protected requireFields(payload: unknown, fields: string[]): void {
    if (!payload || typeof payload !== "object") {
      throw new Error("Payload must be an object");
    }

    const obj = payload as Record<string, unknown>;
    const missing = fields.filter((field) => obj[field] === undefined);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
  }

  // Helper to validate that a field has a specific type
  protected assertType(
    value: unknown,
    expectedType: string,
    fieldName: string,
  ): void {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw new Error(
        `Field '${fieldName}' must be ${expectedType}, got ${actualType}`,
      );
    }
  }
}

// Utility: Derives the CloudEvent type string from a RabbitMQ topic.
// Examples: "order.created"              → "com.smile.order.created"
export function topicToCloudEventType(topic: string): string {
  return `com.smile.${topic}`;
}

// PassThrough Transformer - the default for any topic that has no specific transformer.
// Wraps the raw SMILE payload into a CloudEvent as-is. This is the correct default when:
//   1. ENABLE_PAYLOAD_TRANSFORMATION = false (globally disabled)
//   2. A topic has no registered transformer in the registry (e.g. new topics added without custom logic).
export class PassThroughTransformer extends BaseTransformer {
  readonly topic: string;
  readonly cloudEventType: string;

  constructor(topic: string) {
    super();
    this.topic = topic;
    this.cloudEventType = topicToCloudEventType(topic);
  }

  transform(
    payload: unknown,
    context?: MessageContext,
  ): CloudEvent<Record<string, unknown>> {
    // Accept any payload shape - coerce to an object if not already one
    const data =
      payload !== null && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : { value: payload };

    return this.createCloudEvent(data, this.extractSubject(payload), context);
  }

  extractSubject(payload: unknown): string | undefined {
    // Try common identifier fields without requiring any specific one
    const id =
      this.getField(payload, "id") ?? this.getField(payload, "order_id");
    return id !== undefined ? String(id) : undefined;
  }
}

// Example: Order Created Transformer, Shows how to implement a transformer for a specific event type
export class OrderCreatedTransformer extends BaseTransformer {
  readonly topic = "order.created";
  readonly cloudEventType = "com.smile.order.created";

  private enableTransformation: boolean;

  constructor(env: { ENABLE_PAYLOAD_TRANSFORMATION: boolean }) {
    super();
    this.enableTransformation = env.ENABLE_PAYLOAD_TRANSFORMATION;
  }

  transform(
    payload: unknown,
    context?: MessageContext,
  ): CloudEvent<Record<string, unknown>> {
    // Validate required fields (SMILE uses 'id' not 'order_id')
    this.requireFields(payload, ["id", "customer_id"]);

    const obj = payload as Record<string, unknown>;

    // Extract subject
    const subject = this.extractSubject(payload);

    // Pass-through mode: Keep original SMILE structure
    if (!this.enableTransformation) {
      return this.createCloudEvent(
        obj, // Pass entire payload as-is
        subject,
        context,
      );
    }

    // Transform mode: Map fields and restructure
    const orderId = String(obj.id); // Map 'id' to 'order_id'
    const customerId = String(obj.customer_id);

    return this.createCloudEvent(
      {
        order_id: orderId, // Map from id
        customer_id: customerId,
        order_items: obj.order_items || [],
        created_at: obj.created_at || new Date().toISOString(),
        // Include all additional fields from SMILE order
        ...Object.keys(obj)
          .filter(
            (key) =>
              !["id", "customer_id", "order_items", "created_at"].includes(key),
          )
          .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {}),
      },
      subject,
      context,
    );
  }

  extractSubject(payload: unknown): string | undefined {
    const orderId = this.getField(payload, "id"); // Use 'id' field
    if (orderId) {
      return `order_${orderId}`;
    }
    return undefined;
  }
}
