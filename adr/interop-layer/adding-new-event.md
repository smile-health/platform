# Adding a New Event or Downstream System

This guide covers the two most common integration tasks:

- **Scenario A** — A new SMILE business event needs to flow out to external systems
- **Scenario B** — An existing event needs to also reach a new downstream system

---

## Decision Tree

```
New requirement?
│
├── New event type from SMILE? (e.g. stock.adjusted)
│   └── → Follow Scenario A (all steps)
│
└── Existing event, new downstream target? (e.g. order.created → also DHIS2)
    └── → Follow Scenario B (DB-only, no code change)
```

---

## Scenario A: New SMILE Event

### Step 1 — Confirm the RabbitMQ Topic Name

Get the exact topic string from the SMILE service that publishes it. The interop-service consumes from a single queue and dispatches by topic key. Mismatched topic names result in silently dropped messages.

Common naming patterns in SMILE:
- `order.created`
- `order.status.order.confirm`
- `stock.adjusted`
- `patient.registered`

> Note: Some topics contain typos that are intentional (e.g. `order.status.order.fullfilled`) — always verify against the publishing service.

---

### Step 2 — Insert a Route Mapping

This tells `interop-service` which OpenHIM channel to forward events on this topic to. Insert into `openhim_route_mappings` in the `smile_interop` database:

```sql
INSERT INTO openhim_route_mappings (
  rabbitmq_topic,
  enabled,
  openhim_channel_id,
  openhim_channel_name,
  http_method,
  request_path,
  headers_json,
  include_context,
  auth_type,
  max_retries,
  retry_backoff_ms,
  retry_backoff_multiplier,
  expected_status_codes,
  created_by
) VALUES (
  'stock.adjusted',                            -- exact RabbitMQ topic key
  1,                                           -- enabled
  'smile-stock-adjusted-channel',             -- OpenHIM channel ID (must match Step 3)
  'SMILE Stock Adjusted Channel',             -- human-readable name
  'POST',
  '/pub/smile/stock/stock-adjusted',          -- URL pattern of the OpenHIM channel
  JSON_OBJECT('Content-Type', 'application/json', 'Accept', 'application/json'),
  1,          -- 1 = embed program_id, user_id, workspace_id as CloudEvent extensions
  'basic',
  3,          -- max retries
  1000,       -- initial backoff ms
  2,          -- backoff multiplier (1s → 2s → 4s)
  '200,201,202,204',
  'system'
);
```

Add this to [apps/interop-service/db-scripts/route-mapping-insert.sql](../../apps/interop-service/db-scripts/route-mapping-insert.sql) for version control.

**Key fields explained:**

| Field | Notes |
|-------|-------|
| `rabbitmq_topic` | Must exactly match what SMILE publishes |
| `openhim_channel_id` | Arbitrary identifier — must match the channel you create in Step 3 |
| `request_path` | Must match the OpenHIM channel's URL pattern |
| `include_context` | Set `1` to forward `program_id`, `user_id`, `user_email`, `request_id` as CloudEvent extension attributes. Set `0` for events where context is irrelevant |
| `expected_status_codes` | If OpenHIM returns a code NOT in this list, the call is treated as a failure and retried |

---

### Step 3 — Create the OpenHIM Channel

In the OpenHIM console or via the OpenHIM REST API, create a new channel:

| Field | Value |
|-------|-------|
| Name | `SMILE Stock Adjusted Channel` |
| URL Pattern | `/pub/smile/stock/stock-adjusted` (must match `request_path` in Step 2) |
| Type | HTTP |
| Status | Enabled |
| Allowed clients | `smile-app` |
| Route | Point to `rule-router` mediator host/port, path `/route` |

The channel ID in OpenHIM does not need to match `openhim_channel_id` exactly — the `openhim_channel_id` column is used for audit logging only. What matters is the URL pattern matching.

---

### Step 4 — Insert Routing Rules

This tells `rule-router` which downstream system(s) receive this event and under what conditions. Insert into `integration_routing_rules` in the `smile_interop` database:

