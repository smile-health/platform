// Real endpoints ported from apps/core's wire.ts mount "/protocols"
// (routeConfigs name "protocol"). CRUD only — the original's module-specific
// endpoints beyond list/get/create/update/delete aren't ported here.
import { api, APIError } from "encore.dev/api";
import * as repo from "./protocol.repository";

interface ProtocolListParams {
  limit?: number;
  page?: number;
  search?: string;
}

// Concrete DTO (not Record<string,unknown>/Partial<T>) — Encore's schema
// parser needs a literal interface, not a generic/utility type.
interface ProtocolDto {
  name?: string;
  status?: number | null;
  is_identity_type?: number | null;
  is_medical_history?: number | null;
}

interface ProtocolUpdateDto extends ProtocolDto {
  id: number;
}

// Plain response type — repo.ProtocolRow uses Kysely's Generated<T> wrapper
// internally, which Encore's schema parser can't resolve in an API
// response either; cast to this at the API boundary instead.
interface ProtocolResponseDto extends ProtocolDto {
  id: number;
}

export const listProtocol = api(
  { method: "GET", path: "/api/v1/core/protocols", auth: false, expose: true },
  async (params: ProtocolListParams): Promise<{ status: "success"; data: ProtocolResponseDto[] }> => {
    const data = await repo.list({ limit: params.limit ?? 20, page: params.page ?? 1, search: params.search });
    return { status: "success", data: data as unknown as ProtocolResponseDto[] };
  },
);

export const getProtocol = api(
  { method: "GET", path: "/api/v1/core/protocols/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: ProtocolResponseDto }> => {
    const row = await repo.findById(id);
    if (!row) throw APIError.notFound("Protocol not found");
    return { status: "success", data: row as unknown as ProtocolResponseDto };
  },
);

export const createProtocol = api(
  { method: "POST", path: "/api/v1/core/protocols", auth: false, expose: true },
  async (data: ProtocolDto): Promise<{ status: "success"; data: { id: number } }> => {
    // TODO: createdBy from auth context (hardcoded 0 for now).
    const id = await repo.create(data as never, 0);
    return { status: "success", data: { id } };
  },
);

export const updateProtocol = api(
  { method: "PUT", path: "/api/v1/core/protocols/:id", auth: false, expose: true },
  async ({ id, ...data }: ProtocolUpdateDto): Promise<{ status: "success"; data: null }> => {
    await repo.update(id, data as never, 0);
    return { status: "success", data: null };
  },
);

export const deleteProtocol = api(
  { method: "DELETE", path: "/api/v1/core/protocols/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: null }> => {
    await repo.softDelete(id, 0);
    return { status: "success", data: null };
  },
);
