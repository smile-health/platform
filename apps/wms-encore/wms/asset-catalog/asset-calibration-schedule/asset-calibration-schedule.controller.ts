// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/core/asset-calibration-schedules" (real), endpoint
// count (1) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
import { api } from "encore.dev/api";

export const assetCalibrationScheduleScaffold1 = api(
  { method: "GET", path: "/api/v1/core/asset-calibration-schedules/_scaffold-asset-calibration-schedule-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
