import { Service } from "encore.dev/service";
import { errorEnvelope } from "../../shared/http/envelope";

// Scaffolding for the new asset-catalog group — catalog/master-data side of
// asset management (models, types, monitoring config, vendors, cold storage,
// cceigat, WHO PQS classification). Named "asset-catalog" on disk (not
// "asset") specifically to avoid colliding with the existing wms/asset
// folder, which covers *operational* asset tracking, not the catalog.
export default new Service("asset-catalog", {
  middlewares: [errorEnvelope],
});
