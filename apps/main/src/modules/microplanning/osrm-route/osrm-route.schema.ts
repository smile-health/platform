import z from "zod"

const longitude = z.coerce
  .number()
  .refine((v) => Number.isFinite(v), { message: "validator.invalid_number" })
  .refine((v) => v >= -180 && v <= 180, {
    message: "validator.invalid_longitude",
  })

const latitude = z.coerce
  .number()
  .refine((v) => Number.isFinite(v), { message: "validator.invalid_number" })
  .refine((v) => v >= -90 && v <= 90, {
    message: "validator.invalid_latitude",
  })

export const GetOsrmRouteQuerySchema = z.object({
  olng: longitude,
  olat: latitude,
  dlng: longitude,
  dlat: latitude,
  // Query params arrive as strings; only accept explicit "true"/"false".
  geometry: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
})

export type GetOsrmRouteQuery = z.infer<typeof GetOsrmRouteQuerySchema>
