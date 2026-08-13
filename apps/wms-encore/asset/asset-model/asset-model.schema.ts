import { z } from "zod";

// Mirrors createAsset.schema.ts / updateAsset.schema.ts (identical bodies in
// the original, aside from the createdBy/updatedBy field which comes from the
// authenticated user in this port, same convention as every other module —
// not re-validated as a body field here).
export const assetModelBodySchema = z.object({
  assetType: z.enum(["SCALE", "INCINERATOR", "AUTOCLAVE", "COLD_STORAGE"], {
    message: "assetType must be one of SCALE, INCINERATOR, AUTOCLAVE, or COLD_STORAGE",
  }),
  manufacturerId: z.number().int().positive({ message: "manufacturerId must be a positive integer" }),
  name: z.string().min(1, { message: "name is required" }),
  description: z.string().max(255).optional(),
});
