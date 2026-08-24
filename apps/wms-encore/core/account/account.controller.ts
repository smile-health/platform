// Real endpoints ported from apps/core's wire.ts mount "/account".
import { api } from "encore.dev/api";
import * as repo from "./account.repository";

interface AccountResponseDto {
  id: number;
  username: string | null;
  email: string | null;
  firstname: string | null;
  lastname: string | null;
  entity_id: number | null;
  role: number | null;
  status: number | null;
}

export const getAccount = api(
  { method: "GET", path: "/api/v1/core/account/:id", auth: false, expose: true },
  async ({ id }: { id: number }) => {
    const row = await repo.findById(id);
    return { status: "success", data: row };
  },
);

export const recordLoginAttempt = api(
  { method: "POST", path: "/api/v1/core/account/login-attempt", auth: false, expose: true },
  async ({ ip }: { ip: string }): Promise<{ status: "success"; data: null }> => {
    const existing = await repo.findIpLoginAttempt(ip);
    if (existing) {
      await repo.incrementLoginAttempt(ip);
    } else {
      await repo.createLoginAttempt({ ip, hit: 1 });
    }
    return { status: "success", data: null };
  },
);

export const getLoginAttempt = api(
  { method: "GET", path: "/api/v1/core/account/login-attempt/:ip", auth: false, expose: true },
  async ({ ip }: { ip: string }): Promise<{ status: "success"; data: { hit: number | null; lastAttempt: Date | null } }> => {
    const row = await repo.findIpLoginAttempt(ip);
    return {
      status: "success",
      data: { hit: row?.hit ?? null, lastAttempt: row?.last_attempt ?? null },
    };
  },
);
