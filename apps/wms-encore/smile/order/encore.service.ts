import { Service } from "encore.dev/service";
import { errorEnvelope } from "../../shared/http/envelope";

// Scaffolding for scm/order — the "order" subdomain, absorbing apps/main's
// order/order-*, plus contracts and budget-source (carved out of the
// otherwise-removed "planning" subdomain — see migration plan section 04).
export default new Service("order", {
  middlewares: [errorEnvelope],
});
