import { z } from "zod";

// Mirrors createHealthcareFacilityAsset.schema.ts / updateHealthcareFacilityAsset.schema.ts
// (identical bodies in the original, aside from create requiring `createdBy`
// and update requiring `updatedBy` — both of which come from the
// authenticated user in this port, same convention as every other module, so
// they're not re-validated as body fields here).
//
// Deviation: the original's `isIotEnable` accepts `z.union([z.boolean(),
// z.number().int().min(0).max(1)])`. Encore api() request types must not be
// unions for wire-decoded fields (see healthcare-facility-asset.types.ts), so
// the wire type is `boolean` and this schema validates it as such — a caller
// sending 0/1 over the wire would already have been rejected by Encore's own
// request decoding before reaching this schema, same net effect for JSON
// clients.
const ASSET_STATUS_VALUES = [
  "OPERATIONAL",
  "UNDER_MAINTAINENCE",
  "OUT_OF_SERVICE",
  "IDLE",
  "RETIRED",
] as const;

export const createHealthcareFacilityAssetBodySchema = z.object({
  assetStatus: z.enum(ASSET_STATUS_VALUES, {
    message: "asset_status must be one of 'OPERATIONAL', 'UNDER_MAINTAINENCE', 'OUT_OF_SERVICE', 'IDLE', 'RETIRED'.",
  }),
  assetId: z
    .string({ message: "asset_id must be a positive integer" })
    .min(3, { message: "asset_id must be at least 3 characters long" }),
  modelId: z.number().int().positive({ message: "model_id must be a positive integer" }),
  healthcareFacilityId: z
    .number({ message: "Heathcare facility id is required" })
    .int()
    .positive({ message: "healthcare_facility_id must be a positive integer" })
    .optional(),
  isIotEnable: z.boolean(),
  warrantyStartDate: z.string().date().min(1).optional(),
  warrantyEndDate: z.string().date().min(1).optional(),
  yearOfProduction: z
    .number()
    .int()
    .min(1000, { message: "yearOfProduction must be a 4-digit year" })
    .max(9999, { message: "yearOfProduction must be a 4-digit year" })
    .positive({ message: "yearOfProduction must be a positive integer" })
    .optional(),
});

// Note: the original's update schema requires assetStatus/assetId/isIotEnable
// (not optional), same as create — which makes UpdateHealthcareFacilityAsset
// use-case's `?? existingData.x` fallbacks for those three fields dead code
// upstream (validateRequest would already have rejected a request missing
// them). Preserved verbatim: required here too, even though
// UpdateHealthcareFacilityAssetRequest's TS type marks them optional to allow
// the (unreachable-if-schema-enforced) fallback path to type-check in
// service.ts.
export const updateHealthcareFacilityAssetBodySchema = z.object({
  assetStatus: z.enum(ASSET_STATUS_VALUES, {
    message: "asset_status must be one of 'OPERATIONAL', 'UNDER_MAINTAINENCE', 'OUT_OF_SERVICE', 'IDLE', 'RETIRED'.",
  }),
  assetId: z
    .string({ message: "asset_id must be a positive integer" })
    .min(3, { message: "asset_id must be at least 3 characters long" }),
  modelId: z.number().int().positive({ message: "model_id must be a positive integer" }),
  healthcareFacilityId: z
    .number({ message: "Heathcare facility id is required" })
    .int()
    .positive({ message: "healthcare_facility_id must be a positive integer" })
    .optional(),
  isIotEnable: z.boolean(),
  warrantyStartDate: z.string().date().min(1).optional(),
  warrantyEndDate: z.string().date().min(1).optional(),
  yearOfProduction: z
    .number()
    .int()
    .min(1000, { message: "yearOfProduction must be a 4-digit year" })
    .max(9999, { message: "yearOfProduction must be a 4-digit year" })
    .positive({ message: "yearOfProduction must be a positive integer" })
    .optional(),
});
