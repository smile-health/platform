// Thin controller — decodes/shape-validates the request, calls
// material.service.ts for anything that's actually business logic, maps
// domain errors to HTTP. Previously this file did the service layer's job
// too (orchestrating repo calls directly); moved out after review — see
// material.service.ts's header for why that matters.
import { api, APIError } from "encore.dev/api";
import * as service from "./material.service";
import * as excel from "./material.excel";
import { ValidationError } from "../../../shared/validation/validator";
import { MaterialNotFoundError } from "./material.service";
import { MaterialRequestSchema, UpdateStatusRequestSchema } from "./material.schema";

interface MaterialRequestDto {
  name: string;
  description?: string | null;
  code: string;
  hierarchy_code?: string | null;
  material_level_id: number;
  material_type_id: number;
  material_subtype_id?: number | null;
  unit_of_consumption_id: number;
  unit_of_distribution_id: number;
  consumption_unit_per_distribution_unit: number;
  min_retail_price: number;
  max_retail_price: number;
  is_temperature_sensitive: number;
  min_temperature?: number | null;
  max_temperature?: number | null;
  is_managed_in_batch: number;
  is_stock_opname_mandatory?: number;
  is_hierarchy: number;
  material_parent_ids?: number[] | null;
  program_ids?: number[] | null;
}

interface MaterialResponseDto {
  id: number;
  name: string;
  code: string;
  description: string | null;
  hierarchy_code: string | null;
  material_level_id: number;
  material_type_id: number;
  material_subtype_id: number | null;
  unit_of_consumption_id: number;
  unit_of_distribution_id: number;
  consumption_unit_per_distribution_unit: number;
  is_managed_in_batch: number;
  is_temperature_sensitive: number;
  min_temperature: number | null;
  max_temperature: number | null;
  is_stock_opname_mandatory: number;
  min_retail_price: number;
  max_retail_price: number;
  status: number;
  program_ids?: number[];
  parent_ids?: number[];
}

// Maps this module's domain errors (thrown by material.service.ts /
// material.validation.ts) to Encore's APIError — the one place HTTP status
// codes get decided, kept out of the service layer so it stays framework-agnostic.
function toApiError(err: unknown): never {
  if (err instanceof MaterialNotFoundError) throw APIError.notFound(err.message);
  if (err instanceof ValidationError) {
    throw APIError.invalidArgument(err.issues.map((i) => `${i.path}: ${i.message}`).join("; "));
  }
  throw err;
}

