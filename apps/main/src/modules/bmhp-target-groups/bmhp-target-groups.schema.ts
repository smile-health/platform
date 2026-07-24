import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { z } from "zod"

export const GetBmhpTargetGroupsQueriesSchema = PaginationQueriesSchema.extend({
  search: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
  sort_by: z
    .enum(
      [
        "name",
        "code",
        "age_range",
        "is_active",
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

export const CreateBmhpTargetGroupRequestSchema = z.object({
  code: z.string().max(50).optional(),
  name: z.string().min(1, "Name is required").max(100),
  age_range: z.string().max(50).optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional().default(true),
})

export const UpdateBmhpTargetGroupRequestSchema = z.object({
  code: z.string().max(50).optional(),
  name: z.string().min(1, "Name is required").max(100).optional(),
  age_range: z.string().max(50).optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
})

export const UpdateBmhpTargetGroupStatusRequestSchema = z.object({
  is_active: z.boolean(),
})

export type GetBmhpTargetGroupsQueries = z.infer<
  typeof GetBmhpTargetGroupsQueriesSchema
>
export type CreateBmhpTargetGroupRequest = z.infer<
  typeof CreateBmhpTargetGroupRequestSchema
>
export type UpdateBmhpTargetGroupRequest = z.infer<
  typeof UpdateBmhpTargetGroupRequestSchema
>
export type UpdateBmhpTargetGroupStatusRequest = z.infer<
  typeof UpdateBmhpTargetGroupStatusRequestSchema
>
