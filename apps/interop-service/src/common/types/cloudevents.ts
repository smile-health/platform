/**
 * CloudEvents Type Definitions that Implements CNCF CloudEvents Specification v1.0
 * See: https://cloudevents.io/
 */

// Core CloudEvent structure by v1.0 specification
// All required attributes are included; optional attributes can be added as needed
export interface CloudEvent<T = Record<string, unknown>> {
  specversion: "1.0"; // CloudEvents specification version
  type: string; // Event type; e.g., 'com.smile.order.created'
  source: string; // Event source URI/reference; e.g., 'urn:smile:orders'
  id: string; // Unique event identifier, should be a UUID v4
  time: string; // RFC 3339 timestamp of event occurrence
  datacontenttype: string; // e.g., 'application/json'
  dataschema?: string; // data schema URI; e.g., 'urn:smile:order:schema:v1'
  subject?: string; // originating context of the event; e.g., 'order_<order_id>'
  traceparent?: string; // W3C Trace Context traceparent header, for distributed tracing
  data: T; // Event payload of actual event data
  [key: string]: unknown; // For extension attributes, allow flexibility
}

// Type-safe CloudEvent builders for common SMILE event types
// Order created event
export interface OrderCreatedEvent extends CloudEvent<{
  order_id: string;
  customer_id: string;
  program_id: string;
  workspace_id?: string;
  amount: number;
  currency: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  created_at: string;
  [key: string]: unknown;
}> {}

// Order status change event
export interface OrderStatusChangeEvent extends CloudEvent<{
  order_id: string;
  status: string;
  previous_status?: string;
  program_id: string;
  workspace_id?: string;
  reason?: string;
  updated_at: string;
  [key: string]: unknown;
}> {}

// Generic CloudEvent for any SMILE event
export type SmileCloudEvent = CloudEvent<Record<string, unknown>>;

// CloudEvent envelope with metadata for routing
export interface CloudEventEnvelope {
  event: CloudEvent<Record<string, unknown>>;
  channelId: string; // OpenHIM channel ID for routing
  endpoint: string; // OpenHIM endpoint URL to send the event to
  httpMethod: string; // HTTP method to use (e.g., POST, PUT)
  headers: Record<string, string>; // Additional HTTP headers to include
  requestPath?: string; // request path that will override the default '/'
  maxRetries: number;
  expectedStatusCodes: number[];
}

/**
 * Result of CloudEvent processing
 */
export interface CloudEventProcessingResult {
  success: boolean;
  eventId: string;
  channelId: string;
  httpStatusCode?: number;
  executionTimeMs: number;
  errorMessage?: string;
  retryCount?: number;
}
