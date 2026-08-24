// Thin controller — same shape as core/material/material.controller.ts.
import { api, APIError } from "encore.dev/api";
import * as service from "./entity.service";
import * as excel from "./entity.excel";
import { ValidationError } from "../../shared/validation/validator";
import { EntityNotFoundError } from "./entity.service";
import { EntityRequestSchema } from "./entity.schema";

interface EntityRequestDto {
  code: string;
  name: string;
  type: number;
  status?: number;
  address: string;
  country?: string | null;
  location_id?: number | null;
  postal_code?: string | null;
  lat?: string | null;
  lng?: string | null;
  entity_tag_id: number;
  is_vendor?: number;
  integration_type?: number | null;
  external_properties?: Record<string, unknown> | null;
  program_ids?: number[] | null;
}

interface EntityResponseDto {
  id: number;
  code: string;
  name: string;
  type: number;
  status: number;
  address: string;
  country: string | null;
  location_id: number | null;
  postal_code: string | null;
  lat: string | null;
  lng: string | null;
  entity_tag_id: number;
  is_vendor: number;
  program_ids?: number[];
}

function toApiError(err: unknown): never {
  if (err instanceof EntityNotFoundError) throw APIError.notFound(err.message);
  if (err instanceof ValidationError) {
    throw APIError.invalidArgument(err.issues.map((i) => `${i.path}: ${i.message}`).join("; "));
  }
  throw err;
}

function parseRequestOrThrow(body: unknown) {
  const parsed = EntityRequestSchema.safeParse(body);
  if (!parsed.success) {
    throw APIError.invalidArgument(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
  return parsed.data;
}

export const listEntity = api(
  { method: "GET", path: "/api/v1/core/entities", auth: false, expose: true },
  async (params: { limit?: number; page?: number; search?: string; type?: number }): Promise<{ status: "success"; data: EntityResponseDto[]; total: number }> => {
    const { data, total } = await service.list({ limit: params.limit ?? 20, page: params.page ?? 1, search: params.search, type: params.type });
    return { status: "success", data: data as unknown as EntityResponseDto[], total };
  },
);

export const getEntity = api(
  { method: "GET", path: "/api/v1/core/entities/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: EntityResponseDto }> => {
    try {
      const detail = await service.getDetail(id);
      return { status: "success", data: detail as unknown as EntityResponseDto };
    } catch (err) {
      toApiError(err);
    }
  },
);

export const createEntity = api(
  { method: "POST", path: "/api/v1/core/entities", auth: false, expose: true },
  async (body: EntityRequestDto): Promise<{ status: "success"; data: EntityResponseDto }> => {
    const request = parseRequestOrThrow(body);
    try {
      // TODO: createdBy from auth context (hardcoded 0 for now).
      const created = await service.create(request, 0);
      return { status: "success", data: created as unknown as EntityResponseDto };
    } catch (err) {
      toApiError(err);
    }
  },
);

export const updateEntity = api(
  { method: "PUT", path: "/api/v1/core/entities/:id", auth: false, expose: true },
  async ({ id, ...body }: { id: number } & EntityRequestDto): Promise<{ status: "success"; data: EntityResponseDto }> => {
    const request = parseRequestOrThrow(body);
    try {
      // TODO: updatedBy from auth context (hardcoded 0 for now).
      const updated = await service.update(id, request, 0);
      return { status: "success", data: updated as unknown as EntityResponseDto };
    } catch (err) {
      toApiError(err);
    }
  },
);

export const deleteEntity = api(
  { method: "DELETE", path: "/api/v1/core/entities/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: null }> => {
    // TODO: deletedBy from auth context (hardcoded 0 for now).
    await service.remove(id, 0);
    return { status: "success", data: null };
  },
);

// --- Excel export / template / import ---------------------------------------
// Same simplifications as material's: base64 JSON instead of streamed
// binary, no i18n, no integration_client_id scoping.

export const exportEntities = api(
  { method: "GET", path: "/api/v1/core/entities/xls", auth: false, expose: true },
  async (params: { type?: number }): Promise<{ status: "success"; data: { filename: string; base64: string } }> => {
    const { data } = await service.list({ limit: Number.MAX_SAFE_INTEGER, page: 1, type: params.type });
    const buffer = await excel.exportEntities(data);
    return { status: "success", data: { filename: `entities-${Date.now()}.xlsx`, base64: buffer.toString("base64") } };
  },
);

export const getEntityTemplate = api(
  { method: "GET", path: "/api/v1/core/entities/xls-template", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: { filename: string; base64: string } }> => {
    const buffer = await excel.generateTemplate();
    return { status: "success", data: { filename: "entity-import-template.xlsx", base64: buffer.toString("base64") } };
  },
);

export const importEntities = api(
  { method: "POST", path: "/api/v1/core/entities/xls", auth: false, expose: true },
  async ({ fileBase64 }: { fileBase64: string }): Promise<{ status: "success"; data: service.ImportResult }> => {
    const buffer = Buffer.from(fileBase64, "base64");
    const rows = await excel.parseImportFile(buffer);
    // TODO: createdBy from auth context (hardcoded 0 for now).
    const result = await service.importRows(rows, 0);
    return { status: "success", data: result };
  },
);
