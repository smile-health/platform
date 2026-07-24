import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { IdSchema } from "@smile/lib/types/param.js"
import { z } from "zod"

export const GetBmhpParametersQueriesSchema = PaginationQueriesSchema.extend({
  program_plan_id: z.coerce.number().optional(),
  keyword: z.string().optional(),
  sort_by: z
    .enum(
      [
        "name",
        "unit",
        "created_at",
        "updated_at",
      ],
      {
        message: "INVALID REQUEST SORT_BY",
      }
    )
    .optional(),
  sort_type: z
    .enum(["asc", "desc"], { message: "INVALID REQUEST SORT_TYPE" })
    .optional(),
})

export const CreateBmhpParameterRequestSchema = z.object({
  program_plan_id: z.number().int().positive().optional(),
  name: z.string().min(1, "Name is required").max(100),
  unit: z.string().max(50).optional(),
  description: z.string().optional(),
})

export const UpdateBmhpParameterRequestSchema = z.object({
  program_plan_id: z.number().int().positive().optional(),
  name: z.string().min(1, "Name is required").max(100).optional(),
  unit: z.string().max(50).optional(),
  description: z.string().optional(),
})

export type GetBmhpParametersQueries = z.infer<
  typeof GetBmhpParametersQueriesSchema
>
export type CreateBmhpParameterRequest = z.infer<
  typeof CreateBmhpParameterRequestSchema
>
export type UpdateBmhpParameterRequest = z.infer<
  typeof UpdateBmhpParameterRequestSchema
>
