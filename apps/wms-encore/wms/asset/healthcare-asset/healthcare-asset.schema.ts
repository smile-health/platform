import { z } from "zod";

// Mirrors createHealthcareAsset.schema.ts's body.
export const createHealthcareAssetBodySchema = z.object({
  id: z.number().min(1, { message: "id is required" }),
  assetId: z
    .string({ message: "asset_id must be a positive integer" })
    .min(3, { message: "asset_id must be at least 3 characters long" })
    .optional(),
  healthcareFacilityId: z
    .number({ message: "Heathcare facility id is required" })
    .int()
    .positive({ message: "entity_id must be a positive integer" }),
  assetTypeName: z.string(),
  assetWorkingStatusName: z.string(),
  createdAt: z.string().transform((val) => new Date(val)),
  updatedAt: z.string().transform((val) => new Date(val)),
});

// Mirrors updateHealthcareAsset.schema.ts's body. `status` accepts
// boolean|0|1 in the original; the wire type here is already narrowed to
// boolean (see types.ts's comment), so only the boolean branch is validated.
export const updateHealthcareAssetBodySchema = z.object({
  assetId: z
    .string({ message: "asset_id must be a positive integer" })
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .nullable()
    .refine((val) => val == null || val.length >= 3, {
      message: "asset_id must be at least 3 characters long",
    }),
  healthcareFacilityId: z
    .number({ message: "Heathcare facility id is required" })
    .int()
    .positive({ message: "entity_id must be a positive integer" })
    .optional(),
  assetTypeName: z.string().optional(),
  assetWorkingStatusName: z.string().optional(),
  status: z.boolean().optional(),
  createdAt: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  updatedAt: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
});
