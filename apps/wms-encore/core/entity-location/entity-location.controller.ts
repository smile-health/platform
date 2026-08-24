// Routes — mirrors apps/wms-service's entityLocationRoutes.ts:
//
//   GET    /api/v1/entity-location/:id   getEntityLocationById
//   GET    /api/v1/entity-location       getAllEntityLocation
//   GET    /api/v1/entity-location/list  getAllEntityLocationByEntity
//   POST   /api/v1/entity-location       createEntityLocation
//   PUT    /api/v1/entity-location/:id   updateEntityLocation
//   DELETE /api/v1/entity-location/:id                  deleteEntityLocation
//   PATCH  /api/v1/mobile/validate/distance-limit        validateDistanceLimit

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./entity-location.service";
import type {
  GetEntityLocationByIdRequest,
  GetEntityLocationByIdResponse,
  GetAllEntityLocationRequest,
  GetAllEntityLocationResponse,
  GetAllEntityLocationByEntityRequest,
  GetAllEntityLocationByEntityResponse,
  CreateEntityLocationRequest,
  CreateEntityLocationResponse,
  UpdateEntityLocationRequest,
  UpdateEntityLocationResponse,
  DeleteEntityLocationRequest,
  DeleteEntityLocationResponse,
  ValidateDistanceLimitRequest,
  ValidateDistanceLimitResponse,
} from "./entity-location.types";

export const getEntityLocationById = api(
  { method: "GET", path: "/api/v1/entity-location/:id", auth: true, expose: true },
  async (req: GetEntityLocationByIdRequest): Promise<GetEntityLocationByIdResponse> => {
    const data = await service.getEntityLocationById(req.id);
    return { status: "success", data };
  }
);

export const getAllEntityLocation = api(
  { method: "GET", path: "/api/v1/entity-location", auth: true, expose: true },
  async (req: GetAllEntityLocationRequest): Promise<GetAllEntityLocationResponse> => {
    const { entityId, isSuperAdmin, tag } = getAuthData()!;
    const data = await service.getAllEntityLocation({
      limit: req.limit,
      page: req.page,
      search: req.search,
      locationType: req.locationType,
      entityId: String(entityId),
      tag,
      isSuperAdmin,
    });
    return { status: "success", data };
  }
);

export const getAllEntityLocationByEntity = api(
  { method: "GET", path: "/api/v1/entity-location/list", auth: true, expose: true },
  async (req: GetAllEntityLocationByEntityRequest): Promise<GetAllEntityLocationByEntityResponse> => {
    const data = await service.getAllEntityLocationByEntity(req);
    return { status: "success", data };
  }
);

export const createEntityLocation = api(
  { method: "POST", path: "/api/v1/entity-location", auth: true, expose: true },
  async (req: CreateEntityLocationRequest): Promise<CreateEntityLocationResponse> => {
    const { userID, entityId, entityTag } = getAuthData()!;
    const data = await service.createEntityLocation({
      ...req,
      entityId: req.entityId ?? entityId,
      createdBy: userID,
      locationType: "STORAGE",
      entityTag,
    });
    return { status: "success", data };
  }
);

export const updateEntityLocation = api(
  { method: "PUT", path: "/api/v1/entity-location/:id", auth: true, expose: true },
  async (req: UpdateEntityLocationRequest): Promise<UpdateEntityLocationResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.updateEntityLocation({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const deleteEntityLocation = api(
  { method: "DELETE", path: "/api/v1/entity-location/:id", auth: true, expose: true },
  async (req: DeleteEntityLocationRequest): Promise<DeleteEntityLocationResponse> => {
    const data = await service.deleteEntityLocation(req.id);
    return { status: "success", data };
  }
);

export const validateDistanceLimit = api(
  { method: "PATCH", path: "/api/v1/mobile/validate/distance-limit", auth: true, expose: true },
  async (req: ValidateDistanceLimitRequest): Promise<ValidateDistanceLimitResponse> => {
    const data = await service.validateDistanceLimit(req.id, req.longitude, req.latitude);
    return { status: "success", data };
  }
);
