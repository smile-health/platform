import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { z } from "zod"

export const ListWsPlanTargetGroupQueriesSchema =
  PaginationQueriesSchema.extend({
    program_plan_id: z.coerce.number().optional(),
    keyword: z.string().optional(),
    sort_by: z
      .enum(["title", "created_at", "updated_at"], {
        message: "INVALID REQUEST SORT_BY",
      })
      .optional(),
    sort_type: z
      .enum(["asc", "desc"], { message: "INVALID REQUEST SORT_TYPE" })
      .optional(),
  })

export const BulkCreateWsPlanTargetGroupRequestSchema = z.object({
  program_plan_id: z.number({ required_error: "program_plan_id is required" }),
  target_group_ids: z
    .array(z.number())
    .min(1, "Target group IDs cannot be empty"),
})

export type ListWsPlanTargetGroupQueries = z.infer<
  typeof ListWsPlanTargetGroupQueriesSchema
>
export type BulkCreateWsPlanTargetGroupRequest = z.infer<
  typeof BulkCreateWsPlanTargetGroupRequestSchema
>

export const VerifyPlanQueriesSchema = z.object({
  program_plan_id: z.coerce.number({
    required_error: "program_plan_id is required",
  }),
})

export type VerifyPlanQueries = z.infer<typeof VerifyPlanQueriesSchema>
