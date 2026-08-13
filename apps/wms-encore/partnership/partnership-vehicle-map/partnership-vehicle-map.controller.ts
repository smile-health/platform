// Routes — mirrors apps/wms-service's partnershipVehicleMapRoutes.ts:
//
//   GET    /api/v1/partnership-vehicle-map   getAllPartnershipVehicleMaps  (authorizeRoles(allRead))
//   POST   /api/v1/partnership-vehicle-map   createPartnershipVehicleMap   (authorizeRoles(onlyAdmin))
//   DELETE /api/v1/partnership-vehicle-map   deletePartnershipVehicleMap   (authorizeRoles(onlyAdmin))
//
// Role-based authorizeRoles(...) calls from the original are enforced below
// via ../rbac's assertRole (allRead / onlyAdmin, matching the routes above
// exactly) — see rbac.ts's header comment for why this checks
// AuthData.role's real vocabulary rather than authorizeRoles.ts's own
// (never-actually-applied) Title-Case role-name list.
//
// NOTE: UpdatePartnershipVehicleMap.ts (application/use-cases) exists in the
// original but is never wired to a route in partnershipVehicleMapRoutes.ts —
// per the porting brief, no endpoint is invented for it here.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { assertRole, allRead, onlyAdmin } from "../rbac";
import * as service from "./partnership-vehicle-map.service";
import type {
  CreatePartnershipVehicleMapRequest,
  CreatePartnershipVehicleMapResponse,
  DeletePartnershipVehicleMapRequest,
  DeletePartnershipVehicleMapResponse,
  GetAllPartnershipVehicleMapRequest,
  GetAllPartnershipVehicleMapResponse,
} from "./partnership-vehicle-map.types";

export const getAllPartnershipVehicleMaps = api(
  { method: "GET", path: "/api/v1/partnership-vehicle-map", auth: true, expose: true },
  async (req: GetAllPartnershipVehicleMapRequest): Promise<GetAllPartnershipVehicleMapResponse> => {
    const { entityId, role } = getAuthData()!;
    assertRole(role, allRead);
    const data = await service.getAllPartnershipVehicleMaps({
      limit: req.limit,
      page: req.page,
      search: req.search,
      authEntityId: String(entityId),
    });
    return { status: "success", data };
  }
);

export const createPartnershipVehicleMap = api(
  { method: "POST", path: "/api/v1/partnership-vehicle-map", auth: true, expose: true },
  async (req: CreatePartnershipVehicleMapRequest): Promise<CreatePartnershipVehicleMapResponse> => {
    const { role } = getAuthData()!;
    assertRole(role, onlyAdmin);
    const data = await service.createPartnershipVehicleMap(req);
    return { status: "success", data };
  }
);

export const deletePartnershipVehicleMap = api(
  { method: "DELETE", path: "/api/v1/partnership-vehicle-map", auth: true, expose: true },
  async (req: DeletePartnershipVehicleMapRequest): Promise<DeletePartnershipVehicleMapResponse> => {
    const { userID, role } = getAuthData()!;
    assertRole(role, onlyAdmin);
    const data = await service.deletePartnershipVehicleMap({
      partnershipId: req.partnership_id,
      vehicleId: req.vehicle_id,
      deletedBy: userID,
    });
    return { status: "success", data };
  }
);
