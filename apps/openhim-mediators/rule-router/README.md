# rule-router

Version: 1.0.3
An OpenHIM mediator that receives routed CloudEvent payloads from OpenHIM and forwards them to one or more downstream OpenHIM adapter channels based on configurable rules stored in the database.

## What It Does

The rule-router is registered with OpenHIM as a mediator. When an OpenHIM channel is configured with a **Mediator Route** pointing to this service, OpenHIM forwards matching requests here. The mediator then:

1. Parses the incoming CloudEvent JSON to extract the topic and event attributes
2. Loads active routing rules for that topic from its in-memory cache
3. Evaluates filter conditions against the event (client key, program ID, data fields, headers)
4. Forwards the event to all matched OpenHIM adapter channels in parallel (fan-out)
5. Returns a structured OpenHIM mediator response with orchestration metadata

If no specific rules match, it falls back to `is_default=true` rules for the topic. If no rules exist for the topic at all, it returns a 200 with no routing performed — a no-op.

## System Integration

```
interop-service
      │
      │  POST CloudEvent to OpenHIM topic channel
      │  (topic → channel mapping in route_mappings table)
      ▼
OpenHIM Core
      │
      │  Channel has Mediator Route → rule-router
      │  OpenHIM forwards the request to this mediator
      ▼
rule-router  (port 4005)
      │
      │  Evaluates routing rules for the topic
      │  Each matched rule's target_url = an OpenHIM adapter channel path
      │
      │  Fan-out: POST to each matched adapter channel via OpenHIM (port 5000/5001)
      ▼
OpenHIM Core  (adapter channels — one per integration target)
      │
      ├──▶  Adapter Channel A  (e.g. /fhir-orders → FHIR Adapter)
      ├──▶  Adapter Channel B  (e.g. /wms-orders  → WMS Connector)
      └──▶  Adapter Channel N  (further fan-out targets)
```

**All outbound traffic from rule-router goes back through OpenHIM** — `target_url` in a routing rule is always an OpenHIM channel path (e.g. `/fhir-orders`), never a direct application URL. The adapter channels in OpenHIM carry their own routes to the final destinations.

**Routing rules** are stored in `integration_routing_rules` and loaded into an in-memory cache at startup. Optional periodic change-detection (`ROUTING_RULES_REFRESH_INTERVAL_MS`) reloads the cache only when the DB state actually changes.

## Architecture

### Request Pipeline

```
POST /route  (from OpenHIM)
  └─ Parse CloudEvent JSON
       └─ Resolve topic (strip "com.smile." prefix from event.type)
            └─ Load specific rules for topic  (in-memory cache)
                 └─ Evaluate filter rules  (routing.engine.ts)
                      ├─ Matches found?
                      │    └─ Fan-out: POST to each matched adapter channel via OpenHIM
                      ├─ No matches, default rules exist?
                      │    └─ Fan-out: POST to each default adapter channel via OpenHIM
                      └─ No rules configured for topic?
                           └─ Return 200, no routing performed
```

### Rule Evaluation

Each rule has a `filter_key`, `filter_operator`, and `filter_value`. Supported filter keys:

| Key | Resolves to |
|-----|-------------|
| `client_key` | CloudEvent extension `client_key` or `X-Integration-Client` header |
| `program_id` | CloudEvent extension `program_id` or `data.program_id` |
| `header:<name>` | Incoming HTTP header value (case-insensitive) |
| `data.<dot.path>` | Dot-notation path into the CloudEvent `data` object |
| `<anything else>` | Top-level CloudEvent extension attribute |

Supported operators: `eq` (default), `neq`, `contains`, `starts_with`, `regex`.

**ReDoS protection**: `regex` filter patterns are validated with `safe-regex` at both cache load time (unsafe rule is skipped with a structured warning log) and at evaluation time (belt-and-suspenders). The warning log includes `ruleId`, `topic`, `pattern`, and an explicit remediation hint: set `enabled=false` on the offending rule in DB. If complex patterns are needed in future, migrate to the `re2` engine (linear-time guarantee).

### Fan-out Failure Policy

All matched targets are forwarded concurrently via `Promise.all`. If **any** target returns a non-2xx response or times out, the overall mediator response is `"Failed"` (HTTP 502). OpenHIM surfaces this back to the interop-service, which treats 502 as a retryable failure and republishes via RabbitMQ.

### OpenHIM Registration

On startup, the service registers itself as an OpenHIM mediator and activates a heartbeat so it appears as "online" in the OpenHIM console. Registration failure is non-fatal — the service continues to handle routing requests regardless.

### Forwarded Headers

The following headers are propagated from the incoming request to each adapter channel call:

- `x-trace-id`
- `x-request-id`
- `x-correlation-id`
- `x-integration-client`
- `content-type`

## Dependencies

| Dependency | Purpose |
|---|---|
| **MySQL** (RDS) | Stores `integration_routing_rules`; shared with interop-service |
| **OpenHIM Core** | Source of inbound requests (via Mediator Route); destination for all fan-out calls to adapter channels |

## Environment Variables

### Required

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `OPENHIM_CLIENT_SECRET` | Client secret for Basic Auth when calling OpenHIM adapter channels |

