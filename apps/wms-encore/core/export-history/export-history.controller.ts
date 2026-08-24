// Real endpoints ported from apps/core's wire.ts mount "/export-histories"
// (routeConfigs name "export-history"). CRUD only — the original's module-specific
// endpoints beyond list/get/create/update/delete aren't ported here.
import { api, APIError } from "encore.dev/api";
import * as repo from "./export-history.repository";

interface ExportHistoryListParams {
  limit?: number;
  page?: number;
  search?: string;
}

// Concrete DTO (not Record<string,unknown>/Partial<T>) — Encore's schema
// parser needs a literal interface, not a generic/utility type.
interface ExportHistoryDto {
  filename?: string;
  original_filename?: string;
  download_url?: string | null;
  status?: "done" | "failed" | "in_progress" | "in_queue";
  program_id?: number | null;
  expires_at?: Date | null;
}

interface ExportHistoryUpdateDto extends ExportHistoryDto {
  id: number;
}

// Plain response type — repo.ExportHistoryRow uses Kysely's Generated<T> wrapper
// internally, which Encore's schema parser can't resolve in an API
// response either; cast to this at the API boundary instead.
interface ExportHistoryResponseDto extends ExportHistoryDto {
  id: number;
}

export const listExportHistory = api(
  { method: "GET", path: "/api/v1/core/export-histories", auth: false, expose: true },
  async (params: ExportHistoryListParams): Promise<{ status: "success"; data: ExportHistoryResponseDto[] }> => {
    const data = await repo.list({ limit: params.limit ?? 20, page: params.page ?? 1, search: params.search });
    return { status: "success", data: data as unknown as ExportHistoryResponseDto[] };
  },
);

export const getExportHistory = api(
  { method: "GET", path: "/api/v1/core/export-histories/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: ExportHistoryResponseDto }> => {
    const row = await repo.findById(id);
    if (!row) throw APIError.notFound("ExportHistory not found");
    return { status: "success", data: row as unknown as ExportHistoryResponseDto };
  },
);

export const createExportHistory = api(
  { method: "POST", path: "/api/v1/core/export-histories", auth: false, expose: true },
  async (data: ExportHistoryDto): Promise<{ status: "success"; data: { id: number } }> => {
    // TODO: createdBy from auth context (hardcoded 0 for now).
    const id = await repo.create(data as never);
    return { status: "success", data: { id } };
  },
);

export const updateExportHistory = api(
  { method: "PUT", path: "/api/v1/core/export-histories/:id", auth: false, expose: true },
  async ({ id, ...data }: ExportHistoryUpdateDto): Promise<{ status: "success"; data: null }> => {
    await repo.update(id, data as never);
    return { status: "success", data: null };
  },
);
