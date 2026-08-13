import { api } from "encore.dev/api";
import * as service from "./cleanse-asset-dongle.service";

// Private cron target only, mirroring the CLI-only
// `cleanse-asset-dongle-waste-scale` invocation of the original
// (CleanseAssetDongleWasteScale.ts). Currently a no-op per entity until the
// SMILE backend client is wired up — see cleanse-asset-dongle.service.ts's
// TODO.
export const runCleanseAssetDongleWasteScale = api(
  {},
  async (): Promise<void> => {
    await service.runCleanseAssetDongleWasteScale();
  }
);
