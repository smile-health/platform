/**
 * Core types for the rule-router mediator service
 */

// A single row from integration_routing_rules
export interface RoutingRule {
  id: number;
  topic: string;
  filter_key: string;       // e.g. 'client_key', 'program_id', 'header:X-Integration-Client', 'data.order_id'
  filter_operator: string;  // 'eq' | 'neq' | 'contains' | 'starts_with' | 'regex'
  filter_value: string;
  target_url: string;
  target_name: string;
  is_default: boolean;
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Result of evaluating a single rule against an incoming event
export interface MatchResult {
  rule: RoutingRule;
  matched: boolean;
  resolvedValue: string | undefined;  // the value that was compared
}

// Result of a single forwarded HTTP call
export interface ForwardResult {
  targetName: string;
  targetUrl: string;
  statusCode: number;
  responseBody: string;
  durationMs: number;
  error?: string;
}

// OpenHIM orchestration entry (one per forwarded call)
export interface OpenHIMOrchestration {
  name: string;
  request: {
    path: string;
    headers: Record<string, string>;
    querystring: string;
    body: string;
    method: string;
    timestamp: string;
  };
  response: {
    status: number;
    headers: Record<string, string>;
    body: string;
    timestamp: string;
  };
}

// Full OpenHIM mediator response format
export interface MediatorResponse {
  "x-mediator-urn": string;
  status: "Successful" | "Failed" | "Completed" | "Processing";
  response: {
    status: number;
    headers: Record<string, string>;
    body: string;
    timestamp: string;
  };
  orchestrations: OpenHIMOrchestration[];
  properties?: Record<string, string>;
}

// Parsed incoming CloudEvent + request context
export interface IncomingEvent {
  // CloudEvent fields
  id: string;
  type: string;
  topic: string;            // type with 'com.smile.' prefix stripped
  source: string;
  data: Record<string, unknown>;
  rawBody: string;

  // Extension attributes (may be absent)
  client_key?: string;
  program_id?: string;

  // Forwarded HTTP headers
  traceId?: string;
  requestId?: string;
  correlationId?: string;
  integrationClient?: string;  // X-Integration-Client header value
  incomingHeaders: Record<string, string>;
}
