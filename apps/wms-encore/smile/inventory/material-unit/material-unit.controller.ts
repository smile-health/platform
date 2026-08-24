// Real endpoints ported from apps/core's wire.ts mount "/material-units"
// (routeConfigs name "material-unit"). CRUD only — the original's module-specific
// endpoints beyond list/get/create/update/delete aren't ported here.
import { api, APIError } from "encore.dev/api";
import * as repo from "./material-unit.repository";

interface MaterialUnitListParams {
  limit?: number;
  page?: number;
  search?: string;
}

// Concrete DTO (not Record<string,unknown>/Partial<T>) — Encore's schema
// parser needs a literal interface, not a generic/utility type.
interface MaterialUnitDto {
  name?: string;
  type?: string;
}

interface MaterialUnitUpdateDto extends MaterialUnitDto {
  id: number;
}

// Plain response type — repo.MaterialUnitRow uses Kysely's Generated<T> wrapper
// internally, which Encore's schema parser can't resolve in an API
// response either; cast to this at the API boundary instead.
interface MaterialUnitResponseDto extends MaterialUnitDto {
  id: number;
}

export const listMaterialUnit = api(
  { method: "GET", path: "/api/v1/core/material-units", auth: false, expose: true },
  async (params: MaterialUnitListParams): Promise<{ status: "success"; data: MaterialUnitResponseDto[] }> => {
    const data = await repo.list({ limit: params.limit ?? 20, page: params.page ?? 1, search: params.search });
    return { status: "success", data: data as unknown as MaterialUnitResponseDto[] };
  },
);

export const getMaterialUnit = api(
  { method: "GET", path: "/api/v1/core/material-units/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: MaterialUnitResponseDto }> => {
    const row = await repo.findById(id);
    if (!row) throw APIError.notFound("MaterialUnit not found");
    return { status: "success", data: row as unknown as MaterialUnitResponseDto };
  },
);

export const createMaterialUnit = api(
  { method: "POST", path: "/api/v1/core/material-units", auth: false, expose: true },
  async (data: MaterialUnitDto): Promise<{ status: "success"; data: { id: number } }> => {
    // TODO: createdBy from auth context (hardcoded 0 for now).
    const id = await repo.create(data as never);
    return { status: "success", data: { id } };
  },
);

export const updateMaterialUnit = api(
  { method: "PUT", path: "/api/v1/core/material-units/:id", auth: false, expose: true },
  async ({ id, ...data }: MaterialUnitUpdateDto): Promise<{ status: "success"; data: null }> => {
    await repo.update(id, data as never);
    return { status: "success", data: null };
  },
);

export const deleteMaterialUnit = api(
  { method: "DELETE", path: "/api/v1/core/material-units/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: null }> => {
    await repo.softDelete(id);
    return { status: "success", data: null };
  },
);
