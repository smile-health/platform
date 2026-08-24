import { Service } from "encore.dev/service";
import { errorEnvelope } from "../../shared/http/envelope";

export default new Service("manual-scale-request", {
  middlewares: [errorEnvelope],
});
