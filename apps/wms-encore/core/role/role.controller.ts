// Real endpoints ported from apps/core's wire.ts mount "/roles"
// (routeConfigs name "role"). CRUD only — the original's module-specific
// endpoints beyond list/get/create/update/delete aren't ported here.
import { api, APIError } from "encore.dev/api";
import * as repo from "./role.repository";

interface RoleListParams {
  limit?: number;
  page?: number;
  search?: string;
}

// Concrete DTO (not Record<string,unknown>/Partial<T>) — Encore's schema
// parser needs a literal interface, not a generic/utility type.
interface RoleDto {
  name?: string;
  is_disabled_notification?: number;
}

interface RoleUpdateDto extends RoleDto {
  id: number;
}

// Plain response type — repo.RoleRow uses Kysely's Generated<T> wrapper
// internally, which Encore's schema parser can't resolve in an API
// response either; cast to this at the API boundary instead.
interface RoleResponseDto extends RoleDto {
  id: number;
}

export const listRole = api(
  { method: "GET", path: "/api/v1/core/roles", auth: false, expose: true },
  async (params: RoleListParams): Promise<{ status: "success"; data: RoleResponseDto[] }> => {
    const data = await repo.list({ limit: params.limit ?? 20, page: params.page ?? 1, search: params.search });
    return { status: "success", data: data as unknown as RoleResponseDto[] };
  },
);

export const getRole = api(
  { method: "GET", path: "/api/v1/core/roles/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: RoleResponseDto }> => {
    const row = await repo.findById(id);
    if (!row) throw APIError.notFound("Role not found");
    return { status: "success", data: row as unknown as RoleResponseDto };
  },
);

export const createRole = api(
  { method: "POST", path: "/api/v1/core/roles", auth: false, expose: true },
  async (data: RoleDto): Promise<{ status: "success"; data: { id: number } }> => {
    // TODO: createdBy from auth context (hardcoded 0 for now).
    const id = await repo.create(data as never);
    return { status: "success", data: { id } };
  },
);

export const updateRole = api(
  { method: "PUT", path: "/api/v1/core/roles/:id", auth: false, expose: true },
  async ({ id, ...data }: RoleUpdateDto): Promise<{ status: "success"; data: null }> => {
    await repo.update(id, data as never);
    return { status: "success", data: null };
  },
);
