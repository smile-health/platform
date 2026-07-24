# Interoperability Layer Documentation

The interoperability (interop) layer is the pipeline that bridges internal SMILE platform events with external health information systems (SIHA, SITB, DHIS2, etc.) via OpenHIM.

## Documents

| Document | Description |
|----------|-------------|
| [Architecture](architecture.md) | System design, component responsibilities, and data flow |
| [Adding a New Event](adding-new-event.md) | Step-by-step guide for integrating a new SMILE event or downstream system |
| [Configuration Reference](configuration-reference.md) | All environment variables and database table schemas |
| [Operations](operations.md) | Running locally, Docker Compose, Kubernetes, and admin endpoints |

## Services

| Service | Path | Port | Role |
|---------|------|------|------|
| `interop-service` | `apps/interop-service/` | 4004 | Consumes RabbitMQ events, transforms to CloudEvents, forwards to OpenHIM |
| `rule-router` | `apps/openhim-mediators/rule-router/` | 4005 | OpenHIM mediator that applies rule-based fan-out to downstream systems |

## Quick Reference

**Add a new event (no code change needed):**
1. Insert row into `openhim_route_mappings` → `POST /admin/refresh-routes`
2. Create OpenHIM channel
3. Insert row(s) into `integration_routing_rules` → `POST /admin/refresh-rules`

**Add a new downstream system for an existing event:**
1. Insert row into `integration_routing_rules` → `POST /admin/refresh-rules`

**Add custom payload transformation:**
1. Write a class extending `BaseTransformer`
2. Register it in `TransformerRegistry.initializeDefaultTransformers()`
3. Redeploy `interop-service`

See [Adding a New Event](adding-new-event.md) for full details.

## Integration Guides

| Integration | Document |
|-------------|----------|
| Biofarma Order | [integrations/biofarma-order.md](integrations/biofarma-order.md) |

## Related ADRs

- [Platform Architecture Overview](../PLATFORM_ARCHITECTURE_OVERVIEW.md)
- [Integration Samples](../integration/)
