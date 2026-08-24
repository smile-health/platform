import { CronJob } from "encore.dev/cron";
import { runCleanseAssetDongleWasteScale } from "./cleanse-asset-dongle.controller";

// Mirrors CleanseAssetDongleWasteScale.ts (CLI:
// `cleanse-asset-dongle-waste-scale`). No original cron schedule existed
// (bare CLI subcommand) — this is a reconciliation/cleanup job against an
// external system, so a low-frequency nightly run is appropriate. NOTE: as
// of this port, every run is a no-op per facility (skipped with a warning)
// until the SMILE backend client is wired up — see
// cleanse-asset-dongle.service.ts's TODO.
const _ = new CronJob("cleanse-asset-dongle-waste-scale", {
  title: "Reconcile WMS Waste Scale assets against the SMILE backend's asset inventory",
  schedule: "0 2 * * *",
  endpoint: runCleanseAssetDongleWasteScale,
});
