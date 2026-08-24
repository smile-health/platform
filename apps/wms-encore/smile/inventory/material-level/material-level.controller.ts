// Real endpoints ported from apps/core's wire.ts mount "/material-levels"
// (routeConfigs name "material-level"). CRUD only — the original's module-specific
// endpoints beyond list/get/create/update/delete aren't ported here.
import { api, APIError } from "encore.dev/api";
import * as repo from "./material-level.repository";

interface MaterialLevelListParams {
  limit?: number;
  page?: number;
  search?: string;
}

// Concrete DTO (not Record<string,unknown>/Partial<T>) — Encore's schema
// parser needs a literal interface, not a generic/utility type.
interface MaterialLevelDto {
  name?: string;
  order?: string;
  enable?: number | null;
}

interface MaterialLevelUpdateDto extends MaterialLevelDto {
  id: number;
}

// Plain response type — repo.MaterialLevelRow uses Kysely's Generated<T> wrapper
// internally, which Encore's schema parser can't resolve in an API
// response either; cast to this at the API boundary instead.
interface MaterialLevelResponseDto extends MaterialLevelDto {
  id: number;
}

export const listMaterialLevel = api(
  { method: "GET", path: "/api/v1/core/material-levels", auth: false, expose: true },
  async (params: MaterialLevelListParams): Promise<{ status: "success"; data: MaterialLevelResponseDto[] }> => {
    const data = await repo.list({ limit: params.limit ?? 20, page: params.page ?? 1, search: params.search });
    return { status: "success", data: data as unknown as MaterialLevelResponseDto[] };
  },
);

export const getMaterialLevel = api(
  { method: "GET", path: "/api/v1/core/material-levels/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: MaterialLevelResponseDto }> => {
    const row = await repo.findById(id);
    if (!row) throw APIError.notFound("MaterialLevel not found");
    return { status: "success", data: row as unknown as MaterialLevelResponseDto };
  },
);

export const createMaterialLevel = api(
  { method: "POST", path: "/api/v1/core/material-levels", auth: false, expose: true },
  async (data: MaterialLevelDto): Promise<{ status: "success"; data: { id: number } }> => {
    // TODO: createdBy from auth context (hardcoded 0 for now).
    const id = await repo.create(data as never);
    return { status: "success", data: { id } };
  },
);

export const updateMaterialLevel = api(
  { method: "PUT", path: "/api/v1/core/material-levels/:id", auth: false, expose: true },
  async ({ id, ...data }: MaterialLevelUpdateDto): Promise<{ status: "success"; data: null }> => {
    await repo.update(id, data as never);
    return { status: "success", data: null };
  },
);

export const deleteMaterialLevel = api(
  { method: "DELETE", path: "/api/v1/core/material-levels/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: null }> => {
    await repo.softDelete(id);
    return { status: "success", data: null };
  },
);
