import { z } from "zod";

// Mirrors createManualScaleRequestSchemaBody (manualScaleRequest.schema.ts).
// requestedBy/processedBy are NOT included here — the original schema
// declares them optional and the controller overwrites them from req.user
// unconditionally anyway (see CreateManualScaleRequest's controller call
// site), so any client-supplied value was always discarded. entityId is
// likewise always taken from req.user?.entity.id, never from the body.
export const manualScaleRequestBodySchema = z.object({
  isActive: z.boolean().default(false),
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED"], {
      message: "status must be one of 'PENDING', 'APPROVED', or 'REJECTED'",
    })
    .default("PENDING"),
  approvalType: z.enum(["TIME_BOUND", "COUNT_BASED"], {
    message: "approvalType is required and must be one of 'TIME_BOUND' or 'COUNT_BASED'",
  }),
  validUntil: z.coerce
    .date({
      invalid_type_error: "Invalid end date format",
    })
    .optional(),
  countLimit: z.number().int().positive({ message: "countLimit must be a positive integer" }).optional(),
});

// Mirrors activateManualScaleRequest's inline query validation (no dedicated
// zod schema in the original — the controller hand-checks id/status itself).
export const activateManualScaleRequestSchema = z.object({
  id: z.number().int().positive({ message: "ID parameter is required" }),
  status: z.enum(["APPROVED", "REJECTED"], {
    message: 'Invalid or missing status parameter. Must be "APPROVED" or "REJECTED".',
  }),
});
