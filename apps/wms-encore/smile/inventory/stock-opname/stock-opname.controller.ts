// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/stock-opnames" (real), endpoint
// count (6) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
import { api } from "encore.dev/api";

export const stockOpnameScaffold1 = api(
  { method: "GET", path: "/api/v1/main/stock-opnames/_scaffold-stock-opname-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const stockOpnameScaffold2 = api(
  { method: "POST", path: "/api/v1/main/stock-opnames/_scaffold-stock-opname-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const stockOpnameScaffold3 = api(
  { method: "PUT", path: "/api/v1/main/stock-opnames/_scaffold-stock-opname-3", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const stockOpnameScaffold4 = api(
  { method: "PATCH", path: "/api/v1/main/stock-opnames/_scaffold-stock-opname-4", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const stockOpnameScaffold5 = api(
  { method: "DELETE", path: "/api/v1/main/stock-opnames/_scaffold-stock-opname-5", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const stockOpnameScaffold6 = api(
  { method: "GET", path: "/api/v1/main/stock-opnames/_scaffold-stock-opname-6", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
