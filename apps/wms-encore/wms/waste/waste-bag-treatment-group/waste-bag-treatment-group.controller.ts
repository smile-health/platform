// Routes — mirrors apps/wms-service's wasteBagTreatmentGroupRoutes.ts
// (mounted at /waste-bag-treatment-group, matching
// v1Router.use('/waste-bag-treatment-group', wasteBagTreatmentGroup)):
//
//   GET  /api/v1/waste-bag-treatment-group          getAllWasteBagTreatmentGroup            (role: allRead)
//   GET  /api/v1/waste-bag-treatment-group/detail    getWasteBagTreatmentGroup                (role: allRead)
//   GET  /api/v1/waste-bag-treatment-group/pending   getPendingWasteTreatmentGroupsController (role: allRead)
//
// Role-based authorization (allRead) isn't enforced — not a gap, since the original doesn't enforce it either (see partnership/rbac.ts), same as
// every other ported module; authorizeRoles.ts's role check itself has a
// documented bug upstream (see the migration plan). rateLimitter is also not
// ported (Encore's own rate limiting, if any, is configured at the
// infra/gateway level, not per-route here).

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./waste-bag-treatment-group.service";
import type {
  GetAllWasteBagTreatmentGroupRequest,
  GetAllWasteBagTreatmentGroupResponse,
  GetWasteBagTreatmentGroupRequest,
  GetWasteBagTreatmentGroupResponse,
  GetPendingWasteTreatmentGroupsRequest,
  GetPendingWasteTreatmentGroupsResponse,
} from "./waste-bag-treatment-group.types";

export const getAllWasteBagTreatmentGroup = api(
  { method: "GET", path: "/api/v1/waste-bag-treatment-group", auth: true, expose: true },
  async (req: GetAllWasteBagTreatmentGroupRequest): Promise<GetAllWasteBagTreatmentGroupResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getAllWasteBagTreatmentGroup({ ...req, authEntityId: entityId });
    return { status: "success", data };
  }
);

export const getWasteBagTreatmentGroup = api(
  { method: "GET", path: "/api/v1/waste-bag-treatment-group/detail", auth: true, expose: true },
  async (req: GetWasteBagTreatmentGroupRequest): Promise<GetWasteBagTreatmentGroupResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.getWasteBagTreatmentGroup({ ...req, token: userID });
    return { status: "success", data };
  }
);

export const getPendingWasteTreatmentGroupsController = api(
  { method: "GET", path: "/api/v1/waste-bag-treatment-group/pending", auth: true, expose: true },
  async (
    req: GetPendingWasteTreatmentGroupsRequest
  ): Promise<GetPendingWasteTreatmentGroupsResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getPendingWasteTreatmentGroups({ ...req, authEntityId: entityId });
    return { status: "success", data };
  }
);
