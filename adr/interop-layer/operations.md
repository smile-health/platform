# Operations Guide

## Running Locally (Development)

### Prerequisites

Start the shared infrastructure first:

```bash
# From repo root — starts MySQL, RabbitMQ, Redis, OpenHIM
docker compose \
  -f infra/compose-database.yml \
  -f infra/compose-message.yml \
  -f infra/compose-storage.yml \
  -f infra/compose-openhim.yml \
  up -d
```

### Database Setup (one-time)

```bash
# Create tables for interop-service
mysql -h localhost -u <user> -p smile_interop \
  < apps/interop-service/db-scripts/schema.sql

# Create tables for rule-router
mysql -h localhost -u <user> -p smile_interop \
  < apps/openhim-mediators/rule-router/db-scripts/schema.sql

# Seed initial route mappings
mysql -h localhost -u <user> -p smile_interop \
  < apps/interop-service/db-scripts/route-mapping-insert.sql

# Seed initial routing rules
mysql -h localhost -u <user> -p smile_interop \
  < apps/openhim-mediators/rule-router/db-scripts/routing-rules-insert.sql
```

Verify:
```sql
USE smile_interop;
SHOW TABLES;
-- Expected:
-- openhim_route_mappings
-- openhim_route_execution_logs
-- integration_routing_rules
```

### Configure `.env` Files

```bash
cp apps/interop-service/.env.example apps/interop-service/.env
cp apps/openhim-mediators/rule-router/.env.example apps/openhim-mediators/rule-router/.env
```

Minimum required values to fill in both files:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`
- `RABBITMQ_HOST`, `RABBITMQ_USERNAME`, `RABBITMQ_PASSWORD` (interop-service only)
- `OPENHIM_ADMIN_PASSWORD`, `OPENHIM_CLIENT_SECRET`
- `SERVICE_HOST=localhost` (rule-router only)

### Start Services

```bash
# Terminal 1 — interop-service (port 4004)
cd apps/interop-service
pnpm install
pnpm dev

# Terminal 2 — rule-router (port 4005)
cd apps/openhim-mediators/rule-router
pnpm install
pnpm dev
```

Verify:
```bash
curl http://localhost:4004/health
curl http://localhost:4004/info
curl http://localhost:4005/health
```

---

## Running via Docker Compose

The root [docker-compose.yml](../../docker-compose.yml) has both services pre-wired with correct Docker network and OpenHIM overrides.

```bash
# Start infra first (if not already running)
docker compose \
  -f infra/compose-database.yml \
  -f infra/compose-message.yml \
  -f infra/compose-storage.yml \
  -f infra/compose-openhim.yml \
  up -d

# Build and start the interop services
docker compose up --build interop-service openhim-rule-router-mediator

# Or rebuild a single service
docker compose up --build interop-service
```

The compose file automatically applies these Docker-specific overrides (no manual .env editing needed):

| Variable | Docker Value |
|----------|-------------|
| `NODE_ENV` | `production` |
| `OPENHIM_API_ENDPOINT` | `https://openhim-core:8080` |
| `OPENHIM_HTTP_PROTOCOL` | `http` |
| `OPENHIM_HTTP_HOST` | `openhim-core` |
| `OPENHIM_HTTP_PORT` | `5001` |
| `OPENHIM_REJECT_UNAUTHORIZED` | `false` |
| `SERVICE_HOST` *(rule-router)* | `openhim-rule-router-mediator` |

Ports exposed on localhost:
- `interop-service`: `127.0.0.1:4004`
- `rule-router`: `127.0.0.1:4005`

---

## Deploying to Kubernetes

No K8s manifests currently exist in the repo. Create them under `k8s/interop-layer/`.

### Step 1 — Build and Push Images

Images must be built from the **repo root** (the Dockerfiles use the monorepo context):

```bash
docker build \
  -f apps/interop-service/Dockerfile \
  -t your-registry/interop-service:latest \
  .

docker build \
  -f apps/openhim-mediators/rule-router/Dockerfile \
  -t your-registry/rule-router:latest \
  .

docker push your-registry/interop-service:latest
docker push your-registry/rule-router:latest
```

### Step 2 — Create Secrets

```bash
kubectl create secret generic interop-service-env \
  --from-env-file=apps/interop-service/.env

kubectl create secret generic rule-router-env \
  --from-env-file=apps/openhim-mediators/rule-router/.env
```

