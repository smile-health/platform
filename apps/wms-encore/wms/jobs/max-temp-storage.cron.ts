import { CronJob } from "encore.dev/cron";
import { runMaxTemporaryStorageDuration } from "./max-temp-storage.controller";

// Mirrors maximumTemporaryStorageDurationScheduler.ts (CLI:
// `maximum-temporary-storage-duration`). No original cron schedule existed
// (bare CLI subcommand) — hourly balances catching overstays reasonably
// promptly against query cost; adjust if ops wants a different cadence.
const _ = new CronJob("max-temporary-storage-duration", {
  title: "Notify admins/operators of waste bags over their classification's max temp-storage duration",
  every: "1h",
  endpoint: runMaxTemporaryStorageDuration,
});