```sql
-- Route to SITB adapter for TB program (program_id = 4)
INSERT INTO integration_routing_rules
  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, enabled)
VALUES
  (
    'stock.adjusted',
    'program_id', 'eq', '4',
    '/adapter/sitb/stock',
    'Program 4 (TB) - Stock Adjusted',
    FALSE, 1, TRUE
  );

-- Route to SIHA adapter by client key
INSERT INTO integration_routing_rules
  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, enabled)
VALUES
  (
    'stock.adjusted',
    'client_key', 'eq', 'siha',
    '/adapter/siha/stock',
    'SIHA - Stock Adjusted',
    FALSE, 1, TRUE
  );

-- Default fallback: catch-all when no specific rule matches
INSERT INTO integration_routing_rules
  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, enabled)
VALUES
  (
    'stock.adjusted',
    'program_id', 'eq', '',    -- value is irrelevant when is_default = TRUE
    '/adapter/default/stock',
    'Default - Stock Adjusted',
    TRUE, 99, TRUE
  );
```

Add these to [apps/openhim-mediators/rule-router/db-scripts/routing-rules-insert.sql](../../apps/openhim-mediators/rule-router/db-scripts/routing-rules-insert.sql).

**Rule evaluation logic:**
1. All specific rules (`is_default = FALSE`) are evaluated first
2. If one or more match → forward to all matched targets in parallel
3. If none match → fall back to `is_default = TRUE` rules
4. If no rules exist for the topic → return 200 "no routing configured" (not an error)

**Filter key options:**

| Filter Key | What it matches |
|------------|----------------|
| `program_id` | CloudEvent extension `program_id` or `data.program_id` |
| `client_key` | CloudEvent extension `client_key` or `X-Integration-Client` header |
| `header:x-some-header` | HTTP header (case-insensitive) |
| `data.some.nested.field` | Dot-path traversal of CloudEvent `data` |
| Any other string | CloudEvent top-level extension attribute |

**Operator options:** `eq`, `neq`, `contains`, `starts_with`, `regex`

---

### Step 5 — (Optional) Write a Custom Transformer

Skip this step if the raw SMILE payload can be forwarded as-is. The `PassThroughTransformer` wraps any payload in a CloudEvent automatically.

Only write a transformer when you need to:
- Rename or restructure fields (e.g. map `id` → `stock_id`)
- Validate required fields and fail fast with a clear error
- Compute derived fields before forwarding

**Create the transformer class** in [apps/interop-service/src/modules/transformers/transformer.base.ts](../../apps/interop-service/src/modules/transformers/transformer.base.ts):

```typescript
export class StockAdjustedTransformer extends BaseTransformer {
  readonly topic = "stock.adjusted";
  readonly cloudEventType = "com.smile.stock.adjusted";

  transform(
    payload: unknown,
    context?: MessageContext,
  ): CloudEvent<Record<string, unknown>> {
    // Validate required fields — throws on missing fields
    this.requireFields(payload, ["id", "item_id", "quantity"]);

    const obj = payload as Record<string, unknown>;

    return this.createCloudEvent(
      {
        stock_id: String(obj.id),
        item_id: obj.item_id,
        quantity: obj.quantity,
        adjusted_at: obj.adjusted_at ?? new Date().toISOString(),
      },
      this.extractSubject(payload),
      context,
    );
  }

  extractSubject(payload: unknown): string | undefined {
    const id = this.getField(payload, "id");
    return id !== undefined ? `stock_${id}` : undefined;
  }
}
```

**Register the transformer** in [apps/interop-service/src/modules/transformers/registry.ts](../../apps/interop-service/src/modules/transformers/registry.ts):

```typescript
// Inside initializeDefaultTransformers():
this.register("stock.adjusted", new StockAdjustedTransformer());
```

> If `ENABLE_PAYLOAD_TRANSFORMATION=false` (the default), the registry is bypassed entirely and `PassThroughTransformer` is always used regardless of registrations. Set to `true` to activate topic-specific transformers.

---

### Step 6 — Reload Without Restarting

For DB-only changes (Steps 2 and 4), no deployment is needed. Reload the in-memory caches:

