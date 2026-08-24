import { z } from "zod";

// Mirrors createPartnershipVehicleMap.schema.ts's body shape exactly —
// applied manually inside partnership-vehicle-map.service.ts, not as the
// api() request type (gotcha #3).
export const partnershipVehicleMapBodySchema = z.object({
  partnershipId: z
    .number({ message: "partnershipId is required" })
    .int()
    .positive({ message: "partnershipId must be a positive integer" }),
  vehicleId: z
    .number({ message: "vehicleId is required" })
    .int()
    .positive({ message: "vehicleId must be a positive integer" }),
});
