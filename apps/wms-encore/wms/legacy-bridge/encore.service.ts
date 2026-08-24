import { Service } from "encore.dev/service";
import { errorEnvelope } from "../../shared/http/envelope";

// Scaffolding only. Bridges RabbitMQ (still used by apps/interop-service,
// apps/sync-service, apps/3.0/*, and mobile push — see @smile-health/lib's
// packages/lib/rabbitmq/*) into this app's internal Encore Pub/Sub topics,
// and vice versa where those other apps still need to consume our events.
// This is the one place RabbitMQ-specific code should exist in
// backend/api — everything else stays on encore.dev/pubsub.
export default new Service("legacy-bridge", {
  middlewares: [errorEnvelope],
});
