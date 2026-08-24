import { z } from "zod";

// Mirrors createWasteBagQrCode.schema.ts's createWasteBagQrCodeSchemaBody.
export const createWasteBagQrCodeItemSchema = z.object({
  healthcareFacilityId: z
    .number()
    .int()
    .positive({ message: "healthcareFacilityId must be a positive integer" })
    .optional(),
  wasteSourceId: z
    .number()
    .int()
    .positive({ message: "wasteSourceId must be a positive integer" })
    .optional(),
  wasteClassificationId: z
    .number()
    .int()
    .positive({ message: "wasteClassificationId must be a positive integer" })
    .optional(),
  labelCount: z
    .number({ message: "labelCount is required" })
    .int()
    .positive({ message: "labelCount must be a positive integer" }),
});

export const createWasteBagQrCodeSchema = z.object({
  items: z.array(createWasteBagQrCodeItemSchema).min(1),
});

// Mirrors updateWasteBagQrCode.schema.ts's updateWasteBagQrCodeSchemaBody
// (minus updatedBy, which the original required but the use-case never
// reads — see waste-bag-qr-code.types.ts's UpdateWasteBagQrCodeRequest note).
export const updateWasteBagQrCodeSchema = z.object({
  wasteSourceId: z
    .number()
    .int()
    .positive({ message: "wasteSourceId must be a positive integer" })
    .optional(),
  wasteClassificationId: z
    .number()
    .int()
    .positive({ message: "wasteClassificationId must be a positive integer" })
    .optional(),
  qrCode: z
    .string()
    .min(1, { message: "qrCode is required" })
    .max(255, { message: "qrCode max input 255 character" }),
});
