# Interop Service

Version: 1.0.2
The interoperability layer between the SMILE platform and external health information systems via OpenHIM. It consumes order lifecycle events from RabbitMQ, transforms them into CloudEvents (v1.0), and routes them to the appropriate OpenHIM channels — with retry, audit logging, and observability built in.

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [System Integration](#system-integration)
3. [Architecture](#architecture)
4. [Dependencies](#dependencies)
5. [Environment Variables](#environment-variables)
6. [Running the Service](#running-the-service)
7. [Key Design Principles](#key-design-principles)
8. [What's Left](#whats-left)
9. [Future Improvements](#future-improvements)

---

## What It Does

- **Consumes** order lifecycle events published by `apps/main` to RabbitMQ fanout exchanges (one exchange per topic)
- **Validates** each message envelope using Zod schemas
- **Transforms** the raw SMILE payload into a CloudEvent (spec v1.0) — either via a topic-specific transformer or a PassThrough fallback
- **Routes** the CloudEvent to the correct OpenHIM channel via HTTP, using per-route configuration stored in MySQL
- **Retries** failed OpenHIM calls with exponential backoff (HTTP-level), and republishes undeliverable messages back to RabbitMQ (queue-level) up to a configurable limit before permanently dropping
- **Audits** every delivery attempt — success, failure, or drop — in `openhim_route_execution_logs` with full context (topic, channel, HTTP status, attempt number, user, request ID)
- **Forwards** request context (`X-Request-ID`, `X-Trace-ID`, `X-Integration-Client`) to OpenHIM on every call

---

## System Integration

```
┌─────────────────────┐
│     apps/main       │  Order lifecycle events published to RabbitMQ
│  (SMILE Platform)   │  with context block (user, program, request_id, client_key)
└────────┬────────────┘
         │ AMQP fanout exchange per topic
         ▼
┌─────────────────────┐
│     RabbitMQ        │  One exchange per topic; single interop-queue
│   (Message Broker)  │  Header-based retry via x-retry-count
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐        ┌──────────────────────┐
│   interop-service   │──HTTP──▶    OpenHIM Core       │
│   (this service)    │        │  (Transaction Router) │
└────────┬────────────┘        └──────────┬───────────┘
         │                               │
         │                    ┌──────────▼───────────┐
         │                    │  rule-router mediator │  Rule-based fan-out
         │                    │  (apps/openhim-       │  to downstream systems
         │                    │   mediators/rule-     │
         │                    │   router)             │
         │                    └──────────────────────┘
         │
         ▼
┌─────────────────────┐
│       MySQL         │  Route mappings + audit logs
│  (smile_interop DB) │
└─────────────────────┘
```

### Supported Topics

| RabbitMQ Topic                  | OpenHIM Channel               | OpenHIM Path                        |
| ------------------------------- | ----------------------------- | ----------------------------------- |
| `order.created`                 | smile-order-created-channel   | `/pub/smile/orders/order-created`   |
| `order.status.order.confirm`    | smile-order-confirmed-channel | `/pub/smile/orders/order-confirmed` |
| `order.status.order.cancel`     | smile-order-cancelled-channel | `/pub/smile/orders/order-cancelled` |
| `order.status.order.allocate`   | smile-order-allocated-channel | `/pub/smile/orders/order-allocated` |
| `order.status.order.shipped`    | smile-order-shipped-channel   | `/pub/smile/orders/order-shipped`   |
| `order.status.order.fullfilled` | smile-order-fulfilled-channel | `/pub/smile/orders/order-fulfilled` |
| `order.status.order.validated`  | smile-order-validated-channel | `/pub/smile/orders/order-validated` |

---

## Architecture

### Processing Pipeline

```
RabbitMQ Message
      │
      ▼
 EventConsumer          — validates x-retry-count header; enforces RABBITMQ_MAX_RETRIES
      │
      ▼
 RouterService.handleEvent()
      │
      ├─ 1. Validate message envelope (Zod)
      ├─ 2. Look up route mapping from in-memory cache (loaded from MySQL)
      ├─ 3. Build RouterContext (executionId, requestId, traceId, retryCount)
      ├─ 4. Transform payload → CloudEvent
      │       ├─ ENABLE_PAYLOAD_TRANSFORMATION=false → PassThroughTransformer (all topics)
      │       └─ ENABLE_PAYLOAD_TRANSFORMATION=true  → TransformerRegistry
      │               ├─ topic-specific transformer (e.g. OrderCreatedTransformer)
      │               └─ PassThroughTransformer fallback for unregistered topics
      ├─ 5. Send CloudEvent to OpenHIM via HTTP (with retry + backoff)
      │       └─ Headers: Content-Type, X-Request-ID, X-Trace-ID, X-Integration-Client
      └─ 6. Write audit log entry (success / failure)
              └─ On failure: ack + republish with x-retry-count++ (up to RABBITMQ_MAX_RETRIES)
                             or permanently drop with error log if limit exceeded
```

### Route Mapping Cache

Route mappings are loaded from `openhim_route_mappings` at startup into an in-memory `Map<topic, RouteMapping>`. A lightweight change-detection query (`MAX(updated_at) + COUNT(*)`) runs every `ROUTE_MAPPING_REFRESH_INTERVAL_MS` (default 90s) and triggers a full reload only when a change is detected. The `/admin/refresh-routes` HTTP endpoint forces an immediate reload.

### Retry Strategy

Two independent retry layers:

| Layer              | Mechanism                                                   | Config                                                                                                         |
| ------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **OpenHIM HTTP**   | Exponential backoff within the same delivery                | `OPENHIM_MAX_RETRIES`, `OPENHIM_RETRY_BACKOFF_MS`, `OPENHIM_RETRY_BACKOFF_MULTIPLIER` (or per-route DB values) |
| **RabbitMQ queue** | Message republished with `x-retry-count` header incremented | `RABBITMQ_MAX_RETRIES`                                                                                         |

Only routing failures (transformation succeeded, OpenHIM call failed) are retried at the RabbitMQ level. Validation errors and missing route mappings are dropped immediately — retrying won't help.

### CloudEvent Format

All events sent to OpenHIM conform to [CloudEvents spec v1.0](https://cloudevents.io/):

```json
{
  "specversion": "1.0",
  "type": "com.smile.order.created",
  "source": "urn:smile:orders",
  "id": "<uuid>",
  "time": "<ISO 8601>",
  "datacontenttype": "application/json",
  "subject": "order_<id>",
  "program_id": "<from context>",
  "user_id": "<from context>",
  "request_id": "<from context>",
  "data": { ... }
}
```

### HTTP Endpoints

| Method | Path                    | Description                                                  |
| ------ | ----------------------- | ------------------------------------------------------------ |
| GET    | `/health`               | Full health check (DB, RabbitMQ, OpenHIM, route mappings)    |
| GET    | `/ready`                | Kubernetes readiness probe — 503 until route mappings loaded |
| GET    | `/live`                 | Kubernetes liveness probe — always 200                       |
| GET    | `/info`                 | Service info, environment, active topics                     |
| GET    | `/admin/routes`         | Lists all enabled route mappings from cache                  |
| POST   | `/admin/refresh-routes` | Forces immediate reload of route mappings from DB            |

---

## Dependencies

| Dependency                           | Purpose                                                      | Required |
| ------------------------------------ | ------------------------------------------------------------ | -------- |
| **MySQL** (`smile_interop` database) | Route mapping config + audit logs                            | Yes      |
| **RabbitMQ**                         | Message source; retry republish                              | Yes      |
| **OpenHIM Core**                     | Transaction routing to downstream systems                    | Yes      |
| **Redis**                            | Reserved for future use (declared in env, not actively used) | No       |

### Database Setup

Run `db-scripts/schema.sql` manually to create the required tables:

- `openhim_route_mappings` — channel config, retry settings, auth per topic
- `openhim_route_execution_logs` — per-attempt audit trail

Then seed route mappings using either:

```bash
# Via CLI
node dist/src/cli.js seed

# Or directly
mysql -u <user> -p smile_interop < db-scripts/route-mapping-insert.sql
```

---

## Environment Variables

### Required

| Variable                | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `DB_HOST`               | MySQL host                                       |
| `DB_USER`               | MySQL username                                   |
| `DB_PASSWORD`           | MySQL password                                   |
| `RABBITMQ_HOST`         | RabbitMQ host                                    |
| `RABBITMQ_USERNAME`     | RabbitMQ username                                |
| `RABBITMQ_PASSWORD`     | RabbitMQ password                                |
| `OPENHIM_CLIENT_SECRET` | Client secret for OpenHIM channel authentication |
| `REDIS_HOST`            | Redis host                                       |

### Optional / Defaults

| Variable                            | Default                  | Description                                                              |
| ----------------------------------- | ------------------------ | ------------------------------------------------------------------------ |
| `PORT`                              | `4004`                   | HTTP server port                                                         |
| `NODE_ENV`                          | `development`            | `development` \| `production` \| `test`                                  |
| `LOG_LEVEL`                         | `info`                   | `debug` \| `info` \| `warn` \| `error`                                   |
| `LOG_FILE`                          | _(none)_                 | Base path for daily rotating log files (e.g. `logs/interop-service.log`) |
| `DB_PORT`                           | `3306`                   | MySQL port                                                               |
| `DB_NAME`                           | `smile_interop`          | MySQL database name                                                      |
| `RABBITMQ_PORT`                     | `5672`                   | RabbitMQ port                                                            |
| `RABBITMQ_PROTOCOL`                 | `amqp`                   | `amqp` or `amqps`                                                        |
| `RABBITMQ_MAX_RETRIES`              | `3`                      | Max queue-level republish attempts before dropping                       |
| `OPENHIM_API_ENDPOINT`              | `https://localhost:8080` | OpenHIM admin API (health checks)                                        |
| `OPENHIM_HTTP_HOST`                 | `localhost`              | OpenHIM transaction endpoint host                                        |
| `OPENHIM_HTTP_PORT`                 | `5000`                   | OpenHIM transaction endpoint port                                        |
| `OPENHIM_HTTP_PROTOCOL`             | `https`                  | `http` or `https`                                                        |
| `OPENHIM_CLIENT_ID`                 | `smile-app`              | Client ID for OpenHIM authentication                                     |
| `OPENHIM_REQUEST_TIMEOUT_MS`        | `30000`                  | Per-request timeout in ms                                                |
| `OPENHIM_REJECT_UNAUTHORIZED`       | `true`                   | TLS certificate validation                                               |
| `OPENHIM_MAX_RETRIES`               | `3`                      | Max HTTP retry attempts per OpenHIM call                                 |
| `OPENHIM_RETRY_BACKOFF_MS`          | `1000`                   | Initial backoff in ms                                                    |
| `OPENHIM_RETRY_BACKOFF_MULTIPLIER`  | `2`                      | Backoff multiplier (exponential)                                         |
| `ROUTE_MAPPING_REFRESH_INTERVAL_MS` | `90000`                  | Cache change-detection interval (0 = disabled)                           |
| `ENABLE_PAYLOAD_TRANSFORMATION`     | `false`                  | Enable topic-specific payload transformers                               |

> **Retry config priority**: Per-route `max_retries` in DB → `OPENHIM_MAX_RETRIES` env → hardcoded default (3)

---

## Running the Service

### Local Development

```bash
# Install dependencies (from repo root)
pnpm install

# Run with hot reload
pnpm --filter @smile/interop-service dev

# Build
pnpm --filter @smile/interop-service build

# Run compiled output (HTTP server + consumer)
pnpm --filter @smile/interop-service start

# Run as headless worker (consumer only, no HTTP server)
pnpm --filter @smile/interop-service worker
```

### CLI Tools

```bash
node dist/src/cli.js health           # Check all dependencies
node dist/src/cli.js seed             # Seed route mappings into DB
node dist/src/cli.js validate-config  # Validate env vars (prints config)
node dist/src/cli.js show-routes      # Display cached route mappings
node dist/src/cli.js refresh-routes   # Force reload from DB
node dist/src/cli.js test-event <topic>  # Send a test event through the router
```

### Docker

```bash
# Build image
docker compose build interop-service

# Start (with all infra dependencies)
docker compose up -d interop-service

# View logs
docker logs interop-service -f

# Health check
curl http://localhost:4004/health
```

The Dockerfile uses a two-stage build:

- **Builder**: `node:20-alpine` + pnpm (installs all deps, runs `tsc`)
- **Runtime**: `node:20-alpine` + npm (installs prod-only deps from the service's own `package.json`, isolated from the monorepo root)

---

## Key Design Principles

**1. DB-driven configuration, zero hardcoded routing**
All channel mappings, retry settings, auth config, and expected status codes live in `openhim_route_mappings`. Adding a new topic requires only a DB row and a service restart — no code changes.

**2. Two-layer retry without message loss**
HTTP-level retries (exponential backoff) handle transient OpenHIM failures within a single delivery. Queue-level republish (RabbitMQ header `x-retry-count`) handles failures that persist across HTTP retries. Messages are only permanently dropped after exhausting both layers — and every drop is logged.

**3. Selective retryability**
Only OpenHIM send failures (where transformation succeeded) are retried at the queue level. Validation errors and missing route mappings are dropped immediately — retrying the same bad message indefinitely wastes resources and never recovers.

**4. CloudEvents as the canonical wire format**
All payloads sent to OpenHIM conform to CloudEvents spec v1.0. This gives downstream systems a consistent envelope regardless of which SMILE event triggered it, and enables future event schema registry integration.

**5. Audit everything, never block on it**
Every delivery attempt — success, failure, or retry — is written to `openhim_route_execution_logs` with full context. Audit log write failures are caught and logged but never re-thrown — a logging failure must not prevent message acknowledgement.

**6. PassThrough as the safe default**
When `ENABLE_PAYLOAD_TRANSFORMATION=false` (the default), all payloads are wrapped as-is into a CloudEvent without any field mapping. This makes the service safe to deploy before topic-specific transformers are ready, and allows progressive rollout of transformation logic.

**7. Payload size guardrails**
Request payloads are truncated to 65,535 bytes (MySQL `text` column limit) before being written to the audit log, with a clear `...[TRUNCATED]` marker. Response bodies are stored only on failures to avoid inflating the audit table under normal operation.

**8. Context propagation end-to-end**
The SMILE request context (`program_id`, `user_id`, `user_email`, `request_id`, `client_key`) flows from `apps/main` → RabbitMQ message envelope → CloudEvent extension attributes → OpenHIM HTTP headers (`X-Request-ID`, `X-Integration-Client`) → audit log columns. This enables end-to-end tracing of any event back to the originating user and request.

---

## What's Left

### Known Gaps (pre-UAT)

| Gap                                        | Notes                                                                                                                                                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No automated tests**                     | Zero coverage — unit, integration, and contract tests all absent. This is the most significant quality gap. Deferred to a post-UAT sprint.                                                                |
| **No DB migration tooling**                | Schema managed via raw `db-scripts/schema.sql`. Kysely migrations configured but not populated. Schema changes require manual SQL execution.                                                              |
| **Topic-specific transformers incomplete** | Only `OrderCreatedTransformer` exists. All other topics use `PassThroughTransformer`. Full transformer implementation depends on the event schema registry (in progress by another team).                 |
| **Type safety gaps**                       | `routeMapping` and `cloudEvent` typed as `any` in two internal methods of `router.service.ts`. Will be resolved once the schema registry types are available.                                             |
| **Exchange list is static at startup**     | Adding a new topic to `openhim_route_mappings` requires a service restart to subscribe to the new RabbitMQ exchange. The route mapping cache refreshes automatically, but exchange subscription does not. |

---

## Future Improvements

### Resilience

- **Dead Letter Queue (DLQ)**: Messages that exhaust all retry attempts are currently logged and dropped. A DLQ would preserve them for manual replay or offline analysis.
- **Circuit breaker on OpenHIM**: If OpenHIM is continuously failing, the service currently retries every message. A circuit breaker (e.g. via `opossum`) would fast-fail during an outage and reduce noise in the audit log.
- **Idempotency keys**: The service does not deduplicate messages. If RabbitMQ redelivers a message after an ack timeout, it will be processed again. An idempotency store (Redis) using `messageId` would prevent duplicate deliveries reaching OpenHIM.
- **Dynamic exchange subscription**: Subscribe to new RabbitMQ exchanges at runtime when route mappings are added, without requiring a service restart.

### Scalability

- **Horizontal scaling**: Multiple instances can run in parallel since each pulls from the shared `interop-queue`. Increase `prefetch` count to tune per-instance throughput. Add a consumer group identifier to distinguish instances in logs.
- **Per-topic queues**: The current single-queue design means a slow topic can back up delivery for all other topics. Per-topic queues with independent prefetch and worker pools would provide true isolation.
- **Async audit logging**: Audit writes currently happen synchronously within the message processing path. Moving to a fire-and-forget write (or a dedicated audit queue) would reduce per-message latency.

### Observability

- **Metrics endpoint**: Expose Prometheus metrics — messages consumed/sec, OpenHIM latency histogram, retry rates, drop rates — via `/metrics`.
- **Distributed tracing**: The `traceparent` W3C header is parsed and forwarded but not used to start a trace span. Integrating OpenTelemetry would provide full traces from `apps/main` through to the downstream system.
- **Alerting**: No alerting exists on sustained failure rates or queue depth growth. This should be configured in the monitoring stack before go-live.

### Testing

- **Unit tests**: RouterService, TransformerRegistry, AuditLogRepository, OpenHIMClient retry logic
- **Integration tests**: Full pipeline with a test RabbitMQ instance and a mock OpenHIM endpoint
- **Contract tests**: Validate CloudEvent payloads against the event schema registry (once available)
- **Load tests**: Verify throughput and backpressure behaviour under sustained message volume

---

#### Webhooks Used By OpenHIM

- [https://play.svix.com/in/e_aLYCL1Au35Miep5CE8T6AMOkfa6/](https://play.svix.com/view/e_aLYCL1Au35Miep5CE8T6AMOkfa6)
  - SMILE Order Created Channel
  - SMILE Order Allocated Channel
  - SMILE Order Validated Channel
  - SMILE Order Cancelled Channel

- [https://tender-wind-91.webhook.cool](https://webhook.cool/at/tender-wind-91)
  - SMILE Order Created Channel
  - SMILE Order Confirmed Channel
  - SMILE Order Shipped Channel
  - SMILE Order Fulfilled Channel
  - SMILE Order Cancelled Channel

- [https://cool-bear-53.webhook.cool](https://webhook.cool/at/cool-bear-53)
  - SMILE Order events passing filters

---