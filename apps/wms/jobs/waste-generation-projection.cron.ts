import { CronJob } from "encore.dev/cron";
import { runWasteGenerationBelowProjection } from "./waste-generation-projection.controller";

// Mirrors wasteGenerationBelowMonthlyProjectionScheduler.ts (CLI:
// `waste-generation-below-monthly-projection`). No original cron schedule
// existed (bare CLI subcommand) — the underlying signal only makes sense to
// re-check once a day (it compares whole-day totals against a monthly
// baseline), so daily is chosen; adjust if ops wants a different cadence.
const _ = new CronJob("waste-generation-below-projection", {
  title: "Notify admins/operators when a facility's half-month waste generation trails its 3-month average",
  schedule: "0 8 * * *",
  endpoint: runWasteGenerationBelowProjection,
});
