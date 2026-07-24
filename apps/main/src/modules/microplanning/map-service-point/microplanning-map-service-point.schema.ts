import z from "zod"

export const SubmitMicroplanningMapServicePointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
})

export type SubmitMicroplanningMapServicePointRequest = z.infer<
  typeof SubmitMicroplanningMapServicePointSchema
>
