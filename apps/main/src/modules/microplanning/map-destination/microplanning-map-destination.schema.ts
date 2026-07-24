import z from "zod"
import {
  IdParamsSchema,
  IdSchema as numberInParamSchema,
} from "@smile-health/lib/types/param.js"

export const SubmitMicroplanningMapDestinationItemSchema = z.object({
  id: z.number().positive().nullish().optional(),
  name: z.string().nonempty(),
  sub_type: z.number().positive(),
  latitude: z.number(),
  longitude: z.number(),
  distance_meters: z.number().nonnegative().nullish().optional(),
  duration_seconds: z.number().nonnegative().nullish().optional(),
  road_type: z.number().positive(),
  notes: z.string().nullish().optional(),
})

export const SubmitMicroplanningMapDestinationSchema = z.object({
  destinations: z.array(SubmitMicroplanningMapDestinationItemSchema).nonempty(),
})

export const MicroplanningMapDestinationIdSchema = IdParamsSchema.extend({
  id: numberInParamSchema,
})

export const MicroplanningMapDestinationListParamSchema = z.object({
  category: z.coerce.number().positive().optional().nullish(),
})

export type SubmitMicroplanningMapDestinationRequest = z.infer<
  typeof SubmitMicroplanningMapDestinationSchema
>

export type SubmitMicroplanningMapDestinationItemRequest = z.infer<
  typeof SubmitMicroplanningMapDestinationItemSchema
>

export type GetListMicroplanningMapDestinationParams = z.infer<
  typeof MicroplanningMapDestinationListParamSchema
>
