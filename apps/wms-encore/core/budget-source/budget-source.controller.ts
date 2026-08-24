// Real endpoints ported from apps/core's wire.ts mount "/budget-sources"
// (routeConfigs name "budget-source"). CRUD only — the original's module-specific
// endpoints beyond list/get/create/update/delete aren't ported here.
import { api, APIError } from "encore.dev/api";
import * as repo from "./budget-source.repository";

interface BudgetSourceListParams {
  limit?: number;
  page?: number;
  search?: string;
}

// Concrete DTO (not Record<string,unknown>/Partial<T>) — Encore's schema
// parser needs a literal interface, not a generic/utility type.
interface BudgetSourceDto {
  name?: string;
  description?: string | null;
  is_custom?: number | null;
  is_restricted?: number | null;
}

interface BudgetSourceUpdateDto extends BudgetSourceDto {
  id: number;
}

// Plain response type — repo.BudgetSourceRow uses Kysely's Generated<T> wrapper
// internally, which Encore's schema parser can't resolve in an API
// response either; cast to this at the API boundary instead.
interface BudgetSourceResponseDto extends BudgetSourceDto {
  id: number;
}

export const listBudgetSource = api(
  { method: "GET", path: "/api/v1/core/budget-sources", auth: false, expose: true },
  async (params: BudgetSourceListParams): Promise<{ status: "success"; data: BudgetSourceResponseDto[] }> => {
    const data = await repo.list({ limit: params.limit ?? 20, page: params.page ?? 1, search: params.search });
    return { status: "success", data: data as unknown as BudgetSourceResponseDto[] };
  },
);

export const getBudgetSource = api(
  { method: "GET", path: "/api/v1/core/budget-sources/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: BudgetSourceResponseDto }> => {
    const row = await repo.findById(id);
    if (!row) throw APIError.notFound("BudgetSource not found");
    return { status: "success", data: row as unknown as BudgetSourceResponseDto };
  },
);

export const createBudgetSource = api(
  { method: "POST", path: "/api/v1/core/budget-sources", auth: false, expose: true },
  async (data: BudgetSourceDto): Promise<{ status: "success"; data: { id: number } }> => {
    // TODO: createdBy from auth context (hardcoded 0 for now).
    const id = await repo.create(data as never, 0);
    return { status: "success", data: { id } };
  },
);

export const updateBudgetSource = api(
  { method: "PUT", path: "/api/v1/core/budget-sources/:id", auth: false, expose: true },
  async ({ id, ...data }: BudgetSourceUpdateDto): Promise<{ status: "success"; data: null }> => {
    await repo.update(id, data as never, 0);
    return { status: "success", data: null };
  },
);

export const deleteBudgetSource = api(
  { method: "DELETE", path: "/api/v1/core/budget-sources/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: null }> => {
    await repo.softDelete(id, 0);
    return { status: "success", data: null };
  },
);
