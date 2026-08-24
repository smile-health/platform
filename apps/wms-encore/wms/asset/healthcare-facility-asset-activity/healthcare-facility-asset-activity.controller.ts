// Routes — mirrors apps/wms-service's healthcareFacilityAssetActivityRoutes.ts
// (mounted at /healthcare-facility-asset-activity, matching
// v1Router.use('/healthcare-facility-asset-activity', ...) in routes/index.ts):
//
//   GET   /api/v1/healthcare-facility-asset-activity   getAllHealthcareFacilityAssetActivity  (role: allRead)
//   POST  /api/v1/healthcare-facility-asset-activity   createHealthcareFacilityAssetActivity  (role: onlyHf)
//
// Role-based authorization (allRead / onlyHf) isn't enforced yet — same known
// gap as every other ported module; authorizeRoles.ts's role check itself has
// a documented bug upstream (see the migration plan).

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./healthcare-facility-asset-activity.service";
import type {
  CreateHealthcareFacilityAssetActivityRequest,
  CreateHealthcareFacilityAssetActivityResponse,
  GetAllHealthcareFacilityAssetActivityRequest,
  GetAllHealthcareFacilityAssetActivityResponse,
} from "./healthcare-facility-asset-activity.types";

export const getAllHealthcareFacilityAssetActivity = api(
  { method: "GET", path: "/api/v1/healthcare-facility-asset-activity", auth: true, expose: true },
  async (
    req: GetAllHealthcareFacilityAssetActivityRequest
  ): Promise<GetAllHealthcareFacilityAssetActivityResponse> => {
    const data = await service.getAllHealthcareFacilityAssetActivity(req);
    return { status: "success", data };
  }
);

export const createHealthcareFacilityAssetActivity = api(
  { method: "POST", path: "/api/v1/healthcare-facility-asset-activity", auth: true, expose: true },
  async (
    req: CreateHealthcareFacilityAssetActivityRequest
  ): Promise<CreateHealthcareFacilityAssetActivityResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.createHealthcareFacilityAssetActivity({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);
