import { CronJob } from "encore.dev/cron";
import { checkAndDispatchDueEvents } from "./schedule-event.controller";

// Mirrors minuteInterval.ts (initSchedulers.ts only ever enabled this one —
// 12HInterval.ts was dormant/commented out in the original, so it's not ported).
// Lives here (not jobs/) because this is the app's own internal scheduler,
// same as the original — jobs/ is reserved for externally-triggered ad-hoc runs
// (CLI/Jenkins), not this automatic in-process poll.
const _ = new CronJob("poll-due-scheduled-events", {
  title: "Poll due scheduled events and dispatch for processing",
  every: "1m",
  endpoint: checkAndDispatchDueEvents,
});
