import { z } from "zod";

// Mirrors createEntityLocation.schema.ts / updateEntityLocation.schema.ts's body
// shape exactly (both originals share the same field set) — applied manually
// inside entity-location.service.ts, not as the api() request type (gotcha #3).
export const entityLocationBodySchema = z.object({
  entityId: z
    .int({
      error: "entityId must be an integer",
    })
    .positive({
      error: "entityId must be a positive number",
    })
    .optional(),
  locationName: z
    .string({
      error: "locationName is required",
    })
    .min(1, {
      error: "locationName cannot be empty",
    }),
  latitude: z
    .number({
      error: "latitude is required",
    })
    .min(-90, {
      error: "latitude must be >= -90",
    })
    .max(90, {
      error: "latitude must be <= 90",
    }),
  longitude: z
    .number({
      error: "longitude is required",
    })
    .min(-180, {
      error: "longitude must be >= -180",
    })
    .max(180, {
      error: "longitude must be <= 180",
    }),
  distanceLimitInMeters: z
    .number({
      error: "distanceLimitInMeters must be a number",
    })
    .positive({
      error: "distanceLimitInMeters must be a positive number",
    })
    .optional(),
  address: z.string().optional(),
  provinceId: z
    .int({
      error: "provinceId must be an integer",
    })
    .positive({
      error: "provinceId must be a positive number",
    })
    .optional(),
  cityId: z
    .int({
      error: "cityId must be an integer",
    })
    .positive({
      error: "cityId must be a positive number",
    })
    .optional(),
  provinceName: z.string().optional(),
  cityName: z.string().optional(),
});

// locationType is server-derived (not client-supplied) in the original
// controller, but is still constrained to these two values everywhere it's
// persisted — validated manually against this enum in service.ts.
export const locationTypeSchema = z.enum(["STORAGE", "TREATMENT"]);
