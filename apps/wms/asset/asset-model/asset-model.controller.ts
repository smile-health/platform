// Routes — mirrors apps/wms-service's assetModelRoutes.ts (mounted at
// /asset-model, matching v1Router.use('/asset-model', ...)):
//
//   GET    /api/v1/asset-model       getAllAssetModels   (authenticate, rateLimitter)
//   POST   /api/v1/asset-model       createAssetModel    (authenticate, rateLimitter, createAssetSchema)
//   GET    /api/v1/asset-model/:id   getAssetModelById   (authenticate, rateLimitter)
//   PUT    /api/v1/asset-model/:id   updateAssetModel    (authenticate, rateLimitter, updateAssetSchema)
//   DELETE /api/v1/asset-model/:id   deleteAssetModel    (authenticate, rateLimitter)
//
// Rate limiting isn't enforced — not a gap, since the original doesn't enforce it either (see partnership/rbac.ts), same as every other ported
// module.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./asset-model.service";
import type {
  GetAllAssetModelsRequest,
  GetAllAssetModelsResponse,
  GetAssetModelByIdRequest,
  GetAssetModelByIdResponse,
  CreateAssetModelRequest,
  CreateAssetModelResponse,
  UpdateAssetModelRequest,
  UpdateAssetModelResponse,
  DeleteAssetModelRequest,
  DeleteAssetModelResponse,
} from "./asset-model.types";

export const getAllAssetModels = api(
  { method: "GET", path: "/api/v1/asset-model", auth: true, expose: true },
  async (req: GetAllAssetModelsRequest): Promise<GetAllAssetModelsResponse> => {
    const data = await service.getAllAssetModels(req);
    return { status: "success", data };
  }
);

export const createAssetModel = api(
  { method: "POST", path: "/api/v1/asset-model", auth: true, expose: true },
  async (req: CreateAssetModelRequest): Promise<CreateAssetModelResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.createAssetModel({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);

export const getAssetModelById = api(
  { method: "GET", path: "/api/v1/asset-model/:id", auth: true, expose: true },
  async (req: GetAssetModelByIdRequest): Promise<GetAssetModelByIdResponse> => {
    const data = await service.getAssetModelById(req.id);
    return { status: "success", data };
  }
);

export const updateAssetModel = api(
  { method: "PUT", path: "/api/v1/asset-model/:id", auth: true, expose: true },
  async (req: UpdateAssetModelRequest): Promise<UpdateAssetModelResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.updateAssetModel({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const deleteAssetModel = api(
  { method: "DELETE", path: "/api/v1/asset-model/:id", auth: true, expose: true },
  async (req: DeleteAssetModelRequest): Promise<DeleteAssetModelResponse> => {
    const { userNumericId } = getAuthData()!;
    const data = await service.deleteAssetModel(req.id, userNumericId);
    return { status: "success", data };
  }
);
