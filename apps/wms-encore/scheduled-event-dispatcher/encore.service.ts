import { Service } from "encore.dev/service";
import { errorEnvelope } from "../shared/http/envelope";

export default new Service("scheduled-event-dispatcher", {
  middlewares: [errorEnvelope],
});