function parseRequestOrThrow(body: unknown) {
  const parsed = MaterialRequestSchema.safeParse(body);
  if (!parsed.success) {
    throw APIError.invalidArgument(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
  return parsed.data;
}

// --- List / detail -----------------------------------------------------------

export const listMaterial = api(
  { method: "GET", path: "/api/v1/core/materials", auth: false, expose: true },
  async (params: {
    limit?: number;
    page?: number;
    search?: string;
    materialLevelIds?: number[];
    materialTypeIds?: number[];
    status?: number;
  }): Promise<{ status: "success"; data: MaterialResponseDto[]; total: number }> => {
    const { data, total } = await service.list({
      limit: params.limit ?? 20,
      page: params.page ?? 1,
      search: params.search,
      materialLevelIds: params.materialLevelIds,
      materialTypeIds: params.materialTypeIds,
      status: params.status,
    });
    return { status: "success", data: data as unknown as MaterialResponseDto[], total };
  },
);

export const getMaterial = api(
  { method: "GET", path: "/api/v1/core/materials/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: MaterialResponseDto }> => {
    try {
      const detail = await service.getDetail(id);
      return { status: "success", data: detail as unknown as MaterialResponseDto };
    } catch (err) {
      toApiError(err);
    }
  },
);

export const getMaterialRelations = api(
  { method: "GET", path: "/api/v1/core/materials/:id/relation", auth: false, expose: true },
  async ({
    id,
  }: {
    id: number;
  }): Promise<{ status: "success"; data: { id: number; name: string; childIds: number[]; parentIds: number[] } }> => {
    try {
      const data = await service.getRelations(id);
      return { status: "success", data };
    } catch (err) {
      toApiError(err);
    }
  },
);

// --- Create / update ---------------------------------------------------------

export const createMaterial = api(
  { method: "POST", path: "/api/v1/core/materials", auth: false, expose: true },
  async (body: MaterialRequestDto): Promise<{ status: "success"; data: MaterialResponseDto }> => {
    const request = parseRequestOrThrow(body);
    try {
      // TODO: createdBy from auth context (hardcoded 0 for now).
      const created = await service.create(request, 0);
      return { status: "success", data: created as unknown as MaterialResponseDto };
    } catch (err) {
      toApiError(err);
    }
  },
);

export const updateMaterial = api(
  { method: "PUT", path: "/api/v1/core/materials/:id", auth: false, expose: true },
  async ({ id, ...body }: { id: number } & MaterialRequestDto): Promise<{ status: "success"; data: MaterialResponseDto }> => {
    const request = parseRequestOrThrow(body);
    try {
      // TODO: updatedBy from auth context (hardcoded 0 for now).
      const updated = await service.update(id, request, 0);
      return { status: "success", data: updated as unknown as MaterialResponseDto };
    } catch (err) {
      toApiError(err);
    }
  },
);

export const updateMaterialStatus = api(
  { method: "PUT", path: "/api/v1/core/materials/:id/status", auth: false, expose: true },
  async ({ id, status }: { id: number; status: number }): Promise<{ status: "success"; data: MaterialResponseDto }> => {
    const parsed = UpdateStatusRequestSchema.safeParse({ status });
    if (!parsed.success) throw APIError.invalidArgument("status must be 0 or 1");
    try {
      const updated = await service.updateStatus(id, parsed.data.status);
      return { status: "success", data: updated as unknown as MaterialResponseDto };
    } catch (err) {
      toApiError(err);
    }
  },
);

export const deleteMaterial = api(
  { method: "DELETE", path: "/api/v1/core/materials/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: null }> => {
    // TODO: deletedBy from auth context (hardcoded 0 for now).
    await service.remove(id, 0);
    return { status: "success", data: null };
  },
);

// --- Excel export / template / import ---------------------------------------
// Simplifications vs. the original (flagged, not silent): export/template
// return base64-encoded xlsx in JSON rather than a streamed file response
// (no raw-endpoint binary handling wired up yet); import takes base64 JSON
// instead of real multipart upload; i18n label translation and
// integration_client_id scoping aren't ported.

export const exportMaterials = api(
  { method: "GET", path: "/api/v1/core/materials/xls", auth: false, expose: true },
  async (params: {
    materialLevelIds?: number[];
    materialTypeIds?: number[];
  }): Promise<{ status: "success"; data: { filename: string; base64: string } }> => {
    const { data } = await service.list({
      limit: Number.MAX_SAFE_INTEGER,
      page: 1,
      materialLevelIds: params.materialLevelIds,
      materialTypeIds: params.materialTypeIds,
    });
    const buffer = await excel.exportMaterials(data);
    return { status: "success", data: { filename: `materials-${Date.now()}.xlsx`, base64: buffer.toString("base64") } };
  },
);

export const getMaterialTemplate = api(
  { method: "GET", path: "/api/v1/core/materials/xls-template", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: { filename: string; base64: string } }> => {
    const buffer = await excel.generateTemplate();
    return { status: "success", data: { filename: "material-import-template.xlsx", base64: buffer.toString("base64") } };
  },
);

export const importMaterials = api(
  { method: "POST", path: "/api/v1/core/materials/xls", auth: false, expose: true },
  async ({ fileBase64 }: { fileBase64: string }): Promise<{ status: "success"; data: service.ImportResult }> => {
    const buffer = Buffer.from(fileBase64, "base64");
    const rows = await excel.parseImportFile(buffer);
    // TODO: createdBy from auth context (hardcoded 0 for now).
    const result = await service.importRows(rows, 0);
    return { status: "success", data: result };
  },
);
