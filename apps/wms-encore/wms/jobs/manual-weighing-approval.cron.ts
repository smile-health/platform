import { CronJob } from "encore.dev/cron";
import { runManualWeighingApprovalExpiry } from "./manual-weighing-approval.controller";

// Mirrors updateStatusManualWeighingApprovalScheduler.ts (CLI:
// `update-status-manual-weighing-approval`). No original cron schedule
// existed (bare CLI subcommand) — expiry is date-granular
// (`valid_until < CURRENT_DATE`), so re-checking a few times a day is
// sufficient; adjust if ops wants a different cadence.
const _ = new CronJob("manual-weighing-approval-status", {
  title: "Expire manual-scale weighing approval requests past their valid_until date",
  every: "4h",
  endpoint: runManualWeighingApprovalExpiry,
});
