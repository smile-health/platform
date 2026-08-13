import { api } from "encore.dev/api";
import * as service from "./manual-weighing-approval.service";

// Private cron target only, mirroring the CLI-only
// `update-status-manual-weighing-approval` invocation of the original
// (updateStatusManualWeighingApprovalScheduler.ts).
export const runManualWeighingApprovalExpiry = api(
  {},
  async (): Promise<void> => {
    await service.runManualWeighingApprovalExpiry();
  }
);
