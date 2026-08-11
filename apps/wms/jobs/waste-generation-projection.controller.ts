import { api } from "encore.dev/api";
import * as service from "./waste-generation-projection.service";

// Private cron target only, mirroring the CLI-only
// `waste-generation-below-monthly-projection` invocation of the original
// (wasteGenerationBelowMonthlyProjectionScheduler.ts).
export const runWasteGenerationBelowProjection = api(
  {},
  async (): Promise<void> => {
    await service.runWasteGenerationBelowProjection();
  }
);
