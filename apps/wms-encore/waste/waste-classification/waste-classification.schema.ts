import { z } from "zod";

// Mirrors createWasteClassification.schema.ts / updateWasteClassification.schema.ts
// (the original's two body schemas, which are near-identical). `createdBy` /
// `updatedBy` come from the authenticated user in this port (same convention
// as every other module), not re-validated as body fields.

export const wasteBagColorCodeEnum = z.enum([
  "BLACK",
  "GRAY",
  "YELLOW",
  "PURPLE",
  "BROWN",
  "RED",
  "NONE",
]);

export const storageRuleTypeEnum = z.enum(["STATIC", "RULE_BASED"]);

export const allowedVehicleTypesEnum = z.enum([
  "BOX_TRUCK",
  "REFRIGERATED_BOX_TRUCK",
  "OPEN_BODY_TRUCK",
  "TANKER",
  "HAZARDOUS_MATERIAL_TRUCK",
  "RADIOACTIVE_MATERIAL_TRUCK",
  "FLATBED_TRUCK",
  "LOADER_TRUCK",
  "TRAILER",
  "VAN",
]);

const boolLikeSchema = z.union([z.boolean(), z.int().min(0).max(1)]).transform(Boolean);

export const createWasteClassificationBodySchema = z.object({
  regionId: z.int().positive({
      error: "regionId must be a positive integer"
}).optional(),
  effectiveFrom: z.iso.date().optional(),
  effectiveTo: z.iso.date().optional(),
  wasteTypeId: z.int().positive(),
  wasteGroupId: z.int().positive(),
  wasteCharacteristicsId: z.int().positive(),
  wasteCode: z
    .string()
    .min(1, {
        error: "wasteCode is required"
    })
    .max(64, {
        error: "wasteCode max input 64 character"
    }),
  wasteBagColorCode: wasteBagColorCodeEnum,
  storageRuleType: storageRuleTypeEnum.optional(),
  useColdStorage: boolLikeSchema,
  coldStorageMinHours: z.int().positive().optional(),
  coldStorageMaxHours: z.int().positive().optional(),
  tempStorageMinHours: z.int().positive().optional(),
  tempStorageMaxHours: z.int().nonnegative().optional(),
  minimunDecayDay: z.int().positive().optional(),
  storageRule: z.string().optional(),
  allowHealthcareFacilityTreatment: boolLikeSchema,
  treatmentMethod: z.string().min(1).max(255).optional(),
  disposalMethod: z
    .string()
    .min(1, {
        error: "disposalMethod is required"
    })
    .max(255, {
        error: "disposalMethod max input 255 character"
    }),
  // Original: `isActive: z.boolean().optional().default(false)`.
  isActive: z.boolean().optional().default(false),
  hasMultipleTransporters: boolLikeSchema,
  allowedVehicleTypes: allowedVehicleTypesEnum.optional(),
});

// Update mirrors create but has no `isActive` field (the original use-case
// preserves the existing row's isActive rather than accepting a new value).
export const updateWasteClassificationBodySchema = z.object({
  regionId: z.int().positive().optional(),
  effectiveFrom: z.iso.date().optional(),
  effectiveTo: z.iso.date().optional(),
  wasteTypeId: z.int().positive(),
  wasteGroupId: z.int().positive(),
  wasteCharacteristicsId: z.int().positive(),
  wasteCode: z.string().min(1).max(64),
  wasteBagColorCode: wasteBagColorCodeEnum,
  storageRuleType: storageRuleTypeEnum.optional(),
  useColdStorage: boolLikeSchema,
  coldStorageMinHours: z.int().positive().optional(),
  coldStorageMaxHours: z.int().positive().optional(),
  tempStorageMinHours: z.int().positive().optional(),
  tempStorageMaxHours: z.int().nonnegative().optional(),
  minimunDecayDay: z.int().positive().optional(),
  storageRule: z.string().optional(),
  hasMultipleTransporters: boolLikeSchema,
  allowHealthcareFacilityTreatment: boolLikeSchema,
  treatmentMethod: z.string().min(1).max(255).optional(),
  disposalMethod: z.string().min(1).max(255),
  allowedVehicleTypes: allowedVehicleTypesEnum.optional(),
});
