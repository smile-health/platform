// RabbitMQ Message Types i.e. structure of events coming from the message queue

export interface RabbitMQMessage {
  topic: string; // Routing key / topic of the message; e.g., 'order.created'
  payload: unknown;
  timestamp: number;
  headers?: Record<string, string>; // HTTP headers from the originating request
  messageId?: string; // Unique message ID for deduplication
  context?: MessageContext; // Context metadata from the originating service
  retryCount?: number; // RabbitMQ-level delivery attempt (0 = first delivery, 1 = first retry, ...)
}

// Context metadata from the originating service
export interface MessageContext {
  program_id?: string;
  workspace_id?: string;
  user_id?: string;
  user_email?: string;
  request_id?: string;
  trace_id?: string; // W3C Trace Context trace-id for distributed tracing
  client_key?: string; // Integration client discriminator (e.g. "siha", "din", "biofarma")
}

// Parsed/validated message ready for transformation
export interface ValidatedMessage extends RabbitMQMessage {
  payload: Record<string, unknown>;
  timestamp: number;
  headers: Record<string, string>;
}