```bash
# Reload interop-service route mappings
curl -X POST http://localhost:4004/admin/refresh-routes

# Reload rule-router routing rules
curl -X POST http://localhost:4005/admin/refresh-rules

# Verify the new event is registered
curl http://localhost:4004/admin/routes | jq '[.routes[] | .rabbitmq_topic]'
curl http://localhost:4005/admin/rules | jq '[.rules[] | {topic: .topic, target: .target_name}]'
```

---

### Step 7 — Redeploy (if code changed)

Only required if you added a transformer (Step 5):

```bash
# Docker Compose
docker compose up --build interop-service

# Kubernetes
docker build -f apps/interop-service/Dockerfile -t your-registry/interop-service:v1.x .
docker push your-registry/interop-service:v1.x
kubectl set image deployment/interop-service interop-service=your-registry/interop-service:v1.x
kubectl rollout status deployment/interop-service
```

---

## Scenario B: New Downstream System for an Existing Event

No code changes required. Only Step 4 and Step 6 from Scenario A are needed.

**Example**: Also send `order.created` to DHIS2 for program_id=7:

```sql
INSERT INTO integration_routing_rules
  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, enabled)
VALUES
  (
    'order.created',
    'program_id', 'eq', '7',
    '/adapter/dhis2/orders',
    'Program 7 - DHIS2 Order Created',
    FALSE, 1, TRUE
  );
```

Then reload:

```bash
curl -X POST http://localhost:4005/admin/refresh-rules
```

No OpenHIM channel changes needed. No `interop-service` changes needed. The existing `order.created` channel already points to `rule-router`, and `rule-router` now has an additional rule.

---

## Complete Checklist

### Scenario A — New Event

```
□ 1. Confirm exact RabbitMQ topic name from SMILE team
□ 2. Insert row into openhim_route_mappings
□    └── Add to db-scripts/route-mapping-insert.sql (version control)
□ 3. Create OpenHIM channel with matching URL pattern
□    └── Set allowed client: smile-app
□    └── Set route: rule-router host:4005/route
□ 4. Insert routing rule(s) into integration_routing_rules
□    └── Add to db-scripts/routing-rules-insert.sql (version control)
□    └── Add is_default=TRUE fallback if needed
□ 5. (Optional) Write custom transformer if field mapping is needed
□    └── Extend BaseTransformer
□    └── Register in TransformerRegistry.initializeDefaultTransformers()
□ 6. Reload caches
□    └── POST /admin/refresh-routes (interop-service)
□    └── POST /admin/refresh-rules (rule-router)
□ 7. Verify with GET /admin/routes and GET /admin/rules
□ 8. Rebuild and redeploy interop-service if transformer was added
□ 9. Test end-to-end by publishing a test message to RabbitMQ
□    └── Check openhim_route_execution_logs for success audit entry
```

### Scenario B — New Downstream System

```
□ 1. Confirm target adapter URL (OpenHIM path)
□ 2. Insert row into integration_routing_rules
□    └── Add to db-scripts/routing-rules-insert.sql (version control)
□ 3. POST /admin/refresh-rules (rule-router)
□ 4. Verify with GET /admin/rules
□ 5. Test end-to-end
```

---

## Testing End-to-End

After making changes, publish a test message to RabbitMQ manually to verify the full pipeline:

```javascript
// Using amqplib (Node.js)
const message = {
  topic: "stock.adjusted",
  payload: { id: 99, item_id: 10, quantity: 50, program_id: 4 },
  context: {
    program_id: 4,
    user_id: 1,
    user_email: "test@example.com",
    request_id: "test-req-001"
  },
  headers: {}
};

channel.publish("smile.events", "stock.adjusted", Buffer.from(JSON.stringify(message)));
```

Then check:
1. `interop-service` logs for the event being processed
2. OpenHIM console for the transaction record
3. `rule-router` logs for routing decision
4. `openhim_route_execution_logs` for the audit entry:

```sql
SELECT * FROM openhim_route_execution_logs
WHERE rabbitmq_topic = 'stock.adjusted'
ORDER BY created_at DESC
LIMIT 5;
```
