# Interop Layer Architecture

## Overview

The interop layer is a two-stage pipeline that connects SMILE's internal event bus (RabbitMQ) to external health information systems. OpenHIM acts as the integration middleware hub between the two stages.

The current implementation supports **outbound communication only** — SMILE publishes events that flow out to external systems. Inbound communication (external systems calling back into SMILE) is not yet implemented.

### Communication Direction

| Direction | Definition | Status |
|-----------|------------|--------|
| **Outbound** | SMILE → external system (e.g. SIHA, SITB, DHIS2) | Implemented |
| **Inbound** | External system → SMILE (e.g. acknowledgement, status update) | Not yet implemented |

```
                         ◄─── INBOUND (not yet implemented)
                         ──── OUTBOUND (implemented) ───►

┌─────────────────────────────────────────────────────────────────────┐
│                         SMILE Platform                              │
│  (Main Service, Warehouse Service, etc.)                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ [OUTBOUND] Publishes events
                               ▼
                         ┌──────────┐
                         │ RabbitMQ │
                         └────┬─────┘
                              │ [OUTBOUND] Consumes (topic-filtered)
                              ▼
              ┌───────────────────────────────┐
              │        interop-service        │  Stage 1
              │  • Validates message          │
              │  • Looks up route mapping     │
              │  • Transforms → CloudEvent    │
              │  • Sends to OpenHIM channel   │
              │  • Retries on failure         │
              │  • Writes audit log           │
              └───────────────┬───────────────┘
                              │ [OUTBOUND] HTTP POST (CloudEvent JSON)
                              ▼
                     ┌─────────────────┐
                     │   OpenHIM Core  │
                     │  (API Gateway)  │
                     └────────┬────────┘
                              │ [OUTBOUND] Routes to registered mediator
                              ▼
              ┌───────────────────────────────┐
              │       rule-router             │  Stage 2
              │  (OpenHIM Mediator)           │
              │  • Parses CloudEvent          │
              │  • Evaluates routing rules    │
              │  • Fan-out to targets         │
              │  • Returns orchestrations     │
              └───────┬──────────────┬────────┘
                      │              │  [OUTBOUND] Forward to targets
             ┌────────▼───┐   ┌──────▼──────┐
             │    SIHA    │   │    SITB     │  ... other systems
             │  Adapter   │   │  Adapter    │
             └────────────┘   └─────────────┘
```

## Stage 1: `interop-service`

### Responsibility

Bridges RabbitMQ and OpenHIM. It owns **topic-level routing** — determining which OpenHIM channel a given event type maps to.

### Processing Pipeline (per message)

```
RabbitMQ Message
      │
      ▼ Step 1
  Validate message envelope
  (Zod schema: topic, payload, context, headers)
      │ fail → log + discard
      ▼ Step 2
  Look up route mapping from in-memory cache
  (openhim_route_mappings table, keyed by rabbitmq_topic)
      │ miss or disabled → log + discard
      ▼ Step 3
  Build RouterContext
  (executionId, traceId from headers, requestId, messageContext)
      │
      ▼ Step 4
  Transform payload → CloudEvent
  ┌─────────────────────────────────────────┐
  │ ENABLE_PAYLOAD_TRANSFORMATION = false   │ → PassThroughTransformer (always)
  │ ENABLE_PAYLOAD_TRANSFORMATION = true    │ → TransformerRegistry.get(topic)
  │   Registry has specific transformer?    │   → use it
  │   Registry has no transformer?          │   → PassThroughTransformer (fallback)
  └─────────────────────────────────────────┘
      │ error → audit log failure + discard
      ▼ Step 5
  Send CloudEvent to OpenHIM via HTTP POST
  (with retry + exponential backoff)
      │
      ▼ Step 6
  Write audit log to openhim_route_execution_logs
  (success or failure with full metadata)
```

### Key Design Decisions

