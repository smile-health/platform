// Real endpoints ported from apps/core's wire.ts mount "/programs" — see
// program.repository.ts's header for what's NOT ported (client/integration
// scoping, config JSON filters, superadmin role check).
import { api, APIError } from "encore.dev/api";
import * as repo from "./program.repository";

interface ProgramResponseDto {
  id: number;
  key: string;
  name: string;
  description: string | null;
  config: string | null;
  is_beneficiaries: number | null;
}

export const listProgram = api(
  { method: "GET", path: "/api/v1/core/programs", auth: false, expose: true },
  async (params: {
    keyword?: string;
    isBeneficiaries?: boolean;
    limit?: number;
    page?: number;
  }): Promise<{ status: "success"; data: ProgramResponseDto[] }> => {
    const data = await repo.findAll({
      keyword: params.keyword,
      isBeneficiaries: params.isBeneficiaries,
      limit: params.limit ?? 20,
      page: params.page ?? 1,
    });
    return { status: "success", data: data as unknown as ProgramResponseDto[] };
  },
);

export const getProgram = api(
  { method: "GET", path: "/api/v1/core/programs/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: ProgramResponseDto }> => {
    const row = await repo.findById(id);
    if (!row) throw APIError.notFound("Program not found");
    return { status: "success", data: row as unknown as ProgramResponseDto };
  },
);

export const listUserPrograms = api(
  { method: "GET", path: "/api/v1/core/programs/by-user/:userId", auth: false, expose: true },
  async ({ userId }: { userId: number }): Promise<{ status: "success"; data: ProgramResponseDto[] }> => {
    const data = await repo.findUserPrograms(userId);
    return { status: "success", data: data as unknown as ProgramResponseDto[] };
  },
);
