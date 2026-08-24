import { z } from "zod";

// Mirrors createEnititySettings.schema.ts's body schema (semantic validation
// only — required/positive checks — applied manually inside .service.ts).
export const createEntitySettingsSchema = z.object({
  entityId: z.number().positive().optional(),
  settingName: z.string().min(1, { message: "setting name is required" }),
  settingValue: z.string().min(1, { message: "settings value is required" }),
});

// Mirrors updateEnititySettings.schema.ts's body schema.
export const updateEntitySettingsSchema = z.object({
  entityId: z.number().positive().optional(),
  settingName: z.string().min(1, { message: "setting name is required" }).optional(),
  settingValue: z.string().min(1, { message: "settings value is required" }).optional(),
});
