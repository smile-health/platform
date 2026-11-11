import { z } from "zod";

// Mirrors createWasteTransportationRequest.schema.ts /
// updateWasteTransportationRequest.schema.ts's body schemas (identical
// shape in the original, aside from createdBy/updatedBy which come from the
// authenticated user in this port — same convention as every other module,
// not re-validated as a body field here).
//
// Note: despite the original's zod `.positive()` error message saying
// "transportationGroupId is required" and `requestCreatorId`/
// `requestApproverId`'s messages saying "X is required", those two are
// `.optional()` in the original — only the message text is misleading, the
// field itself is genuinely optional. transportationGroupId has no
// `.optional()` and so IS required, preserved verbatim (including in the
// update schema, where the original also requires it despite the use-case's
// fallback-to-existing-value logic for the other fields).
export const wasteTransportationRequestBodySchema = z.object({
  requestStatus: z
    .enum(["PENDING", "ACCEPTED", "REJECTED"], {
      error: "requestStatus must be one of PENDING, ACCEPTED, or REJECTED",
    })
    .optional(),
  transportationGroupId: z.int().positive({
    error: "transportationGroupId must be a positive integer",
  }),
  requestCreatorId: z
    .int()
    .positive({
      error: "requestCreatorId must be a positive integer",
    })
    .optional(),
  requestApproverId: z
    .int()
    .positive({
      error: "requestApproverId must be a positive integer",
    })
    .optional(),
});
