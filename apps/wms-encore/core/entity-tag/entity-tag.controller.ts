// Real endpoints ported from apps/core's wire.ts mount "/entity-tags"
// (routeConfigs name "entity-tag"). CRUD only — the original's module-specific
// endpoints beyond list/get/create/update/delete aren't ported here.
import { api, APIError } from "encore.dev/api";
import * as repo from "./entity-tag.repository";

interface EntityTagListParams {
  limit?: number;
  page?: number;
  search?: string;
}

// Concrete DTO (not Record<string,unknown>/Partial<T>) — Encore's schema
// parser needs a literal interface, not a generic/utility type.
interface EntityTagDto {
  title?: string | null;
  integration_type?: number | null;
  is_open_vial?: number | null;
}

interface EntityTagUpdateDto extends EntityTagDto {
  id: number;
}

// Plain response type — repo.EntityTagRow uses Kysely's Generated<T> wrapper
// internally, which Encore's schema parser can't resolve in an API
// response either; cast to this at the API boundary instead.
interface EntityTagResponseDto extends EntityTagDto {
  id: number;
}

export const listEntityTag = api(
  { method: "GET", path: "/api/v1/core/entity-tags", auth: false, expose: true },
  async (params: EntityTagListParams): Promise<{ status: "success"; data: EntityTagResponseDto[] }> => {
    const data = await repo.list({ limit: params.limit ?? 20, page: params.page ?? 1, search: params.search });
    return { status: "success", data: data as unknown as EntityTagResponseDto[] };
  },
);

export const getEntityTag = api(
  { method: "GET", path: "/api/v1/core/entity-tags/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: EntityTagResponseDto }> => {
    const row = await repo.findById(id);
    if (!row) throw APIError.notFound("EntityTag not found");
    return { status: "success", data: row as unknown as EntityTagResponseDto };
  },
);

export const createEntityTag = api(
  { method: "POST", path: "/api/v1/core/entity-tags", auth: false, expose: true },
  async (data: EntityTagDto): Promise<{ status: "success"; data: { id: number } }> => {
    // TODO: createdBy from auth context (hardcoded 0 for now).
    const id = await repo.create(data as never);
    return { status: "success", data: { id } };
  },
);

export const updateEntityTag = api(
  { method: "PUT", path: "/api/v1/core/entity-tags/:id", auth: false, expose: true },
  async ({ id, ...data }: EntityTagUpdateDto): Promise<{ status: "success"; data: null }> => {
    await repo.update(id, data as never);
    return { status: "success", data: null };
  },
);

export const deleteEntityTag = api(
  { method: "DELETE", path: "/api/v1/core/entity-tags/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: null }> => {
    await repo.softDelete(id);
    return { status: "success", data: null };
  },
);
