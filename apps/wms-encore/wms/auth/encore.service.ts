import { Service } from "encore.dev/service";
import { errorEnvelope } from "../../shared/http/envelope";

// Scaffolding for the auth group — will absorb apps/auth-service's
// authRoutes/authExecutiveRoutes/userRoutes plus apps/core's auth module.
// Sibling to core/scm/wms, not nested under core.
//
// Named "auth-users" (not plain "auth") because Encore already has a
// service literally named "auth" — shared/auth/auth.controller.ts's
// `GET /api/v1/set-auth` endpoint is picked up as its own implicit service
// named after its directory ("shared/auth"). That's Encore's *authHandler*
// registration (see shared/auth/authHandler.ts), a different thing from
// this domain group. Worth reconciling names later so "auth" isn't
// ambiguous between the two.
export default new Service("auth-users", {
  middlewares: [errorEnvelope],
});
