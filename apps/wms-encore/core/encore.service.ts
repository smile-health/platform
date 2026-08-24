import { Service } from "encore.dev/service";
import { errorEnvelope } from "../shared/http/envelope";

// Scaffolding only. One service for the whole core group — merged per your
// request to keep the service count down. Submodules below are plain
// folders (not their own Service), same pattern wms already uses for e.g.
// asset/ (one Service, many submodule folders like asset-model/).
export default new Service("core", {
  middlewares: [errorEnvelope],
});
