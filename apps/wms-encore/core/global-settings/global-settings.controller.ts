// Routes — mirrors apps/wms-service's globalSettingsRoutes.ts (mounted at
// /global-settings, matching v1Router.use('/global-settings', ...)):
//
//   GET    /api/v1/global-settings       getAllGlobalSettings   (role: allRead)
//   POST   /api/v1/global-settings       createGlobalSettings   (role: onlySuperAdmin)
//   GET    /api/v1/global-settings/:id   getGlobalSettingsById  (role: allRead)
//   PUT    /api/v1/global-settings/:id   updateGlobalSettings   (role: onlySuperAdmin)
//   DELETE /api/v1/global-settings/:id   deleteGlobalSettings   (role: onlySuperAdmin)
//
// Role-based authorization (allRead / onlySuperAdmin) isn't enforced yet —
// same known gap as every other ported module; authorizeRoles.ts's role
// check itself has a documented bug upstream (see the migration plan).

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./global-settings.service";
import type {
  GetGlobalSettingsByIdRequest,
  GetGlobalSettingsByIdResponse,
  GetAllGlobalSettingsRequest,
  GetAllGlobalSettingsResponse,
  CreateGlobalSettingsRequest,
  CreateGlobalSettingsResponse,
  UpdateGlobalSettingsRequest,
  UpdateGlobalSettingsResponse,
  DeleteGlobalSettingsRequest,
  DeleteGlobalSettingsResponse,
} from "./global-settings.types";

export const getAllGlobalSettings = api(
  { method: "GET", path: "/api/v1/global-settings", auth: true, expose: true },
  async (req: GetAllGlobalSettingsRequest): Promise<GetAllGlobalSettingsResponse> => {
    const data = await service.getAllGlobalSettings(req);
    return { status: "success", data };
  }
);

export const createGlobalSettings = api(
  { method: "POST", path: "/api/v1/global-settings", auth: true, expose: true },
  async (req: CreateGlobalSettingsRequest): Promise<CreateGlobalSettingsResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.createGlobalSettings({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);

export const getGlobalSettingsById = api(
  { method: "GET", path: "/api/v1/global-settings/:id", auth: true, expose: true },
  async (req: GetGlobalSettingsByIdRequest): Promise<GetGlobalSettingsByIdResponse> => {
    const data = await service.getGlobalSettingsById(req.id);
    return { status: "success", data };
  }
);

export const updateGlobalSettings = api(
  { method: "PUT", path: "/api/v1/global-settings/:id", auth: true, expose: true },
  async (req: UpdateGlobalSettingsRequest): Promise<UpdateGlobalSettingsResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.updateGlobalSettings({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const deleteGlobalSettings = api(
  { method: "DELETE", path: "/api/v1/global-settings/:id", auth: true, expose: true },
  async (req: DeleteGlobalSettingsRequest): Promise<DeleteGlobalSettingsResponse> => {
    const { userNumericId } = getAuthData()!;
    const data = await service.deleteGlobalSettings(req.id, userNumericId);
    return { status: "success", data };
  }
);
