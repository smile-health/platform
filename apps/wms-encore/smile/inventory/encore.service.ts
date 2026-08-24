import { Service } from "encore.dev/service";
import { errorEnvelope } from "../../shared/http/envelope";

// Scaffolding for scm/inventory — this is the subdomain/service name
// ("inventory"), renamed from "stock" per the migration plan. The module
// folder inside keeps the "stock" name unchanged (stock/), since only the
// subdomain container is being renamed, not the module itself. Also
// absorbs reconciliation and batch (both previously separate top-level
// modules under apps/main).
export default new Service("inventory", {
  middlewares: [errorEnvelope],
});
