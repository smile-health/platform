// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/stock-consumptions" (real), endpoint
// count (2) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
import { api } from "encore.dev/api";

export const stockConsumptionScaffold1 = api(
  { method: "GET", path: "/api/v1/main/stock-consumptions/_scaffold-stock-consumption-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const stockConsumptionScaffold2 = api(
  { method: "POST", path: "/api/v1/main/stock-consumptions/_scaffold-stock-consumption-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
