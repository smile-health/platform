// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/stock-opname-periods" (real), endpoint
// count (7) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
import { api } from "encore.dev/api";

export const stockOpnamePeriodScaffold1 = api(
  { method: "GET", path: "/api/v1/main/stock-opname-periods/_scaffold-stock-opname-period-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const stockOpnamePeriodScaffold2 = api(
  { method: "POST", path: "/api/v1/main/stock-opname-periods/_scaffold-stock-opname-period-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const stockOpnamePeriodScaffold3 = api(
  { method: "PUT", path: "/api/v1/main/stock-opname-periods/_scaffold-stock-opname-period-3", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const stockOpnamePeriodScaffold4 = api(
  { method: "PATCH", path: "/api/v1/main/stock-opname-periods/_scaffold-stock-opname-period-4", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const stockOpnamePeriodScaffold5 = api(
  { method: "DELETE", path: "/api/v1/main/stock-opname-periods/_scaffold-stock-opname-period-5", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const stockOpnamePeriodScaffold6 = api(
  { method: "GET", path: "/api/v1/main/stock-opname-periods/_scaffold-stock-opname-period-6", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const stockOpnamePeriodScaffold7 = api(
  { method: "POST", path: "/api/v1/main/stock-opname-periods/_scaffold-stock-opname-period-7", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
