import { z } from "zod";

// Mirrors createAssetManufacturer.schema.ts / updateAssetManufacturer.schema.ts.
// The originals also require `createdBy` / `updatedBy` in the request body,
// but (same convention as every other ported module, e.g. global-settings)
// those come from the authenticated user here, not re-validated as body
// fields.
export const createAssetManufacturerBodySchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().max(255, "Description to loong, max 255").optional(),
});

// updateAssetManufacturer.schema.ts's `name` field is required (not optional),
// unlike the create schema's `description` — preserved verbatim.
export const updateAssetManufacturerBodySchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().max(255, "Description to loong, max 255").optional(),
});
