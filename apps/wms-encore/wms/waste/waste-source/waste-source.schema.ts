import { z } from "zod";

// Mirrors createWasteSource.schema.ts. The original also required
// `createdBy` in the body; createdBy/updatedBy come from the authenticated
// user in this port (same convention as every other module) — not
// re-validated as a body field here.
export const createWasteSourceBodySchema = z.object({
  healthcareFacilityId: z
    .number({ message: "healthcareFacilityId is required" })
    .int()
    .positive({ message: "healthcareFacilityId must be a positive integer" })
    .optional(),
  sourceType: z.enum(["INTERNAL", "EXTERNAL", "INTERNAL_TREATMENT"], {
    message: "sourceType must be one of 'INTERNAL' , 'EXTERNAL' , 'INTERNAL_TREATMENT'",
  }),
  internalSourceName: z.string({ message: "internalSourceName is required" }).optional(),
  internalTreatmentName: z
    .enum(["PYROLYSIS", "DISINFECTION"], {
      message: "internalTreatmentName must be one of 'PYROLYSIS' , 'DISINFECTION'",
    })
    .optional(),
  externalHealthcareFacilityId: z
    .number({ message: "externalHealthcareFacilityId is required" })
    .int()
    .positive({ message: "externalHealthcareFacilityId must be a positive integer" })
    .optional(),
  externalHealthcareFacilityName: z
    .string({ message: "externalHealthcareFacilityName is required" })
    .optional(),
  isActive: z.boolean().optional().default(false),
  isResidue: z.boolean().optional().default(false),
});

// Mirrors updateWasteSource.schema.ts — note sourceType is required (not
// `.optional()`) there too, same as create; preserved verbatim even though
// updateWasteSource.service.ts's use-case only actually applies it when the
// existing row's sourceType is already 'EXTERNAL' or 'INTERNAL' (see the
// comment on that branch in waste-source.service.ts).
export const updateWasteSourceBodySchema = z.object({
  healthcareFacilityId: z
    .number({ message: "healthcareFacilityId is required" })
    .int()
    .positive({ message: "healthcareFacilityId must be a positive integer" })
    .optional(),
  sourceType: z.enum(["INTERNAL", "EXTERNAL", "INTERNAL_TREATMENT"], {
    message: "sourceType must be one of 'INTERNAL' , 'EXTERNAL' , 'INTERNAL_TREATMENT'",
  }),
  internalSourceName: z.string({ message: "internalSourceName is required" }).optional(),
  internalTreatmentName: z
    .enum(["PYROLYSIS", "DISINFECTION"], {
      message: "internalTreatmentName must be one of 'PYROLYSIS' , 'DISINFECTION'",
    })
    .optional(),
  externalHealthcareFacilityId: z
    .number({ message: "externalHealthcareFacilityId is required" })
    .int()
    .positive({ message: "externalHealthcareFacilityId must be a positive integer" })
    .optional(),
  externalHealthcareFacilityName: z
    .string({ message: "externalHealthcareFacilityName is required" })
    .optional(),
  isActive: z.boolean().optional().default(false),
});
