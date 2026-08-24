import { CronJob } from "encore.dev/cron";
import { runRecapEmailInactiveUsers } from "./recap-email-inactive-user.controller";

// Mirrors recapEmailInActiveUserScheduler.ts (CLI: `email-inactive-users`).
// No original cron schedule existed (bare CLI subcommand) — a daily recap
// email is the natural cadence for this kind of digest; adjust if ops wants
// a different time/frequency.
const _ = new CronJob("recap-email-inactive-user", {
  title: "Email admins/operators a recap of inactive facilities in their scope",
  schedule: "0 7 * * *",
  endpoint: runRecapEmailInactiveUsers,
});
