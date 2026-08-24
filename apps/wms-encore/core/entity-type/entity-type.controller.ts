// Real endpoints ported from apps/core's wire.ts mount "/entity-types"
// (routeConfigs name "entity-type"). CRUD only — the original's module-specific
// endpoints beyond list/get/create/update/delete aren't ported here.
import { api, APIError } from "encore.dev/api";
import * as repo from "./entity-type.repository";

interface EntityTypeListParams {
  limit?: number;
  page?: number;
  search?: string;
}

// Concrete DTO (not Record<string,unknown>/Partial<T>) — Encore's schema
// parser needs a literal interface, not a generic/utility type.
interface EntityTypeDto {
  name?: string;
  integration_type?: number | null;
  external_properties?: string | null;
}

interface EntityTypeUpdateDto extends EntityTypeDto {
  id: number;
}

// Plain response type — repo.EntityTypeRow uses Kysely's Generated<T> wrapper
// internally, which Encore's schema parser can't resolve in an API
// response either; cast to this at the API boundary instead.
interface EntityTypeResponseDto extends EntityTypeDto {
  id: number;
}

export const listEntityType = api(
  { method: "GET", path: "/api/v1/core/entity-types", auth: false, expose: true },
  async (params: EntityTypeListParams): Promise<{ status: "success"; data: EntityTypeResponseDto[] }> => {
    const data = await repo.list({ limit: params.limit ?? 20, page: params.page ?? 1, search: params.search });
    return { status: "success", data: data as unknown as EntityTypeResponseDto[] };
  },
);

export const getEntityType = api(
  { method: "GET", path: "/api/v1/core/entity-types/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: EntityTypeResponseDto }> => {
    const row = await repo.findById(id);
    if (!row) throw APIError.notFound("EntityType not found");
    return { status: "success", data: row as unknown as EntityTypeResponseDto };
  },
);

export const createEntityType = api(
  { method: "POST", path: "/api/v1/core/entity-types", auth: false, expose: true },
  async (data: EntityTypeDto): Promise<{ status: "success"; data: { id: number } }> => {
    // TODO: createdBy from auth context (hardcoded 0 for now).
    const id = await repo.create(data as never);
    return { status: "success", data: { id } };
  },
);

export const updateEntityType = api(
  { method: "PUT", path: "/api/v1/core/entity-types/:id", auth: false, expose: true },
  async ({ id, ...data }: EntityTypeUpdateDto): Promise<{ status: "success"; data: null }> => {
    await repo.update(id, data as never);
    return { status: "success", data: null };
  },
);

export const deleteEntityType = api(
  { method: "DELETE", path: "/api/v1/core/entity-types/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: null }> => {
    await repo.softDelete(id);
    return { status: "success", data: null };
  },
);
