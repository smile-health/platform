# Configuration Reference

## `interop-service` Environment Variables

Source: [apps/interop-service/.env.example](../../apps/interop-service/.env.example)
Schema validation: [apps/interop-service/src/config/env.ts](../../apps/interop-service/src/config/env.ts)

### Application

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `NODE_ENV` | `development` | No | `development`, `production`, or `test` |
| `PORT` | `4004` | No | HTTP server port |
| `LOG_LEVEL` | `info` | No | `debug`, `info`, `warn`, `error` |
| `LOG_FILE` | — | No | If set, writes logs to this file path in addition to stdout |

### Database (MySQL)

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `DB_HOST` | — | **Yes** | MySQL host |
| `DB_PORT` | `3306` | No | MySQL port |
| `DB_NAME` | `smile_interop` | No | Database name |
| `DB_USER` | — | **Yes** | MySQL username |
| `DB_PASSWORD` | — | **Yes** | MySQL password |
| `DATABASE_URL` | — | No | Optional full connection URL (not used when individual DB_* vars are set) |

### RabbitMQ

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `RABBITMQ_HOST` | — | **Yes** | RabbitMQ hostname |
| `RABBITMQ_PORT` | `5672` | No | AMQP port |
| `RABBITMQ_USERNAME` | — | **Yes** | AMQP username |
| `RABBITMQ_PASSWORD` | — | **Yes** | AMQP password |
| `RABBITMQ_PROTOCOL` | `amqp` | No | `amqp` or `amqps` |
| `RABBITMQ_VHOST` | `/` | No | RabbitMQ virtual host |
| `RABBITMQ_MAX_RETRIES` | `3` | No | Max republish attempts before permanently dropping a message |

### Redis

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `REDIS_HOST` | — | **Yes** | Redis hostname |
| `REDIS_PORT` | `6379` | No | Redis port |
| `REDIS_PASSWORD` | — | No | Redis password (if auth enabled) |

### OpenHIM

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `OPENHIM_API_ENDPOINT` | `https://localhost:8080` | No | OpenHIM admin API URL (port 8080) — used for health checks |
| `OPENHIM_ADMIN_EMAIL` | `admin@openhim.local` | No | OpenHIM admin credentials for health check |
| `OPENHIM_ADMIN_PASSWORD` | `openhim` | **Yes** | OpenHIM admin password |
| `OPENHIM_HTTP_PROTOCOL` | `https` | No | Protocol for sending events to channels (`http` or `https`) |
| `OPENHIM_HTTP_HOST` | `localhost` | No | OpenHIM channel router host |
| `OPENHIM_HTTP_PORT` | `5000` | No | OpenHIM channel router port (`5000` for HTTPS, `5001` for HTTP) |
| `OPENHIM_CLIENT_ID` | `smile-app` | No | Client ID for Basic auth on channel requests |
| `OPENHIM_CLIENT_SECRET` | — | **Yes** | Client secret for Basic auth |
| `OPENHIM_REQUEST_TIMEOUT_MS` | `30000` | No | HTTP timeout per attempt (ms) |
| `OPENHIM_REJECT_UNAUTHORIZED` | `true` | No | Set `false` to accept self-signed TLS certs (dev/UAT only) |
| `OPENHIM_MAX_RETRIES` | `3` | No | Global retry limit (overridden per route via DB) |
| `OPENHIM_RETRY_BACKOFF_MS` | `1000` | No | Initial retry backoff in ms |
| `OPENHIM_RETRY_BACKOFF_MULTIPLIER` | `2` | No | Exponential multiplier (1s → 2s → 4s) |

### Routing Cache

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `ROUTE_MAPPING_REFRESH_INTERVAL_MS` | `90000` | No | How often to poll DB for route mapping changes (ms). Set `0` to disable — use `POST /admin/refresh-routes` manually instead |

### Transformation

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `ENABLE_PAYLOAD_TRANSFORMATION` | `false` | No | `false` = always use `PassThroughTransformer`. `true` = use topic-specific transformers from the registry (with `PassThroughTransformer` as fallback) |

---

## `rule-router` Environment Variables

Source: [apps/openhim-mediators/rule-router/.env.example](../../apps/openhim-mediators/rule-router/.env.example)

### Application

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `NODE_ENV` | `development` | No | `development` or `production` |
| `PORT` | `4005` | No | HTTP server port |
| `LOG_LEVEL` | `info` | No | `debug`, `info`, `warn`, `error` |
| `LOG_FILE` | — | No | Optional file path for log output |

