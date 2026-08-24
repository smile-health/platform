// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/transfer-stock" (real), endpoint
// count (3) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
import { api } from "encore.dev/api";

export const transferStockScaffold1 = api(
  { method: "GET", path: "/api/v1/main/transfer-stock/_scaffold-transfer-stock-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const transferStockScaffold2 = api(
  { method: "POST", path: "/api/v1/main/transfer-stock/_scaffold-transfer-stock-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const transferStockScaffold3 = api(
  { method: "PUT", path: "/api/v1/main/transfer-stock/_scaffold-transfer-stock-3", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
