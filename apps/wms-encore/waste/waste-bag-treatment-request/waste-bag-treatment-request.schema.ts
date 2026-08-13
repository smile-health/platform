import { z } from "zod";

// Mirrors createWasteBagTreatmentRequest.schema.ts / updateWasteBagTreatmentRequest.schema.ts
// (identical in the original apart from createdBy/updatedBy, which come from
// the authenticated user in this port — same convention as every other
// module — not re-validated as body fields).
//
// Note: requestStatus is REQUIRED in both original schemas (no .optional()),
// even though the domain entity's own field is optional — preserved as-is.
export const wasteBagTreatmentRequestBodySchema = z.object({
  requestStatus: z.enum(["PENDING", "ACCEPTED", "REJECTED"], {
    message: "requestStatus must be either PENDING OR ACCEPTED OR REJECTED",
  }),
  treatmentGroupId: z.number().int().positive({ message: "treatmentGroupId must be a positive integer" }),
  requestCreatorId: z.number().int().positive({ message: "requestCreatorId must be a positive integer" }).optional(),
  requestApproverId: z
    .number()
    .int()
    .positive({ message: "requestApproverId must be a positive integer" })
    .optional(),
});