### Database (MySQL)

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `DB_HOST` | `localhost` | **Yes** | MySQL host (same instance as interop-service) |
| `DB_PORT` | `3306` | No | MySQL port |
| `DB_NAME` | `smile_interop` | No | Database name (same DB as interop-service) |
| `DB_USER` | — | **Yes** | MySQL username |
| `DB_PASSWORD` | — | **Yes** | MySQL password |

### OpenHIM

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `OPENHIM_API_ENDPOINT` | `https://localhost:8080` | **Yes** | OpenHIM admin API for mediator registration |
| `OPENHIM_ADMIN_EMAIL` | `admin@openhim.local` | No | OpenHIM admin credentials |
| `OPENHIM_ADMIN_PASSWORD` | — | **Yes** | OpenHIM admin password |
| `OPENHIM_REJECT_UNAUTHORIZED` | `false` | No | Set `false` for self-signed TLS (dev/UAT) |
| `OPENHIM_CLIENT_ID` | `smile-app` | No | Client ID for forwarding to downstream channels |
| `OPENHIM_CLIENT_SECRET` | — | **Yes** | Client secret for forwarding requests |
| `OPENHIM_HTTP_PROTOCOL` | — | **Yes** | `http` or `https` |
| `OPENHIM_HTTP_HOST` | `localhost` | **Yes** | OpenHIM channel router host |
| `OPENHIM_HTTP_PORT` | `5000` | **Yes** | OpenHIM channel router port |
| `SERVICE_HOST` | `localhost` | **Yes** | Hostname OpenHIM uses to reach THIS mediator (for registration). In Kubernetes this must be the Service name |

### Routing Cache

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `ROUTING_CACHE_TTL_SECONDS` | `0` | No | Auto-refresh interval for routing rules (seconds). `0` = disabled, use `POST /admin/refresh-rules` manually |

---

## Environment-Specific Values

### Local Development

```bash
# interop-service
OPENHIM_HTTP_HOST=localhost
OPENHIM_HTTP_PORT=5001          # OpenHIM HTTP port
OPENHIM_REJECT_UNAUTHORIZED=false

# rule-router
SERVICE_HOST=localhost
OPENHIM_API_ENDPOINT=https://localhost:8080
OPENHIM_REJECT_UNAUTHORIZED=false
```

### Docker Compose

The [docker-compose.yml](../../docker-compose.yml) overrides these values automatically:

```bash
# Both services
OPENHIM_API_ENDPOINT=https://openhim-core:8080
OPENHIM_HTTP_PROTOCOL=http
OPENHIM_HTTP_HOST=openhim-core
OPENHIM_HTTP_PORT=5001
OPENHIM_REJECT_UNAUTHORIZED=false

# rule-router only
SERVICE_HOST=openhim-rule-router-mediator   # Docker container name
```

### Kubernetes

```bash
# Both services
OPENHIM_HTTP_HOST=openhim-core-svc          # K8s Service name
OPENHIM_HTTP_PORT=5001
OPENHIM_REJECT_UNAUTHORIZED=false

# rule-router only
SERVICE_HOST=rule-router-svc                # K8s Service name (OpenHIM calls back on this)
OPENHIM_API_ENDPOINT=https://openhim-core-svc:8080
```

---

## Database Tables

### `openhim_route_mappings`

One row per RabbitMQ topic. Owned and read by `interop-service`.

