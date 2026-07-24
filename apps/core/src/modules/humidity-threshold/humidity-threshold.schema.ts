import { PaginationQueriesSchema } from "@smile-health/lib/types/paginate"
import { z } from "zod"

/* Query Params Schema */
export const GetHumidityThresholdsQueryParamsSchema =
  PaginationQueriesSchema.extend({
  })

/* Query Params Type */
export type GetHumidityThresholdsQueryParams = z.infer<
  typeof GetHumidityThresholdsQueryParamsSchema
>