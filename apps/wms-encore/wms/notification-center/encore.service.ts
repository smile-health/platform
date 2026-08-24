import { Service } from "encore.dev/service";
import { errorEnvelope } from "../../shared/http/envelope";

// Scaffolding only. Merges what were previously 2 separate services
// (notification-dispatch, notification-mobile) into 1 — neither published
// or subscribed to anything on its own, so they don't need the "own
// service" exception. Named "-center" (not "notification") because
// notification/ is already taken by wms's real pub/sub service.
export default new Service("notification-center", {
  middlewares: [errorEnvelope],
});
