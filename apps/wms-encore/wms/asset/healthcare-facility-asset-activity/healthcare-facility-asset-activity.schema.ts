import { z } from "zod";

// Mirrors createHealthcareFacilityAssetActivity.schema.ts's body schema
// field-for-field. createdBy is omitted here — it comes from the
// authenticated user in this port (same convention as every other module),
// not re-validated as a body field.
export const healthcareFacilityAssetActivityBodySchema = z.object({
  activityType: z.enum(["MAINTENANCE", "CALIBRATION"], {
    message: "activityType must be one of 'MAINTENANCE', 'CALIBRATION'.",
  }),
  hfAssetId: z
    .number({
      required_error: "hfAssetId is required",
      invalid_type_error: "hfAssetId must be a number",
    })
    .int()
    .positive(),
  operatorId: z
    .string()
    .min(1, { message: "operatorId is required" })
    .max(64, { message: "operatorId max input 36 character" }),
  createdAt: z.string().date().min(1, { message: "effectiveFrom is required" }),
  startDate: z.string().min(1, { message: "effectiveFrom is required" }),
  endDate: z.string().min(1).optional(),
});
