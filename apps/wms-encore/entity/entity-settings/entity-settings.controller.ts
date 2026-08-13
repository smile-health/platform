// Routes — mirrors apps/wms-service/src/interfaces/http/routes/enititySettingsRoutes.ts:
//
//   GET    /api/v1/entity-settings              getAllEntitySettings     (role: allRead)
//   POST   /api/v1/entity-settings               createEntitySettings     (role: onlyAdmin)
//   GET    /api/v1/entity-settings/:id           getEntitySettingsById    (role: allRead)
//   PUT    /api/v1/entity-settings/:id           updateEntitySettings     (role: onlyAdmin)
//   DELETE /api/v1/entity-settings/:id           deleteEntitySettings     (role: onlyAdmin)
//
// Role checks (allRead/onlyAdmin) are not re-implemented here — same gap as
// region's ported endpoints; role enforcement is still owed as a general
// cross-cutting piece of the auth port, not specific to this module.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./entity-settings.service";
import type {
  GetEntitySettingsByIdRequest,
  GetEntitySettingsByIdResponse,
  GetAllEntitySettingsRequest,
  GetAllEntitySettingsResponse,
  CreateEntitySettingsRequest,
  CreateEntitySettingsResponse,
  UpdateEntitySettingsRequest,
  UpdateEntitySettingsResponse,
  DeleteEntitySettingsRequest,
  DeleteEntitySettingsResponse,
} from "./entity-settings.types";

export const getEntitySettingsById = api(
  { method: "GET", path: "/api/v1/entity-settings/:id", auth: true, expose: true },
  async ({ id }: GetEntitySettingsByIdRequest): Promise<GetEntitySettingsByIdResponse> => {
    const data = await service.getEntitySettingsById(id);
    return { status: "success", data };
  }
);

export const getAllEntitySettings = api(
  { method: "GET", path: "/api/v1/entity-settings", auth: true, expose: true },
  async (params: GetAllEntitySettingsRequest): Promise<GetAllEntitySettingsResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getAllEntitySettings({ ...params, entityId: String(entityId) });
    return { status: "success", data };
  }
);

export const createEntitySettings = api(
  { method: "POST", path: "/api/v1/entity-settings", auth: true, expose: true },
  async (body: CreateEntitySettingsRequest): Promise<CreateEntitySettingsResponse> => {
    const { userID, entityId } = getAuthData()!;
    const data = await service.createEntitySettings({
      ...body,
      entityId: body.entityId ?? entityId,
      createdBy: userID,
    });
    return { status: "success", data };
  }
);

export const updateEntitySettings = api(
  { method: "PUT", path: "/api/v1/entity-settings/:id", auth: true, expose: true },
  async ({ id, ...body }: UpdateEntitySettingsRequest): Promise<UpdateEntitySettingsResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.updateEntitySettings({ ...body, id, updatedBy: userID });
    return { status: "success", data };
  }
);

export const deleteEntitySettings = api(
  { method: "DELETE", path: "/api/v1/entity-settings/:id", auth: true, expose: true },
  async ({ id }: DeleteEntitySettingsRequest): Promise<DeleteEntitySettingsResponse> => {
    const data = await service.deleteEntitySettings(id);
    return { status: "success", data };
  }
);
