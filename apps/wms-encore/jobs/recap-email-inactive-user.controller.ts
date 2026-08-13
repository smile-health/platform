import { api } from "encore.dev/api";
import * as service from "./recap-email-inactive-user.service";

// Private cron target only, mirroring the CLI-only `email-inactive-users`
// invocation of the original (recapEmailInActiveUserScheduler.ts).
export const runRecapEmailInactiveUsers = api(
  {},
  async (): Promise<void> => {
    await service.runRecapEmailInactiveUsers();
  }
);
