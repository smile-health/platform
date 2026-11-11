import { z } from "zod";

// Mirrors createPartnershipOperatorMap.schema.ts / updatePartnershipOperatorMap.schema.ts's
// body shape exactly (identical in the original) — applied manually inside
// partnership-operator-map.service.ts, not as the api() request type (gotcha #3).
export const partnershipOperatorMapBodySchema = z.object({
  partnershipId: z.int().positive({
    error: "partnershipId must be a positive integer",
  }),
  operatorId: z
    .string({
      error: "operatorId is required",
    })
    .max(36),
});
