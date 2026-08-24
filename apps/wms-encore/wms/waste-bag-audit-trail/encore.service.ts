import { Service } from "encore.dev/service";
import { errorEnvelope } from "../../shared/http/envelope";

export default new Service("audit-trail", {
  middlewares: [errorEnvelope],
});