### Optional (with defaults)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4005` | HTTP port this mediator listens on |
| `NODE_ENV` | `development` | `development`, `production`, or `test` |
| `LOG_LEVEL` | `info` | `debug`, `info`, `warn`, or `error` |
| `LOG_FILE` | _(none)_ | Base path for daily rotating log files (e.g. `logs/rule-router.log`) |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `smile_interop` | MySQL database name |
| `OPENHIM_API_ENDPOINT` | `https://localhost:8080` | OpenHIM admin API for mediator registration |
| `OPENHIM_ADMIN_EMAIL` | `admin@openhim.local` | OpenHIM admin email |
| `OPENHIM_ADMIN_PASSWORD` | `openhim` | OpenHIM admin password |
| `OPENHIM_HTTP_PROTOCOL` | `https` | Protocol for fan-out calls to OpenHIM adapter channels |
| `OPENHIM_HTTP_HOST` | `localhost` | OpenHIM host for fan-out calls |
| `OPENHIM_HTTP_PORT` | `5000` | OpenHIM port for fan-out calls (5000 = HTTPS, 5001 = HTTP) |
| `OPENHIM_CLIENT_ID` | `smile-app` | Client ID for Basic Auth on fan-out calls |
| `OPENHIM_REJECT_UNAUTHORIZED` | `true` | Validate TLS certificates when calling OpenHIM |
| `SERVICE_HOST` | `localhost` | Hostname OpenHIM uses to reach this mediator (used in mediator manifest) |
| `TARGET_REQUEST_TIMEOUT_MS` | `30000` | Timeout (ms) for each outbound fan-out HTTP request to OpenHIM |
| `ROUTING_RULES_REFRESH_INTERVAL_MS` | `0` | How often (ms) to check DB for rule changes. `0` = disabled. Uses lightweight change-detection — `MAX(updated_at)` + `COUNT(*)` — and only reloads when something actually changed. |

## Running the Service

### Local Development

```bash
# From the monorepo root
pnpm --filter rule-router dev
```

Requires a `.env` file in `apps/openhim-mediators/rule-router/` with at minimum `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `OPENHIM_CLIENT_SECRET`.

### Database Setup

The routing rules table is part of the shared `smile_interop` schema:

```bash
# Run once against the target DB (shared with interop-service)
mysql -h <host> -u <user> -p <database> < db-scripts/schema.sql
```

### Docker

```bash
# From the backend root
docker compose build openhim-rule-router-mediator
docker compose up -d --no-deps openhim-rule-router-mediator
```

### HTTP Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/route` | Main routing endpoint — called by OpenHIM when Mediator Route is activated |
| `GET` | `/health` | Health check (DB connectivity + cache loaded status) |
| `GET` | `/ready` | Readiness probe |
| `GET` | `/admin/rules` | Lists all cached routing rules — useful for debugging rule config |
| `POST` | `/admin/refresh-rules` | Manually triggers a cache reload from DB |

## Key Design Principles

1. **In-memory cache with change-detection**: Rules are loaded at startup and only reloaded when `MAX(updated_at)` or row count changes. No unnecessary DB polling per request.

2. **All fan-out goes through OpenHIM**: `target_url` in every routing rule is an OpenHIM channel path. The mediator never routes directly to application services — OpenHIM's adapter channels own the final delivery.

3. **Default rules as fallback**: `is_default=true` rules act as a catch-all for events that match no specific filter condition, preventing silent message loss.

4. **Fail-closed on partial failure**: A single failed or timed-out fan-out target fails the entire mediator response. OpenHIM surfaces this to interop-service which retries at the RabbitMQ level — no silent drops.

5. **Parallel fan-out**: All matched targets are forwarded concurrently. Latency is bounded by the slowest target, not the sum.

6. **Configurable timeouts**: `TARGET_REQUEST_TIMEOUT_MS` prevents indefinite hangs if an OpenHIM adapter channel is slow or unreachable.

7. **ReDoS protection**: Regex filter patterns are validated at both load time and evaluation time. Unsafe patterns are blocked and logged with full context and a remediation hint.

8. **Non-fatal registration**: OpenHIM mediator registration and heartbeat failures do not prevent the service from handling requests.

## What's Left (Known Gaps)

| Gap | Impact | Notes |
|---|---|---|
| No test coverage | Cannot validate rule evaluation logic in CI | Unit tests for `routing.engine.ts` (operator evaluation, dot-path resolution) are the highest-value addition |
| No per-target retry | A slow adapter channel fails the whole fan-out | Acceptable for now — interop-service retries at the message level via RabbitMQ |
| No circuit breaker | Repeated failures to a target still attempt each time | Add if adapter channel instability is observed in production |

## Future Improvements

- **Re2 engine for regex**: Replace `safe-regex` + `new RegExp()` with the `re2` package if complex regex patterns are needed — provides linear-time guarantee, eliminating ReDoS by design
- **Per-rule timeout**: Allow different `TARGET_REQUEST_TIMEOUT_MS` values per routing rule rather than one global value
- **Metrics**: Expose Prometheus metrics (rule match counts, fan-out durations, failure rates per adapter channel) for operational dashboards
- **Test infrastructure**: Unit tests for `routing.engine.ts`, integration tests for the full `/route` handler
