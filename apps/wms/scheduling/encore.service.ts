import { Service } from "encore.dev/service";
import { errorEnvelope } from "../shared/http/envelope";

export default new Service("scheduling", {
  middlewares: [errorEnvelope],
});
