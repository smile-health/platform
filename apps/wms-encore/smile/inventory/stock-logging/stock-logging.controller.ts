// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/stock-logging" (real), endpoint
// count (2) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
import { api } from "encore.dev/api";

export const stockLoggingScaffold1 = api(
  { method: "GET", path: "/api/v1/main/stock-logging/_scaffold-stock-logging-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const stockLoggingScaffold2 = api(
  { method: "POST", path: "/api/v1/main/stock-logging/_scaffold-stock-logging-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
