import { z } from "zod";

// Mirrors createQrCodeConfig.schema.ts / updateQrCodeConfig.schema.ts (near
// identical in the original). The original also required `createdBy` /
// `updatedBy` and `healthcareFacilityId` in the body, but those come from the
// authenticated user in this port (same convention as every other module) —
// not re-validated as body fields here.
export const qrCodeConfigBodySchema = z.object({
  wasteSourceId: z.int().positive({
    error: "wasteSourceId must be a positive integer",
  }),
  wasteClassificationId: z.int().positive({
    error: "wasteClassificationId must be a positive integer",
  }),
  labelCount: z.int().positive({
    error: "labelCount must be a positive integer",
  }),
});
