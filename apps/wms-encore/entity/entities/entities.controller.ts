// Routes — mirrors apps/wms-service's entitiesRoutes.ts:
//
//   GET   /api/v1/entities        getEntitiesById
//   GET   /api/v1/entities/all    getAllEntities
//   PATCH /api/v1/entities        updateEntities
//   PUT   /api/v1/entities/:id    updateStatusEntities

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./entities.service";
import type {
  GetEntitiesByIdRequest,
  GetEntitiesByIdResponse,
  GetAllEntitiesRequest,
  GetAllEntitiesResponse,
  UpdateEntitiesRequestBody,
  UpdateEntitiesResponse,
  UpdateStatusEntitiesRequest,
  UpdateStatusEntitiesResponse,
} from "./entities.types";

export const getEntitiesById = api(
  { method: "GET", path: "/api/v1/entities", auth: true, expose: true },
  async (req: GetEntitiesByIdRequest): Promise<GetEntitiesByIdResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getEntitiesById({ entityId: req.entityId, userEntityId: entityId });
    return { status: "success", data };
  }
);

export const getAllEntities = api(
  { method: "GET", path: "/api/v1/entities/all", auth: true, expose: true },
  async (req: GetAllEntitiesRequest): Promise<GetAllEntitiesResponse> => {
    const data = await service.getAllEntities(req);
    return { status: "success", data };
  }
);

interface UpdateEntitiesRequest extends UpdateEntitiesRequestBody {
  entityId?: number;
}

export const updateEntities = api(
  { method: "PATCH", path: "/api/v1/entities", auth: true, expose: true },
  async (req: UpdateEntitiesRequest): Promise<UpdateEntitiesResponse> => {
    const { entityId, ...body } = req;
    const data = await service.updateEntities({ entityId, body });
    return { status: "success", data };
  }
);

export const updateStatusEntities = api(
  { method: "PUT", path: "/api/v1/entities/:id", auth: true, expose: true },
  async (req: UpdateStatusEntitiesRequest): Promise<UpdateStatusEntitiesResponse> => {
    const data = await service.updateStatusEntities(req);
    return { status: "success", data };
  }
);
