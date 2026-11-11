import { z } from "zod";

// Mirrors createWasteBagQrCode.schema.ts's createWasteBagQrCodeSchemaBody.
export const createWasteBagQrCodeItemSchema = z.object({
  healthcareFacilityId: z
    .int()
    .positive({
      error: "healthcareFacilityId must be a positive integer",
    })
    .optional(),
  wasteSourceId: z
    .int()
    .positive({
      error: "wasteSourceId must be a positive integer",
    })
    .optional(),
  wasteClassificationId: z
    .int()
    .positive({
      error: "wasteClassificationId must be a positive integer",
    })
    .optional(),
  labelCount: z.int().positive({
    error: "labelCount must be a positive integer",
  }),
});

export const createWasteBagQrCodeSchema = z.object({
  items: z.array(createWasteBagQrCodeItemSchema).min(1),
});

// Mirrors updateWasteBagQrCode.schema.ts's updateWasteBagQrCodeSchemaBody
// (minus updatedBy, which the original required but the use-case never
// reads — see waste-bag-qr-code.types.ts's UpdateWasteBagQrCodeRequest note).
export const updateWasteBagQrCodeSchema = z.object({
  wasteSourceId: z
    .int()
    .positive({
      error: "wasteSourceId must be a positive integer",
    })
    .optional(),
  wasteClassificationId: z
    .int()
    .positive({
      error: "wasteClassificationId must be a positive integer",
    })
    .optional(),
  qrCode: z
    .string()
    .min(1, {
      error: "qrCode is required",
    })
    .max(255, {
      error: "qrCode max input 255 character",
    }),
});
