// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/core/asset-types-temperature" (real), endpoint
// count (1) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
import { api } from "encore.dev/api";

export const assetTypesTemperatureScaffold1 = api(
  { method: "GET", path: "/api/v1/core/asset-types-temperature/_scaffold-asset-types-temperature-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
