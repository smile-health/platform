import { PaginationQueriesSchema } from "@smile/lib/types/paginate"
import { z } from "zod"

/* Query Params Schema */
export const GetHumidityThresholdsQueryParamsSchema =
  PaginationQueriesSchema.extend({
  })

/* Query Params Type */
export type GetHumidityThresholdsQueryParams = z.infer<
  typeof GetHumidityThresholdsQueryParamsSchema
>