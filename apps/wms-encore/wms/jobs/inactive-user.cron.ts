import { CronJob } from "encore.dev/cron";
import { runInactiveUserNotifications } from "./inactive-user.controller";

// Mirrors inActiveUserScheduler.ts (CLI: `notif-inactive-users`). The
// original had no cron trigger of its own — it was a bare CLI subcommand
// invoked externally (e.g. a k8s CronJob/crontab calling `node cli.js
// notif-inactive-users`), so there is no original schedule to mirror
// byte-for-byte. Daily is a reasonable cadence given the underlying signal
// (waste-bag inactivity) only changes in day-sized increments (ageDays is a
// day-granularity milestone list); adjust if ops wants finer-grained runs.
const _ = new CronJob("notif-inactive-users", {
  title: "Notify admins/operators of facilities inactive for 7/14/21/28/35/42/49/56 days",
  schedule: "0 6 * * *",
  endpoint: runInactiveUserNotifications,
});
