import { z } from "zod";

// Mirrors createHealthcareFacilityAssetActivity.schema.ts's body schema
// field-for-field. createdBy is omitted here — it comes from the
// authenticated user in this port (same convention as every other module),
// not re-validated as a body field.
export const healthcareFacilityAssetActivityBodySchema = z.object({
  activityType: z.enum(["MAINTENANCE", "CALIBRATION"], {
    error: "activityType must be one of 'MAINTENANCE', 'CALIBRATION'.",
  }),
  hfAssetId: z.int().positive(),
  operatorId: z
    .string()
    .min(1, {
      error: "operatorId is required",
    })
    .max(64, {
      error: "operatorId max input 36 character",
    }),
  createdAt: z.iso.date().min(1, {
    error: "effectiveFrom is required",
  }),
  startDate: z.string().min(1, {
    error: "effectiveFrom is required",
  }),
  endDate: z.string().min(1).optional(),
});
