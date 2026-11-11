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
      error: "requestStatus must be either PENDING OR ACCEPTED OR REJECTED"
}),
  treatmentGroupId: z.int().positive({
      error: "treatmentGroupId must be a positive integer"
}),
  requestCreatorId: z.int().positive({
      error: "requestCreatorId must be a positive integer"
}).optional(),
  requestApproverId: z.int()
    .positive({
        error: "requestApproverId must be a positive integer"
    })
    .optional(),
});
