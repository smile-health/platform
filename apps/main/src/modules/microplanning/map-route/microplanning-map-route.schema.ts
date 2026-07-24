import z from "zod"

export const SubmitMicroplanningMapRouteSchema = z.object({
  destination_ids: z.array(z.number().positive()),
})

export type SubmitMicroplanningMapRouteRequest = z.infer<
  typeof SubmitMicroplanningMapRouteSchema
>
