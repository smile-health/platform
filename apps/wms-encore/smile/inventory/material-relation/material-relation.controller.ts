// Real endpoints ported from apps/core's wire.ts mount "/material-relations"
// (routeConfigs name "material-relation"). CRUD only — the original's module-specific
// endpoints beyond list/get/create/update/delete aren't ported here.
import { api, APIError } from "encore.dev/api";
import * as repo from "./material-relation.repository";

interface MaterialRelationListParams {
  limit?: number;
  page?: number;
}

// Concrete DTO (not Record<string,unknown>/Partial<T>) — Encore's schema
// parser needs a literal interface, not a generic/utility type.
interface MaterialRelationDto {
  parent_material_id?: number;
  child_material_id?: number;
}

interface MaterialRelationUpdateDto extends MaterialRelationDto {
  id: number;
}

// Plain response type — repo.MaterialRelationRow uses Kysely's Generated<T> wrapper
// internally, which Encore's schema parser can't resolve in an API
// response either; cast to this at the API boundary instead.
interface MaterialRelationResponseDto extends MaterialRelationDto {
  id: number;
}

export const listMaterialRelation = api(
  { method: "GET", path: "/api/v1/core/material-relations", auth: false, expose: true },
  async (params: MaterialRelationListParams): Promise<{ status: "success"; data: MaterialRelationResponseDto[] }> => {
    const data = await repo.list({ limit: params.limit ?? 20, page: params.page ?? 1 });
    return { status: "success", data: data as unknown as MaterialRelationResponseDto[] };
  },
);

export const getMaterialRelation = api(
  { method: "GET", path: "/api/v1/core/material-relations/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: MaterialRelationResponseDto }> => {
    const row = await repo.findById(id);
    if (!row) throw APIError.notFound("MaterialRelation not found");
    return { status: "success", data: row as unknown as MaterialRelationResponseDto };
  },
);

export const createMaterialRelation = api(
  { method: "POST", path: "/api/v1/core/material-relations", auth: false, expose: true },
  async (data: MaterialRelationDto): Promise<{ status: "success"; data: { id: number } }> => {
    // TODO: createdBy from auth context (hardcoded 0 for now).
    const id = await repo.create(data as never);
    return { status: "success", data: { id } };
  },
);

export const updateMaterialRelation = api(
  { method: "PUT", path: "/api/v1/core/material-relations/:id", auth: false, expose: true },
  async ({ id, ...data }: MaterialRelationUpdateDto): Promise<{ status: "success"; data: null }> => {
    await repo.update(id, data as never);
    return { status: "success", data: null };
  },
);

export const deleteMaterialRelation = api(
  { method: "DELETE", path: "/api/v1/core/material-relations/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: null }> => {
    await repo.softDelete(id);
    return { status: "success", data: null };
  },
);
