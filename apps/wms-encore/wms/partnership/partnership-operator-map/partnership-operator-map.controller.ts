// Routes — mirrors apps/wms-service's partnershipOperatorMapRoutes.ts (mounted at
// /partnership-operator-map, matching v1Router.use('/partnership-operator-map', ...)):
//
//   GET    /api/v1/partnership-operator-map                          getAllPartnershipOperatorMaps               (authorizeRoles(allRead))
//   GET    /api/v1/partnership-operator-map/operator-thirdparty      getAllPartnershipOperatorMapsByThirdpartyAdmin (authorizeRoles(allRead))
//   DELETE /api/v1/partnership-operator-map                          deletePartnershipOperatorMap                (authorizeRoles(onlyAdmin))
//   POST   /api/v1/partnership-operator-map                          createPartnershipOperatorMap                (authorizeRoles(onlyAdmin))
//   PUT    /api/v1/partnership-operator-map                          updatePartnershipOperatorMap                (authorizeRoles(onlyAdmin))
//   GET    /api/v1/partnership-operator-map/operator-from-operatormap getOperatorsFromOperatorMap                 (authorizeRoles(allRead))
//
// Role-based authorizeRoles(...) calls from the original are enforced below
// via ../rbac's assertRole (allRead / onlyAdmin tiers, matching the routes
// above exactly) — see rbac.ts's header comment for why this checks
// AuthData.role's real vocabulary rather than authorizeRoles.ts's own
// (never-actually-applied) Title-Case role-name list.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { assertRole, allRead, onlyAdmin } from "../rbac";
import * as service from "./partnership-operator-map.service";
import type {
  CreatePartnershipOperatorMapRequest,
  CreatePartnershipOperatorMapResponse,
  DeletePartnershipOperatorMapRequest,
  DeletePartnershipOperatorMapResponse,
  GetAllPartnershipOperatorMapsByThirdpartyAdminRequest,
  GetAllPartnershipOperatorMapsByThirdpartyAdminResponse,
  GetAllPartnershipOperatorMapsRequest,
  GetAllPartnershipOperatorMapsResponse,
  GetOperatorsFromOperatorMapResponse,
  UpdatePartnershipOperatorMapRequest,
  UpdatePartnershipOperatorMapResponse,
} from "./partnership-operator-map.types";

export const getAllPartnershipOperatorMaps = api(
  { method: "GET", path: "/api/v1/partnership-operator-map", auth: true, expose: true },
  async (req: GetAllPartnershipOperatorMapsRequest): Promise<GetAllPartnershipOperatorMapsResponse> => {
    const { entityId, role } = getAuthData()!;
    assertRole(role, allRead);
    const data = await service.getAllPartnershipOperatorMaps({
      ...req,
      authEntityId: String(entityId),
    });
    return { status: "success", data };
  }
);

export const getAllPartnershipOperatorMapsByThirdpartyAdmin = api(
  {
    method: "GET",
    path: "/api/v1/partnership-operator-map/operator-thirdparty",
    auth: true,
    expose: true,
  },
  async (
    req: GetAllPartnershipOperatorMapsByThirdpartyAdminRequest
  ): Promise<GetAllPartnershipOperatorMapsByThirdpartyAdminResponse> => {
    const { role } = getAuthData()!;
    assertRole(role, allRead);
    const data = await service.getAllPartnershipOperatorMapsByThirdpartyAdmin(req);
    return { status: "success", data };
  }
);

export const createPartnershipOperatorMap = api(
  { method: "POST", path: "/api/v1/partnership-operator-map", auth: true, expose: true },
  async (req: CreatePartnershipOperatorMapRequest): Promise<CreatePartnershipOperatorMapResponse> => {
    const { role } = getAuthData()!;
    assertRole(role, onlyAdmin);
    const data = await service.createPartnershipOperatorMap(req);
    return { status: "success", data };
  }
);

export const updatePartnershipOperatorMap = api(
  { method: "PUT", path: "/api/v1/partnership-operator-map", auth: true, expose: true },
  async (req: UpdatePartnershipOperatorMapRequest): Promise<UpdatePartnershipOperatorMapResponse> => {
    const { role } = getAuthData()!;
    assertRole(role, onlyAdmin);
    const data = await service.updatePartnershipOperatorMap(req);
    return { status: "success", data };
  }
);

export const deletePartnershipOperatorMap = api(
  { method: "DELETE", path: "/api/v1/partnership-operator-map", auth: true, expose: true },
  async (req: DeletePartnershipOperatorMapRequest): Promise<DeletePartnershipOperatorMapResponse> => {
    const { userNumericId, role } = getAuthData()!;
    assertRole(role, onlyAdmin);
    const data = await service.deletePartnershipOperatorMap({
      partnershipId: req.partnership_id,
      operatorId: req.operator_id,
      deletedBy: userNumericId,
    });
    return { status: "success", data };
  }
);

export const getOperatorsFromOperatorMap = api(
  { method: "GET", path: "/api/v1/partnership-operator-map/operator-from-operatormap", auth: true, expose: true },
  async (): Promise<GetOperatorsFromOperatorMapResponse> => {
    const { entityId, role } = getAuthData()!;
    assertRole(role, allRead);
    const data = await service.getOperatorsFromOperatorMap({ entityId });
    return { status: "success", data };
  }
);