### Step 3 — `interop-service` Deployment

```yaml
# k8s/interop-layer/interop-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: interop-service
  labels:
    app: interop-service
spec:
  replicas: 1                     # IMPORTANT: Keep at 1. Single RabbitMQ consumer.
  selector:
    matchLabels:
      app: interop-service
  template:
    metadata:
      labels:
        app: interop-service
    spec:
      containers:
        - name: interop-service
          image: your-registry/interop-service:latest
          ports:
            - containerPort: 4004
          envFrom:
            - secretRef:
                name: interop-service-env
          env:
            - name: NODE_ENV
              value: production
            - name: OPENHIM_HTTP_HOST
              value: openhim-core-svc        # K8s Service name for OpenHIM
            - name: OPENHIM_HTTP_PORT
              value: "5001"
            - name: OPENHIM_REJECT_UNAUTHORIZED
              value: "false"
          livenessProbe:
            httpGet:
              path: /live
              port: 4004
            initialDelaySeconds: 30
            periodSeconds: 30
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 4004
            initialDelaySeconds: 15
            periodSeconds: 10
            failureThreshold: 3
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: interop-service-svc
spec:
  selector:
    app: interop-service
  ports:
    - port: 4004
      targetPort: 4004
```

### Step 4 — `rule-router` Deployment

```yaml
# k8s/interop-layer/rule-router.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rule-router
  labels:
    app: rule-router
spec:
  replicas: 2                     # Stateless HTTP — safe to scale horizontally
  selector:
    matchLabels:
      app: rule-router
  template:
    metadata:
      labels:
        app: rule-router
    spec:
      containers:
        - name: rule-router
          image: your-registry/rule-router:latest
          ports:
            - containerPort: 4005
          envFrom:
            - secretRef:
                name: rule-router-env
          env:
            - name: NODE_ENV
              value: production
            - name: SERVICE_HOST
              value: rule-router-svc         # Must match K8s Service name below
            - name: OPENHIM_API_ENDPOINT
              value: https://openhim-core-svc:8080
            - name: OPENHIM_HTTP_HOST
              value: openhim-core-svc
            - name: OPENHIM_HTTP_PORT
              value: "5001"
            - name: OPENHIM_REJECT_UNAUTHORIZED
              value: "false"
          livenessProbe:
            httpGet:
              path: /live
              port: 4005
            initialDelaySeconds: 30
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /ready
              port: 4005
            initialDelaySeconds: 15
            periodSeconds: 10
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 300m
              memory: 256Mi
---
apiVersion: v1
kind: Service
metadata:
  name: rule-router-svc
spec:
  selector:
    app: rule-router
  ports:
    - port: 4005
      targetPort: 4005
```

### Step 5 — Apply and Verify

```bash
kubectl apply -f k8s/interop-layer/interop-service.yaml
kubectl apply -f k8s/interop-layer/rule-router.yaml

kubectl rollout status deployment/interop-service
kubectl rollout status deployment/rule-router

kubectl get pods -l app=interop-service
kubectl get pods -l app=rule-router
```

### Updating to a New Image Version

```bash
kubectl set image deployment/interop-service \
  interop-service=your-registry/interop-service:v1.x

kubectl set image deployment/rule-router \
  rule-router=your-registry/rule-router:v1.x

kubectl rollout status deployment/interop-service
```

---

## Admin Endpoints

Both services expose admin endpoints for live management without restarts.

### `interop-service` (port 4004)

```bash
# Force reload route mappings from DB
curl -X POST http://localhost:4004/admin/refresh-routes

# List all enabled route mappings (from cache)
curl http://localhost:4004/admin/routes | jq '.routes[] | {topic: .rabbitmq_topic, channel: .openhim_channel_id, enabled: .enabled}'

# Full health check (DB + RabbitMQ + OpenHIM + cache)
curl http://localhost:4004/health

# Service info + active topics
curl http://localhost:4004/info
```

### `rule-router` (port 4005)

```bash
# Force reload routing rules from DB
curl -X POST http://localhost:4005/admin/refresh-rules

# List all enabled routing rules (from cache)
curl http://localhost:4005/admin/rules | jq '.rules[] | {topic: .topic, filter: .filter_key, target: .target_name}'

# Health check
curl http://localhost:4005/health
```

