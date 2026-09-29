import { Service } from "encore.dev/service";
import { errorEnvelope } from "../shared/http/envelope";
import { auditTrail } from "../shared/http/audit";

export default new Service("scheduled-event-dispatcher", {
  middlewares: [errorEnvelope, auditTrail],
});
