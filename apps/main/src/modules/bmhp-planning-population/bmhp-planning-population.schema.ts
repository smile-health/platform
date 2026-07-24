import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { z } from "zod"

export const PopulateCalculateQuerySchema = PaginationQueriesSchema.extend({
  province_id: z.coerce.number({
    required_error: "province_id is required",
  }),
  program_plan_id: z.coerce.number({
    required_error: "program_plan_id is required",
  }),
})

export type PopulateCalculateQuery = z.infer<
  typeof PopulateCalculateQuerySchema
>
