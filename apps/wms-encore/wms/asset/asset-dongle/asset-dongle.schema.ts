import { z } from "zod";

// Mirrors createAssetDongle.schema.ts's body schema exactly.
export const createAssetDongleBodySchema = z.object({
  assetId: z.string().min(1, { message: "assetId is required" }),
});
