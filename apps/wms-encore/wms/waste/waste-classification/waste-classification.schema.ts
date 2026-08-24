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

const boolLikeSchema = z.union([z.boolean(), z.number().int().min(0).max(1)]).transform(Boolean);

export const createWasteClassificationBodySchema = z.object({
  regionId: z.number().int().positive({ message: "regionId must be a positive integer" }).optional(),
  effectiveFrom: z.string().date().optional(),
  effectiveTo: z.string().date().optional(),
  wasteTypeId: z.number().int().positive(),
  wasteGroupId: z.number().int().positive(),
  wasteCharacteristicsId: z.number().int().positive(),
  wasteCode: z
    .string()
    .min(1, { message: "wasteCode is required" })
    .max(64, { message: "wasteCode max input 64 character" }),
  wasteBagColorCode: wasteBagColorCodeEnum,
  storageRuleType: storageRuleTypeEnum.optional(),
  useColdStorage: boolLikeSchema,
  coldStorageMinHours: z.number().int().positive().optional(),
  coldStorageMaxHours: z.number().int().positive().optional(),
  tempStorageMinHours: z.number().int().positive().optional(),
  tempStorageMaxHours: z.number().int().nonnegative().optional(),
  minimunDecayDay: z.number().int().positive().optional(),
  storageRule: z.string().optional(),
  allowHealthcareFacilityTreatment: boolLikeSchema,
  treatmentMethod: z.string().min(1).max(255).optional(),
  disposalMethod: z
    .string()
    .min(1, { message: "disposalMethod is required" })
    .max(255, { message: "disposalMethod max input 255 character" }),
  // Original: `isActive: z.boolean().optional().default(false)`.
  isActive: z.boolean().optional().default(false),
  hasMultipleTransporters: boolLikeSchema,
  allowedVehicleTypes: allowedVehicleTypesEnum.optional(),
});

// Update mirrors create but has no `isActive` field (the original use-case
// preserves the existing row's isActive rather than accepting a new value).
export const updateWasteClassificationBodySchema = z.object({
  regionId: z.number().int().positive().optional(),
  effectiveFrom: z.string().date().optional(),
  effectiveTo: z.string().date().optional(),
  wasteTypeId: z.number().int().positive(),
  wasteGroupId: z.number().int().positive(),
  wasteCharacteristicsId: z.number().int().positive(),
  wasteCode: z.string().min(1).max(64),
  wasteBagColorCode: wasteBagColorCodeEnum,
  storageRuleType: storageRuleTypeEnum.optional(),
  useColdStorage: boolLikeSchema,
  coldStorageMinHours: z.number().int().positive().optional(),
  coldStorageMaxHours: z.number().int().positive().optional(),
  tempStorageMinHours: z.number().int().positive().optional(),
  tempStorageMaxHours: z.number().int().nonnegative().optional(),
  minimunDecayDay: z.number().int().positive().optional(),
  storageRule: z.string().optional(),
  hasMultipleTransporters: boolLikeSchema,
  allowHealthcareFacilityTreatment: boolLikeSchema,
  treatmentMethod: z.string().min(1).max(255).optional(),
  disposalMethod: z.string().min(1).max(255),
  allowedVehicleTypes: allowedVehicleTypesEnum.optional(),
});
