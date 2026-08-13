// Routes — mirrors apps/wms-service/src/interfaces/http/routes/regionRoutes.ts:
//
//   GET  /api/v1/region/:id              getRegionById   (role: allRead)
//   GET  /api/v1/region/distance-limit   getDistanceLimit (authenticated)
//
// Region has no create/update/delete endpoint in the original service — it's
// read-only from the API's perspective — so none is added here either.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./region.service";
import type {
  GetRegionByIdRequest,
  GetRegionByIdResponse,
  GetDistanceLimitRequest,
  GetDistanceLimitResponse,
} from "./region.types";

export const getRegionById = api(
  { method: "GET", path: "/api/v1/region/:id", auth: true, expose: true },
  async ({ id }: GetRegionByIdRequest): Promise<GetRegionByIdResponse> => {
    const region = await service.getRegionById(id);
    return { status: "success", data: region };
  }
);

export const getDistanceLimit = api(
  { method: "GET", path: "/api/v1/region/distance-limit", auth: true, expose: true },
  async (params: GetDistanceLimitRequest): Promise<GetDistanceLimitResponse> => {
    const { entityId } = getAuthData()!;
    const result = await service.getDistanceLimit({ ...params, entityId });
    return { status: "success", data: result };
  }
);
