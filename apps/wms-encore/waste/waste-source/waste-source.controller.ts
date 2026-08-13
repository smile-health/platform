// Routes — mirrors apps/wms-service's wasteSourceRoutes.ts (mounted at
// /waste-source, matching v1Router.use('/waste-source', ...)):
//
//   GET    /api/v1/waste-source       getAllWasteSources   (role: allRead)
//   POST   /api/v1/waste-source       createWasteSource    (role: onlyAdmin)
//   GET    /api/v1/waste-source/:id   getWasteSourceById   (role: allRead)
//   PUT    /api/v1/waste-source/:id   updateWasteSource    (role: onlyAdmin)
//   PATCH  /api/v1/waste-source/:id   patchWasteSource     (role: onlyAdmin)
//   DELETE /api/v1/waste-source/:id   deleteWasteSource    (role: onlyAdmin)
//
// Role-based authorization (allRead / onlyAdmin) isn't enforced yet — same
// known gap as every other ported module; authorizeRoles.ts's role check
// itself has a documented bug upstream (see the migration plan).

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./waste-source.service";
import type {
  GetWasteSourceByIdRequest,
  GetWasteSourceByIdResponse,
  GetAllWasteSourcesRequest,
  GetAllWasteSourcesResponse,
  CreateWasteSourceRequest,
  CreateWasteSourceResponse,
  UpdateWasteSourceRequest,
  UpdateWasteSourceResponse,
  PatchWasteSourceRequest,
  PatchWasteSourceResponse,
  DeleteWasteSourceRequest,
  DeleteWasteSourceResponse,
} from "./waste-source.types";

export const getAllWasteSources = api(
  { method: "GET", path: "/api/v1/waste-source", auth: true, expose: true },
  async (req: GetAllWasteSourcesRequest): Promise<GetAllWasteSourcesResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getAllWasteSources({ ...req, entityId });
    return { status: "success", data };
  }
);

export const createWasteSource = api(
  { method: "POST", path: "/api/v1/waste-source", auth: true, expose: true },
  async (req: CreateWasteSourceRequest): Promise<CreateWasteSourceResponse> => {
    const { userID, entityId } = getAuthData()!;
    const data = await service.createWasteSource({ ...req, createdBy: userID, entityId });
    return { status: "success", data };
  }
);

export const getWasteSourceById = api(
  { method: "GET", path: "/api/v1/waste-source/:id", auth: true, expose: true },
  async (req: GetWasteSourceByIdRequest): Promise<GetWasteSourceByIdResponse> => {
    const data = await service.getWasteSourceById(req.id);
    return { status: "success", data };
  }
);

export const updateWasteSource = api(
  { method: "PUT", path: "/api/v1/waste-source/:id", auth: true, expose: true },
  async (req: UpdateWasteSourceRequest): Promise<UpdateWasteSourceResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.updateWasteSource({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const patchWasteSource = api(
  { method: "PATCH", path: "/api/v1/waste-source/:id", auth: true, expose: true },
  async (req: PatchWasteSourceRequest): Promise<PatchWasteSourceResponse> => {
    const data = await service.patchWasteSource(req.id, req.is_active);
    return { status: "success", data };
  }
);

export const deleteWasteSource = api(
  { method: "DELETE", path: "/api/v1/waste-source/:id", auth: true, expose: true },
  async (req: DeleteWasteSourceRequest): Promise<DeleteWasteSourceResponse> => {
    const { userNumericId } = getAuthData()!;
    const data = await service.deleteWasteSource(req.id, userNumericId);
    return { status: "success", data };
  }
);
