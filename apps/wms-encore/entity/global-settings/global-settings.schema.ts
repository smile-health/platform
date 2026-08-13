import { z } from "zod";

// Mirrors createGlobalSettings.schema.ts / updateGlobalSettings.schema.ts
// (identical in the original). The original also required `createdBy` in the
// body, but createdBy/updatedBy come from the authenticated user in this port
// (same convention as every other module) — not re-validated as a body field.
export const globalSettingsBodySchema = z.object({
  settingName: z.string().min(1, "setting name is required"),
  settingValue: z.string().min(1, "settings value is required"),
});
