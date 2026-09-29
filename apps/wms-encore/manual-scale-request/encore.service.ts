import { Service } from "encore.dev/service";
import { errorEnvelope } from "../shared/http/envelope";
import { auditTrail } from "../shared/http/audit";

export default new Service("manual-scale-request", {
  middlewares: [errorEnvelope, auditTrail],
});
