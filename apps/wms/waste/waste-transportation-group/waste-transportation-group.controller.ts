// Routes — mirrors apps/wms-service's wasteTransportationGroupRoutes.ts
// (mounted at /waste-transportation-group, matching
// v1Router.use('/waste-transportation-group', wasteTransportationGroupRoutes)):
//
//   GET    /api/v1/waste-transportation-group          getAllWasteTransportationGroups  (role: allRead)
//   POST   /api/v1/waste-transportation-group          createWasteTransportationGroup   (role: onlyAdmin)
//   GET    /api/v1/waste-transportation-group/detail   getWasteTransportationGroupById  (role: allRead)
//   PUT    /api/v1/waste-transportation-group/:id      updateWasteTransportationGroup   (role: onlyAdmin)
//   DELETE /api/v1/waste-transportation-group/:id      deleteWasteTransportationGroup   (role: onlyAdmin)
//
// Role-based authorization (allRead / onlyAdmin) isn't enforced yet — same
// known gap as every other ported module; authorizeRoles.ts's role check
// itself has a documented bug upstream (see the migration plan).

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./waste-transportation-group.service";
import type {
  GetAllWasteTransportationGroupsRequest,
  GetAllWasteTransportationGroupsResponse,
  CreateWasteTransportationGroupRequest,
  CreateWasteTransportationGroupResponse,
  GetWasteTransportationGroupByIdRequest,
  GetWasteTransportationGroupByIdResponse,
  UpdateWasteTransportationGroupRequest,
  UpdateWasteTransportationGroupResponse,
  DeleteWasteTransportationGroupRequest,
  DeleteWasteTransportationGroupResponse,
} from "./waste-transportation-group.types";

export const getAllWasteTransportationGroups = api(
  { method: "GET", path: "/api/v1/waste-transportation-group", auth: true, expose: true },
  async (
    req: GetAllWasteTransportationGroupsRequest
  ): Promise<GetAllWasteTransportationGroupsResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getAllWasteTransportationGroups({
      ...req,
      // Original: `entityId ? Number(entityId) : req.user?.entity.id` — the
      // query param wins when provided, else falls back to the caller's own
      // entity.
      entityId: req.entityId ?? entityId,
    });
    return { status: "success", data };
  }
);

export const createWasteTransportationGroup = api(
  { method: "POST", path: "/api/v1/waste-transportation-group", auth: true, expose: true },
  async (
    req: CreateWasteTransportationGroupRequest
  ): Promise<CreateWasteTransportationGroupResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.createWasteTransportationGroup({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);

export const getWasteTransportationGroupById = api(
  { method: "GET", path: "/api/v1/waste-transportation-group/detail", auth: true, expose: true },
  async (
    req: GetWasteTransportationGroupByIdRequest
  ): Promise<GetWasteTransportationGroupByIdResponse> => {
    const data = await service.getWasteTransportationGroupById(req);
    return { status: "success", data };
  }
);

export const updateWasteTransportationGroup = api(
  { method: "PUT", path: "/api/v1/waste-transportation-group/:id", auth: true, expose: true },
  async (
    req: UpdateWasteTransportationGroupRequest
  ): Promise<UpdateWasteTransportationGroupResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.updateWasteTransportationGroup({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const deleteWasteTransportationGroup = api(
  { method: "DELETE", path: "/api/v1/waste-transportation-group/:id", auth: true, expose: true },
  async (
    req: DeleteWasteTransportationGroupRequest
  ): Promise<DeleteWasteTransportationGroupResponse> => {
    const { userNumericId } = getAuthData()!;
    const data = await service.deleteWasteTransportationGroup(req.id, userNumericId);
    return { status: "success", data };
  }
);
