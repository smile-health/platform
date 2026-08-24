import { z } from "zod";

// Mirrors createQrCodeConfig.schema.ts / updateQrCodeConfig.schema.ts (near
// identical in the original). The original also required `createdBy` /
// `updatedBy` and `healthcareFacilityId` in the body, but those come from the
// authenticated user in this port (same convention as every other module) —
// not re-validated as body fields here.
export const qrCodeConfigBodySchema = z.object({
  wasteSourceId: z
    .number({ message: "wasteSourceId is required" })
    .int()
    .positive({ message: "wasteSourceId must be a positive integer" }),
  wasteClassificationId: z
    .number({ message: "wasteClassificationId is required" })
    .int()
    .positive({ message: "wasteClassificationId must be a positive integer" }),
  labelCount: z
    .number({ message: "labelCount is required" })
    .int()
    .positive({ message: "labelCount must be a positive integer" }),
});
