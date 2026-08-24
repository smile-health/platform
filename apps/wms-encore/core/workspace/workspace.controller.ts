// Real endpoints ported from apps/core's wire.ts mount "/workspaces"
// (routeConfigs name "workspace"). CRUD only — the original's module-specific
// endpoints beyond list/get/create/update/delete aren't ported here.
import { api, APIError } from "encore.dev/api";
import * as repo from "./workspace.repository";

interface WorkspaceListParams {
  limit?: number;
  page?: number;
  search?: string;
}

// Concrete DTO (not Record<string,unknown>/Partial<T>) — Encore's schema
// parser needs a literal interface, not a generic/utility type.
interface WorkspaceDto {
  key?: string;
  name?: string;
  description?: string | null;
  config?: string | null;
  program_uuid?: string | null;
  is_beneficiaries?: number | null;
}

interface WorkspaceUpdateDto extends WorkspaceDto {
  id: number;
}

// Plain response type — repo.WorkspaceRow uses Kysely's Generated<T> wrapper
// internally, which Encore's schema parser can't resolve in an API
// response either; cast to this at the API boundary instead.
interface WorkspaceResponseDto extends WorkspaceDto {
  id: number;
}

export const listWorkspace = api(
  { method: "GET", path: "/api/v1/core/workspaces", auth: false, expose: true },
  async (params: WorkspaceListParams): Promise<{ status: "success"; data: WorkspaceResponseDto[] }> => {
    const data = await repo.list({ limit: params.limit ?? 20, page: params.page ?? 1, search: params.search });
    return { status: "success", data: data as unknown as WorkspaceResponseDto[] };
  },
);

export const getWorkspace = api(
  { method: "GET", path: "/api/v1/core/workspaces/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: WorkspaceResponseDto }> => {
    const row = await repo.findById(id);
    if (!row) throw APIError.notFound("Workspace not found");
    return { status: "success", data: row as unknown as WorkspaceResponseDto };
  },
);

export const createWorkspace = api(
  { method: "POST", path: "/api/v1/core/workspaces", auth: false, expose: true },
  async (data: WorkspaceDto): Promise<{ status: "success"; data: { id: number } }> => {
    // TODO: createdBy from auth context (hardcoded 0 for now).
    const id = await repo.create(data as never, 0);
    return { status: "success", data: { id } };
  },
);

export const updateWorkspace = api(
  { method: "PUT", path: "/api/v1/core/workspaces/:id", auth: false, expose: true },
  async ({ id, ...data }: WorkspaceUpdateDto): Promise<{ status: "success"; data: null }> => {
    await repo.update(id, data as never, 0);
    return { status: "success", data: null };
  },
);

export const deleteWorkspace = api(
  { method: "DELETE", path: "/api/v1/core/workspaces/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: null }> => {
    await repo.softDelete(id, 0);
    return { status: "success", data: null };
  },
);