---

## Health Probes Summary

| Probe | interop-service | rule-router |
|-------|----------------|-------------|
| **Liveness** (`/live`) | Always 200 — process is alive | Always 200 |
| **Readiness** (`/ready`) | 200 only when route mapping cache is loaded | 200 only when routing rules cache is loaded |
| **Health** (`/health`) | Checks DB, RabbitMQ, OpenHIM API, cache | Checks DB, cache |

The readiness probe is critical at startup. Kubernetes will not route traffic until the cache is loaded (route mappings or routing rules are read from the DB successfully).

---

## Scaling Considerations

| Service | Safe to Scale? | Notes |
|---------|---------------|-------|
| `interop-service` | **No (keep 1 replica)** | Single RabbitMQ consumer. Multiple replicas would duplicate message processing unless RabbitMQ consumer groups are configured |
| `rule-router` | **Yes** | Stateless HTTP server. Scale to any replica count. Each pod loads its own in-memory cache of routing rules from the DB |

---

## Monitoring and Observability

### Logs

Both services use structured JSON logging (Pino) in production. Key log fields:

```json
{
  "level": "info",
  "topic": "order.created",
  "executionId": "exec_1234_abc",
  "channelId": "smile-order-created-channel",
  "traceId": "00-abc...-01",
  "requestId": "req-001"
}
```

Look for these log events:

| Event | Service | Log Message |
|-------|---------|-------------|
| Event consumed | interop-service | `"Starting event processing"` |
| No route mapping | interop-service | `"No enabled route mapping found"` |
| Transformation failed | interop-service | `"Transformation failed"` |
| OpenHIM send failed | interop-service | `"Unhandled error during event processing"` |
| Rule evaluated | rule-router | `"Routing decision made"` |
| Forward failed | rule-router | `"Failed to forward to target"` |
| Cache reloaded | both | `"Route mappings loaded from database"` / `"Routing rules refreshed"` |

### Audit Log Queries

```sql
-- Events processed in the last hour
SELECT rabbitmq_topic, status, COUNT(*) as count
FROM openhim_route_execution_logs
WHERE created_at >= NOW() - INTERVAL 1 HOUR
GROUP BY rabbitmq_topic, status
ORDER BY rabbitmq_topic, status;

-- Failed events with error details
SELECT rabbitmq_topic, error_message, http_status_code, created_at
FROM openhim_route_execution_logs
WHERE status = 'failure'
  AND created_at >= NOW() - INTERVAL 24 HOUR
ORDER BY created_at DESC;

-- Average processing time per topic
SELECT rabbitmq_topic,
       ROUND(AVG(execution_time_ms)) as avg_ms,
       MAX(execution_time_ms) as max_ms
FROM openhim_route_execution_logs
WHERE created_at >= NOW() - INTERVAL 24 HOUR
GROUP BY rabbitmq_topic;
```

### Common Issues and Fixes

#### interop-service not consuming messages

1. Check RabbitMQ connection:
   ```bash
   curl http://localhost:4004/health | jq '.checks.rabbitmq'
   ```
2. Verify the queue name and topic routing in RabbitMQ management console
3. Check logs for `"Failed to start RabbitMQ consumer"`

#### Route mapping not found

```
"No enabled route mapping found" for topic X
```

1. Verify the topic exists in `openhim_route_mappings` and `enabled = 1`
2. Reload the cache: `POST /admin/refresh-routes`
3. Check: `GET /admin/routes`

#### OpenHIM returning unexpected status

The send is retried up to `max_retries` times. Check:
1. `openhim_route_execution_logs` for `response_payload` on failures
2. OpenHIM console for the transaction details
3. Whether the status code is in `expected_status_codes` for the route mapping

#### rule-router not registered in OpenHIM console

Registration is non-fatal. The service continues to handle requests even if registration fails. Check:
1. `OPENHIM_API_ENDPOINT` is correct and reachable
2. `OPENHIM_ADMIN_EMAIL` and `OPENHIM_ADMIN_PASSWORD` are correct
3. Look for `"Mediator registration failed"` in rule-router logs

#### Routing rules not applied after DB change

```bash
# Force reload (no restart needed)
curl -X POST http://localhost:4005/admin/refresh-rules
```

Or set `ROUTING_CACHE_TTL_SECONDS` to enable automatic polling.
