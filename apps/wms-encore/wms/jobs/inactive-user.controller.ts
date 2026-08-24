import { api } from "encore.dev/api";
import * as service from "./inactive-user.service";

// Private, no HTTP path exposed intentionally — cron target only (see
// inactive-user.cron.ts), mirroring the CLI-only invocation of the original
// (`notif-inactive-users`). The notification/ module's
// trigger-inactive-user HTTP endpoint is a separate, still-unwired stub (see
// notification.types.ts) — not this one.
export const runInactiveUserNotifications = api(
  {},
  async (): Promise<void> => {
    await service.runInactiveUserNotifications();
  }
);
