import { z } from "zod";

// Mirrors createPartnershipVehicleMap.schema.ts's body shape exactly —
// applied manually inside partnership-vehicle-map.service.ts, not as the
// api() request type (gotcha #3).
export const partnershipVehicleMapBodySchema = z.object({
  partnershipId: z.int().positive({
    error: "partnershipId must be a positive integer",
  }),
  vehicleId: z.int().positive({
    error: "vehicleId must be a positive integer",
  }),
});