**In-memory cache for route mappings**
Route mappings are loaded from MySQL at startup into a `Map<topic, RouteMapping>`. A lightweight `MAX(updated_at) + COUNT(*)` poll runs every 90 seconds (configurable) to detect changes without a full reload. The admin `POST /admin/refresh-routes` forces an immediate reload.

**Two-layer transformation**
The global `ENABLE_PAYLOAD_TRANSFORMATION` flag lets the entire transformation layer be bypassed for pass-through mode. When enabled, the `TransformerRegistry` provides per-topic transformers with `PassThroughTransformer` as the automatic fallback for unregistered topics.

**CloudEvent wrapping**
Every payload leaving `interop-service` is a valid [CloudEvents 1.0](https://cloudevents.io/) JSON document:
```json
{
  "specversion": "1.0",
  "type": "com.smile.order.created",
  "source": "urn:smile:orders",
  "id": "<uuid>",
  "time": "<ISO8601>",
  "datacontenttype": "application/json",
  "subject": "order_42",
  "program_id": "4",
  "user_id": "7",
  "data": { ...original SMILE payload... }
}
```

**Retry with exponential backoff**
Per-route configuration (`max_retries`, `retry_backoff_ms`, `retry_backoff_multiplier`) overrides the global defaults. All attempts are audit-logged.

### HTTP API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Full health check (DB, RabbitMQ, OpenHIM, cache) |
| GET | `/ready` | Readiness probe — 200 only when route cache is loaded |
| GET | `/live` | Liveness probe — always 200 |
| GET | `/info` | Service metadata + list of active topics |
| GET | `/admin/routes` | List all enabled route mappings from cache |
| POST | `/admin/refresh-routes` | Force reload route mappings from DB |

### Infrastructure Dependencies

| Dependency | Usage |
|------------|-------|
| MySQL (`smile_interop`) | Route mappings + audit logs |
| RabbitMQ | Source of all SMILE events |
| Redis | Available but currently used for caching (not core routing) |
| OpenHIM Core | HTTP destination for transformed events |

---

## Stage 2: `rule-router` (OpenHIM Mediator)

### Responsibility

Registered with OpenHIM as a mediator (`urn:mediator:smile-rule-router`). It owns **client/program-level routing** — determining which downstream system(s) to send each CloudEvent to, and handling fan-out.

### Processing Pipeline (per HTTP request from OpenHIM)

```
POST /route (CloudEvent JSON from interop-service)
      │
      ▼ Step 1
  Parse request body as CloudEvent JSON
  Extract topic from CloudEvent type
  (strips 'com.smile.' prefix → topic e.g. 'order.created')
      │
      ▼ Step 2
  Build IncomingEvent
  (id, type, topic, source, data, all headers, client_key, program_id)
      │
      ▼ Step 3
  Load rules from cache for this topic
  (specific rules + default rules separately)
      │
      ▼ Step 4
  Evaluate specific rules via routing engine
  (filter_key + filter_operator + filter_value against IncomingEvent)
      │
      ├── matched rules found → use matched rules
      ├── no matches + default rules exist → use default rules
      └── no rules at all → return 200 "no routing configured"
      │
      ▼ Step 5
  Forward to ALL target rules in parallel
  (HTTP POST with Basic auth, forwarded trace headers)
      │
      ▼ Step 6
  Build OpenHIM mediator response
  (status: Successful/Failed, orchestrations array per target)
  Return to OpenHIM → OpenHIM returns to interop-service
```

### Routing Engine

The engine evaluates filter rules against the `IncomingEvent`. Filter key resolution:

| Filter Key | Resolves to |
|------------|-------------|
| `client_key` | `event.client_key` or `X-Integration-Client` header |
| `program_id` | `event.program_id` or `event.data.program_id` |
| `header:<name>` | HTTP header value (case-insensitive) |
| `data.<dot.path>` | Nested field inside CloudEvent `data` object |
| `<anything else>` | CloudEvent top-level extension attribute |

Supported operators: `eq`, `neq`, `contains`, `starts_with`, `regex`

**Fan-out failure policy**: if ANY forwarded call fails, the overall status is `Failed`. OpenHIM returns non-2xx to `interop-service`, which retries via its configured backoff.

### OpenHIM Registration

On startup, `rule-router` calls `registerMediator()` from `openhim-mediator-utils`. Registration is non-fatal — the service continues serving requests even if OpenHIM is temporarily unreachable. A heartbeat interval is activated after successful registration so the mediator appears online in the OpenHIM console.

### HTTP API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/route` | Main mediator endpoint (called by OpenHIM) |
| GET | `/health` | Health check (DB + rules cache status) |
| GET | `/ready` | Readiness probe |
| GET | `/live` | Liveness probe |
| GET | `/admin/rules` | List all enabled routing rules from cache |
| POST | `/admin/refresh-rules` | Force reload routing rules from DB |

### Infrastructure Dependencies

| Dependency | Usage |
|------------|-------|
| MySQL (`smile_interop`) | `integration_routing_rules` table |
| OpenHIM Core | Registration, heartbeat, and receives all inbound traffic |

---

## Database Schema

Both services share the `smile_interop` MySQL database.

### `openhim_route_mappings` (owned by `interop-service`)

Maps a RabbitMQ topic to an OpenHIM channel. One row per topic.

| Column | Type | Description |
|--------|------|-------------|
| `rabbitmq_topic` | VARCHAR | RabbitMQ topic key e.g. `order.created` |
| `enabled` | BOOLEAN | Whether this mapping is active |
| `openhim_channel_id` | VARCHAR | OpenHIM channel identifier |
| `openhim_channel_name` | VARCHAR | Human-readable channel name |
| `request_path` | VARCHAR | URL path on OpenHIM e.g. `/pub/smile/orders/order-created` |
| `http_method` | VARCHAR | Always `POST` |
| `include_context` | BOOLEAN | Whether to embed `program_id`, `user_id` etc. as CloudEvent extensions |
| `max_retries` | INT | Per-route retry limit (overrides env default) |
| `retry_backoff_ms` | INT | Initial backoff in ms |
| `retry_backoff_multiplier` | DECIMAL | Exponential multiplier |
| `expected_status_codes` | VARCHAR | Comma-separated accepted HTTP codes e.g. `200,201,202,204` |

### `openhim_route_execution_logs` (owned by `interop-service`)

Full audit trail of every event processed.

| Column | Type | Description |
|--------|------|-------------|
| `rabbitmq_topic` | VARCHAR | Source topic |
| `order_id` | VARCHAR | Extracted from payload |
| `program_id` | VARCHAR | Extracted from CloudEvent context |
| `openhim_channel_id` | VARCHAR | Target channel |
| `openhim_endpoint` | VARCHAR | Full URL called |
| `status` | ENUM | `success`, `failure`, `retry` |
| `http_status_code` | INT | Response HTTP code |
| `execution_time_ms` | INT | Total time including retries |
| `attempt_number` | INT | Which retry attempt this was |
| `request_payload` | TEXT | CloudEvent JSON sent (truncated at 65k) |
| `response_payload` | TEXT | OpenHIM response (failures only) |
| `error_message` | TEXT | Error description on failure |
| `trace_id` | VARCHAR | W3C traceparent propagated from SMILE |
| `request_id` | VARCHAR | Originating request ID from SMILE |

### `integration_routing_rules` (owned by `rule-router`)

Rule-based fan-out configuration. Multiple rows per topic.

| Column | Type | Description |
|--------|------|-------------|
| `topic` | VARCHAR | Event topic e.g. `order.created` |
| `filter_key` | VARCHAR | Field to evaluate e.g. `program_id`, `client_key`, `data.item_id` |
| `filter_operator` | VARCHAR | `eq`, `neq`, `contains`, `starts_with`, `regex` |
| `filter_value` | VARCHAR | Expected value |
| `target_url` | VARCHAR | Path on OpenHIM to forward to e.g. `/adapter/sitb/orders` |
| `target_name` | VARCHAR | Human label for orchestration logs |
| `is_default` | BOOLEAN | Used when no specific rules match |
| `priority` | INT | Lower = higher priority (for display/ordering) |
| `enabled` | BOOLEAN | Whether this rule is active |

---

## Communication Patterns

### Outbound (SMILE → External Systems)

The currently implemented direction. SMILE publishes a business event internally; the interop layer picks it up and delivers it to one or more external health systems.

**Trigger**: A business action in SMILE (order created, order confirmed, stock adjusted, etc.) causes an internal service to publish a message to RabbitMQ.

**Message format at each stage:**

```
Stage          Format                    Protocol
─────────────────────────────────────────────────────────────
SMILE → MQ     Raw SMILE event JSON      RabbitMQ AMQP
MQ → interop   RabbitMQ message          AMQP consumer
interop → OHM  CloudEvent JSON           HTTP POST (Basic auth)
OHM → router   CloudEvent JSON           HTTP POST (Basic auth)
router → ext   CloudEvent JSON           HTTP POST (Basic auth)
```

**Sample outbound RabbitMQ message** (what SMILE publishes):

```json
{
  "topic": "order.created",
  "payload": {
    "id": 42,
    "customer_id": 7,
    "program_id": 4,
    "workspace_id": 2,
    "status": "created",
    "order_items": [
      { "item_id": 101, "quantity": 10, "unit": "vial" }
    ],
    "created_at": "2025-03-09T08:00:00.000Z",
    "created_by": 3
  },
  "context": {
    "program_id": 4,
    "workspace_id": 2,
    "user_id": 3,
    "user_email": "pharmacist@example.com",
    "request_id": "req-abc-001",
    "trace_id": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
    "client_key": "sitb"
  },
  "headers": {
    "traceparent": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"
  }
}
```

**Sample CloudEvent** (what `interop-service` sends to OpenHIM):

```json
{
  "specversion": "1.0",
  "type": "com.smile.order.created",
  "source": "urn:smile:orders",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "time": "2025-03-09T08:00:01.123Z",
  "datacontenttype": "application/json",
  "subject": "order_42",
  "program_id": "4",
  "workspace_id": "2",
  "user_id": "3",
  "user_email": "pharmacist@example.com",
  "request_id": "req-abc-001",
  "trace_id": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
  "client_key": "sitb",
  "data": {
    "id": 42,
    "customer_id": 7,
    "program_id": 4,
    "workspace_id": 2,
    "status": "created",
    "order_items": [
      { "item_id": 101, "quantity": 10, "unit": "vial" }
    ],
    "created_at": "2025-03-09T08:00:00.000Z",
    "created_by": 3
  }
}
```

**HTTP request from `interop-service` to OpenHIM:**

```
POST https://openhim-core:5000/pub/smile/orders/order-created HTTP/1.1
Authorization: Basic c21pbGUtYXBwOjxzZWNyZXQ+
Content-Type: application/json
X-Trace-ID: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
X-Request-ID: req-abc-001
X-Integration-Client: sitb

{ ...CloudEvent JSON above... }
```

**HTTP request from `rule-router` to downstream system (SITB adapter):**

```
POST https://openhim-core:5000/adapter/sitb/orders HTTP/1.1
Authorization: Basic c21pbGUtYXBwOjxzZWNyZXQ+
Content-Type: application/json
X-Trace-ID: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
X-Request-ID: req-abc-001
X-Integration-Client: sitb

{ ...same CloudEvent JSON forwarded as-is... }
```

**OpenHIM mediator response** (what `rule-router` returns to OpenHIM):

```json
{
  "x-mediator-urn": "urn:mediator:smile-rule-router",
  "status": "Successful",
  "response": {
    "status": 200,
    "headers": { "content-type": "application/json" },
    "body": "{\"routed\":true,\"topic\":\"order.created\",\"targets\":[{\"name\":\"Program 4 (TB) - Order Created\",\"status\":200}]}",
    "timestamp": "2025-03-09T08:00:01.500Z"
  },
  "orchestrations": [
    {
      "name": "Program 4 (TB) - Order Created",
      "request": {
        "path": "/adapter/sitb/orders",
        "headers": { "content-type": "application/json", "x-trace-id": "00-4bf..." },
        "body": "{ ...CloudEvent JSON... }",
        "method": "POST",
        "timestamp": "2025-03-09T08:00:01.400Z"
      },
      "response": {
        "status": 200,
        "headers": {},
        "body": "{\"received\":true}",
        "timestamp": "2025-03-09T08:00:01.490Z"
      }
    }
  ]
}
```

---

### Inbound (External Systems → SMILE) — Not Yet Implemented

Inbound communication would allow external systems (SIHA, SITB, DHIS2) to push data or acknowledgements back into SMILE. This direction is not currently implemented.

**Planned approach** (when needed):

```
External System
      │ HTTP POST
      ▼
  OpenHIM Core          ← receives and authenticates the call
      │
      ▼
  Inbound Mediator      ← validates, transforms to SMILE format (to be built)
      │
      ▼
  SMILE API / Queue     ← processes the inbound data
```

When implementing inbound:
1. Create a new OpenHIM channel for each inbound endpoint
2. Build a new mediator (or extend `rule-router`) to handle inbound validation and transformation
3. Forward to the appropriate SMILE API endpoint or publish to RabbitMQ for async processing
4. Return a standard acknowledgement response to the external system

---

## Request Flow: End to End

The following trace shows `order.created` for program_id=4 (TB program) flowing to SITB:

```
1. SMILE Main Service
   publishes → RabbitMQ topic: "order.created"
   payload: { id: 42, customer_id: 7, program_id: 4, ... }

2. interop-service consumes message
   route mapping lookup: "order.created" → "smile-order-created-channel"
   transformer: PassThroughTransformer (or OrderCreatedTransformer)
   CloudEvent built:
     type: "com.smile.order.created"
     program_id: "4"      ← from message context
     client_key: "siha"   ← from message context
     data: { id: 42, ... }

3. interop-service → OpenHIM (HTTP POST)
   POST https://openhim-core:5000/pub/smile/orders/order-created
   Headers: X-Trace-ID, X-Request-ID, X-Integration-Client: siha
   Body: <CloudEvent JSON>

4. OpenHIM Core
   authenticates client "smile-app"
   matches channel "SMILE Order Created Channel"
   routes to mediator "rule-router" → POST /route

5. rule-router evaluates rules for topic "order.created"
   rule: program_id eq "4" → target: /adapter/sitb/orders
   → forwards CloudEvent to /adapter/sitb/orders

6. SITB Adapter receives CloudEvent, processes order

7. rule-router returns OpenHIM mediator response
   { status: "Successful", orchestrations: [{ name: "Program 4 (TB) - Order Created", ... }] }

8. interop-service receives 200 → writes success audit log
```

---

## Sequence Diagram

```
SMILE        RabbitMQ   interop-service      OpenHIM     rule-router    SITB
  │              │             │                │               │          │
  │─publish────►│             │                │               │          │
  │              │─consume────►│                │               │          │
  │              │             │─validate────►  │               │          │
  │              │             │─transform───►  │               │          │
  │              │             │─POST /pub/──►  │               │          │
  │              │             │                │─POST /route──►│          │
  │              │             │                │               │─eval─────│
  │              │             │                │               │─POST ───►│
  │              │             │                │               │◄─200─────│
  │              │             │                │◄──200─────────│          │
  │              │             │◄──200──────────│               │          │
  │              │             │─audit log──►DB │               │          │
```
