import { z } from "zod";

// Mirrors createEntityLocation.schema.ts / updateEntityLocation.schema.ts's body
// shape exactly (both originals share the same field set) — applied manually
// inside entity-location.service.ts, not as the api() request type (gotcha #3).
export const entityLocationBodySchema = z.object({
  entityId: z
    .number({ message: "entityId is required" })
    .int({ message: "entityId must be an integer" })
    .positive({ message: "entityId must be a positive number" })
    .optional(),
  locationName: z
    .string({ message: "locationName is required" })
    .min(1, { message: "locationName cannot be empty" }),
  latitude: z
    .number({ message: "latitude is required" })
    .min(-90, { message: "latitude must be >= -90" })
    .max(90, { message: "latitude must be <= 90" }),
  longitude: z
    .number({ message: "longitude is required" })
    .min(-180, { message: "longitude must be >= -180" })
    .max(180, { message: "longitude must be <= 180" }),
  distanceLimitInMeters: z
    .number({ message: "distanceLimitInMeters must be a number" })
    .positive({ message: "distanceLimitInMeters must be a positive number" })
    .optional(),
  address: z.string().optional(),
  provinceId: z
    .number({ message: "provinceId must be a number" })
    .int({ message: "provinceId must be an integer" })
    .positive({ message: "provinceId must be a positive number" })
    .optional(),
  cityId: z
    .number({ message: "cityId must be a number" })
    .int({ message: "cityId must be an integer" })
    .positive({ message: "cityId must be a positive number" })
    .optional(),
  provinceName: z.string().optional(),
  cityName: z.string().optional(),
});

// locationType is server-derived (not client-supplied) in the original
// controller, but is still constrained to these two values everywhere it's
// persisted — validated manually against this enum in service.ts.
export const locationTypeSchema = z.enum(["STORAGE", "TREATMENT"]);
