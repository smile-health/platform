// Routes — mirrors apps/wms-service's assetDongleRoutes.ts (mounted at
// /asset-dongle, matching v1Router.use('/asset-dongle', ...)):
//
//   GET    /api/v1/asset-dongle            getAllAssetDongle
//   POST   /api/v1/asset-dongle            createAssetDongle
//   DELETE /api/v1/asset-dongle/:assetId   deleteAssetDongle
//
// authenticate + rateLimitter middlewares aren't enforced yet — same known
// gap as every other ported module.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./asset-dongle.service";
import type {
  GetAllAssetDongleRequest,
  GetAllAssetDongleResponse,
  CreateAssetDongleRequest,
  CreateAssetDongleResponse,
  DeleteAssetDongleRequest,
  DeleteAssetDongleResponse,
} from "./asset-dongle.types";

export const getAllAssetDongle = api(
  { method: "GET", path: "/api/v1/asset-dongle", auth: true, expose: true },
  async (req: GetAllAssetDongleRequest): Promise<GetAllAssetDongleResponse> => {
    const data = await service.getAllAssetDongle(req);
    return { status: "success", data };
  }
);

export const createAssetDongle = api(
  { method: "POST", path: "/api/v1/asset-dongle", auth: true, expose: true },
  async (req: CreateAssetDongleRequest): Promise<CreateAssetDongleResponse> => {
    const data = await service.createAssetDongle(req);
    return { status: "success", data };
  }
);

export const deleteAssetDongle = api(
  { method: "DELETE", path: "/api/v1/asset-dongle/:assetId", auth: true, expose: true },
  async (req: DeleteAssetDongleRequest): Promise<DeleteAssetDongleResponse> => {
    const { userNumericId } = getAuthData()!;
    const data = await service.deleteAssetDongle(req.assetId, userNumericId);
    return { status: "success", data };
  }
);
