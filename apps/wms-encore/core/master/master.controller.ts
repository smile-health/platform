// Real endpoints ported from apps/core's wire.ts mount "/master"
// (getLocations, findLocationsByIds only — that's the entire original
// MasterRepository, this module is smaller than its name suggests).
import { api } from "encore.dev/api";
import * as repo from "./master.repository";

interface LocationResponseDto {
  id: number;
  name: string;
  level: number | null;
  parent_id: number | null;
  lat: string | null;
  lng: string | null;
}

export const getLocations = api(
  { method: "GET", path: "/api/v1/core/master/locations", auth: false, expose: true },
  async (params: {
    level: number;
    parentIds?: number[];
    keyword?: string;
    limit?: number;
    page?: number;
  }): Promise<{ status: "success"; data: LocationResponseDto[] }> => {
    const data = await repo.getLocations({
      level: params.level,
      parentIds: params.parentIds,
      keyword: params.keyword,
      limit: params.limit ?? 20,
      page: params.page ?? 1,
    });
    return { status: "success", data: data as unknown as LocationResponseDto[] };
  },
);

export const findLocationsByIds = api(
  { method: "GET", path: "/api/v1/core/master/locations/by-ids", auth: false, expose: true },
  async (params: { ids: number[] }): Promise<{ status: "success"; data: LocationResponseDto[] }> => {
    const data = await repo.findLocationsByIds(params.ids);
    return { status: "success", data: data as unknown as LocationResponseDto[] };
  },
);