```sql
CREATE TABLE openhim_route_mappings (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  rabbitmq_topic          VARCHAR(255) NOT NULL UNIQUE,
  enabled                 BOOLEAN NOT NULL DEFAULT TRUE,
  openhim_channel_id      VARCHAR(255) NOT NULL,
  openhim_channel_name    VARCHAR(255) NOT NULL,
  http_method             VARCHAR(10)  NOT NULL DEFAULT 'POST',
  request_path            VARCHAR(500) NOT NULL,
  headers_json            JSON,
  include_context         BOOLEAN NOT NULL DEFAULT TRUE,
  auth_type               VARCHAR(50)  NOT NULL DEFAULT 'basic',
  max_retries             INT,                          -- NULL = use OPENHIM_MAX_RETRIES env
  retry_backoff_ms        INT,                          -- NULL = use OPENHIM_RETRY_BACKOFF_MS env
  retry_backoff_multiplier DECIMAL(4,2),                -- NULL = use OPENHIM_RETRY_BACKOFF_MULTIPLIER env
  expected_status_codes   VARCHAR(100) NOT NULL DEFAULT '200,201,202,204',
  created_by              VARCHAR(100),
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Column notes:**

- `rabbitmq_topic` — Exactly matches what SMILE publishes to RabbitMQ (case-sensitive)
- `request_path` — Must match the OpenHIM channel's URL pattern exactly
- `include_context` — When `TRUE`, `program_id`, `workspace_id`, `user_id`, `user_email`, `request_id`, `trace_id` are added as CloudEvent extension attributes
- `max_retries` / `retry_backoff_ms` / `retry_backoff_multiplier` — `NULL` falls back to environment variable defaults

### `openhim_route_execution_logs`

Append-only audit log. One row per processing attempt. Owned by `interop-service`.

```sql
CREATE TABLE openhim_route_execution_logs (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  rabbitmq_topic    VARCHAR(255) NOT NULL,
  order_id          VARCHAR(100),
  program_id        VARCHAR(50),
  openhim_channel_id VARCHAR(255) NOT NULL,
  openhim_endpoint  VARCHAR(500) NOT NULL,
  status            ENUM('success', 'failure', 'retry') NOT NULL,
  http_status_code  INT,
  execution_time_ms INT,
  attempt_number    INT NOT NULL DEFAULT 1,
  request_payload   TEXT,           -- CloudEvent JSON (truncated at 65k bytes)
  response_payload  TEXT,           -- OpenHIM response (failures only, truncated at 65k)
  error_message     TEXT,
  user_id           VARCHAR(100),
  user_email        VARCHAR(255),
  request_id        VARCHAR(100),
  trace_id          VARCHAR(255),
  created_at        DATETIME NOT NULL
);
```

**Querying useful audit information:**

```sql
-- Recent failures for a topic
SELECT status, error_message, http_status_code, execution_time_ms, created_at
FROM openhim_route_execution_logs
WHERE rabbitmq_topic = 'order.created'
  AND status = 'failure'
ORDER BY created_at DESC
LIMIT 20;

-- Success rate per topic (last 24h)
SELECT rabbitmq_topic,
       COUNT(*) AS total,
       SUM(status = 'success') AS successes,
       SUM(status = 'failure') AS failures,
       ROUND(AVG(execution_time_ms)) AS avg_ms
FROM openhim_route_execution_logs
WHERE created_at >= NOW() - INTERVAL 24 HOUR
GROUP BY rabbitmq_topic;

-- Slow executions
SELECT rabbitmq_topic, execution_time_ms, attempt_number, created_at
FROM openhim_route_execution_logs
WHERE execution_time_ms > 5000
ORDER BY execution_time_ms DESC
LIMIT 10;
```

### `integration_routing_rules`

Rule-based fan-out configuration. Multiple rows per topic. Owned by `rule-router`.

```sql
CREATE TABLE integration_routing_rules (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  topic           VARCHAR(100) NOT NULL,
  filter_key      VARCHAR(100) NOT NULL,
  filter_operator VARCHAR(20)  NOT NULL DEFAULT 'eq',
  filter_value    VARCHAR(500) NOT NULL,
  target_url      VARCHAR(500) NOT NULL,
  target_name     VARCHAR(255) NOT NULL,
  is_default      BOOLEAN      NOT NULL DEFAULT FALSE,
  priority        INT          NOT NULL DEFAULT 10,
  enabled         BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_topic   (topic),
  KEY idx_enabled (enabled)
);
```

**Column notes:**

- `topic` — Matches the CloudEvent type after stripping the `com.smile.` prefix (e.g. `order.created`)
- `filter_key` — See [architecture.md](architecture.md#routing-engine) for full resolution logic
- `filter_operator` — `eq`, `neq`, `contains`, `starts_with`, `regex`
- `target_url` — Path on OpenHIM (prepended with `OPENHIM_HTTP_PROTOCOL://OPENHIM_HTTP_HOST:OPENHIM_HTTP_PORT`)
- `is_default` — When `TRUE`, this rule is only used if no specific rules match. The `filter_key`/`filter_value` are ignored for default rules
- `priority` — Lower value = higher priority. Used for display and ordering in logs (does not affect which rules are applied — all matching rules are applied in parallel)

**Useful queries:**

```sql
-- All rules for a topic
SELECT filter_key, filter_operator, filter_value, target_name, is_default, enabled
FROM integration_routing_rules
WHERE topic = 'order.created'
ORDER BY is_default, priority;

-- Topics with no default fallback rule
SELECT DISTINCT topic
FROM integration_routing_rules
WHERE enabled = TRUE
  AND topic NOT IN (
    SELECT DISTINCT topic FROM integration_routing_rules
    WHERE is_default = TRUE AND enabled = TRUE
  );
```
