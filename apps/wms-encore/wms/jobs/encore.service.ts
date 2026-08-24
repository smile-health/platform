import { Service } from "encore.dev/service";
import { errorEnvelope } from "../../shared/http/envelope";

// Home for the original's 6 real CLI-invoked jobs, now ported as Encore
// CronJobs: notif-inactive-users (inactive-user.*), recap-email-inactive-user
// (recap-email-inactive-user.*), max-temporary-storage-duration
// (max-temp-storage.*), waste-generation-below-projection
// (waste-generation-projection.*), manual-weighing-approval-status
// (manual-weighing-approval.*), and cleanse-asset-dongle-waste-scale
// (cleanse-asset-dongle.*, currently a no-op pending a SMILE backend client —
// see that job's service.ts TODO). Each job's schedule/wiring lives in its
// own *.cron.ts. The app's own automatic scheduling (e.g. the
// scheduled-events poller) lives with the domain that owns the data instead
// — see scheduling/schedule-event.cron.ts — since proxying that single
// no-argument call through here added indirection without a real reason to
// exist.
export default new Service("jobs", {
  middlewares: [errorEnvelope],
});
