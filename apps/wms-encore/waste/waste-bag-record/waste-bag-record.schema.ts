import { z } from "zod";

// Mirrors interfaces/http/request-schemas/createWaste.schema.ts's body schema
// (`createWasteSchemaBody`) field-for-field.
export const createWasteBagRecordBodySchema = z.object({
  wasteSourceId: z.int()
    .positive({
        error: "wasteSourceId must be a positive integer"
    }),
  wasteClassificationId: z.int()
    .positive({
        error: "wasteClassificationId must be a positive integer"
    }),
  scaleMethod: z.enum(["MANUAL", "IOT"], {
      error: "scaleMethod must be either MANUAL or IOT"
}),
  weightInKgs: z
    .number({
        error: (issue) => issue.input === undefined ? undefined : "weightInKgs must be a number"
    })
    .positive({
        error: "wasteInKgs must be a positive number"
    }),
  sourceTreatmentGroupId: z
    .string()
    .min(1, {
        error: "sourceTreatmentGroupId is required"
    })
    .optional(),
  wasteBagQrCodeId: z.string().min(1, {
      error: "wasteBagQrCodeId is required"
}),
  binNumber: z.string().optional(),
  iotMethod: z.enum(["BLUETOOTH", "INTERNET"]).optional(),
  wasteGroupIds: z.string().optional(),
  isTreated: z.boolean().optional(),
  bastNo: z.string().optional(),
  materialIds: z.string().max(64, {
      error: "materialIds max input 64 character"
}).optional(),
});
