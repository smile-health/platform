import { api } from "encore.dev/api";
import * as service from "./max-temp-storage.service";

// Private cron target only, mirroring the CLI-only
// `maximum-temporary-storage-duration` invocation of the original
// (maximumTemporaryStorageDurationScheduler.ts).
export const runMaxTemporaryStorageDuration = api(
  {},
  async (): Promise<void> => {
    await service.runMaxTemporaryStorageDuration();
  }
);
