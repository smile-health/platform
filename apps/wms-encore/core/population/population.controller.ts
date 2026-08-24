// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/population" (real), endpoint
// count (2) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
// kept as-is, now references the generic location model
import { api } from "encore.dev/api";

export const populationScaffold1 = api(
  { method: "GET", path: "/api/v1/main/population/_scaffold-population-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const populationScaffold2 = api(
  { method: "POST", path: "/api/v1/main/population/_scaffold-population-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
