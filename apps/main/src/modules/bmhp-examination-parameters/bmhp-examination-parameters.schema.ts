import { IdSchema } from "@smile/lib/types/param.js"
import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { z } from "zod"

export const GetBmhpExaminationParametersQueriesSchema = PaginationQueriesSchema.extend({
  examination_id: IdSchema.optional().or(z.literal("")).transform(Number),
  parameter_id: IdSchema.optional().or(z.literal("")).transform(Number),
  sort_by: z
    .enum(
      [
        "sort_order",
        "created_at",
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

export const CreateBmhpExaminationParameterRequestSchema = z.object({
  examination_id: z.number().positive().int(),
  parameter_id: z.number().positive().int(),
  sort_order: z.number().int().optional().default(1),
})

export const UpdateBmhpExaminationParameterRequestSchema = z.object({
  parameter_id: z.number().positive().int().optional(),
  sort_order: z.number().int().optional(),
})

export const BulkCreateBmhpExaminationParametersRequestSchema = z.object({
  examination_id: z.number().positive().int(),
  parameters: z.array(z.object({
    parameter_id: z.number().positive().int(),
    sort_order: z.number().int().optional().default(1),
  })).min(1, "At least one parameter is required"),
})

export type GetBmhpExaminationParametersQueries = z.infer<
  typeof GetBmhpExaminationParametersQueriesSchema
>
export type CreateBmhpExaminationParameterRequest = z.infer<
  typeof CreateBmhpExaminationParameterRequestSchema
>
export type UpdateBmhpExaminationParameterRequest = z.infer<
  typeof UpdateBmhpExaminationParameterRequestSchema
>
export type BulkCreateBmhpExaminationParametersRequest = z.infer<
  typeof BulkCreateBmhpExaminationParametersRequestSchema
>
