import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { IdSchema } from "@smile/lib/types/param.js"
import { z } from "zod"

export const GetBmhpExaminationTargetGroupsQueriesSchema = PaginationQueriesSchema.extend({
  examination_id: IdSchema.optional().or(z.literal("")).transform(Number),
  target_group_id: IdSchema.optional().or(z.literal("")).transform(Number),
  sort_by: z
    .enum(
      [
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

export const CreateBmhpExaminationTargetGroupRequestSchema = z.object({
  examination_id: z.number().positive().int(),
  target_group_id: z.number().positive().int(),
})

export const BulkCreateBmhpExaminationTargetGroupsRequestSchema = z.object({
  examination_id: z.number().positive().int(),
  target_groups: z.array(z.object({
    target_group_id: z.number().positive().int(),
  })).min(1, "At least one target group is required"),
})

export type GetBmhpExaminationTargetGroupsQueries = z.infer<
  typeof GetBmhpExaminationTargetGroupsQueriesSchema
>
export type CreateBmhpExaminationTargetGroupRequest = z.infer<
  typeof CreateBmhpExaminationTargetGroupRequestSchema
>
export type BulkCreateBmhpExaminationTargetGroupsRequest = z.infer<
  typeof BulkCreateBmhpExaminationTargetGroupsRequestSchema
>
