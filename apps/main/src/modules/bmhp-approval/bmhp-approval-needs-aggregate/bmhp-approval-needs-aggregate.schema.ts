import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { z } from "zod"

// GET /bmhp-approval/needs-aggregate
export const GetNeedsAggregateQuerySchema = PaginationQueriesSchema.extend({
  program_plan_id: z.coerce.number().int().positive(),
  // province_id is automatically extracted from userEntity context
})

export type GetNeedsAggregateQuery = z.infer<
  typeof GetNeedsAggregateQuerySchema
>

// GET /bmhp-approval/needs-aggregate/:city_id/details
export const GetNeedsAggregateDetailParamSchema = z.object({
  city_id: z.coerce.number().int().positive(),
})

export const GetNeedsAggregateDetailQuerySchema = z.object({
  program_plan_id: z.coerce.number().int().positive(),
})

export type GetNeedsAggregateDetailParam = z.infer<
  typeof GetNeedsAggregateDetailParamSchema
>

export type GetNeedsAggregateDetailQuery = z.infer<
  typeof GetNeedsAggregateDetailQuerySchema
>

// POST/PUT /bmhp-approval/needs-aggregate/:city_id/status
export const UpdateNeedsAggregateStatusParamSchema = z.object({
  city_id: z.coerce.number().int().positive(),
})

export const UpdateNeedsAggregateStatusBodySchema = z.object({
  program_plan_id: z.number().int().positive(),
  status: z.enum(["pending", "approved", "rejected"]),
})

export type UpdateNeedsAggregateStatusParam = z.infer<
  typeof UpdateNeedsAggregateStatusParamSchema
>

export type UpdateNeedsAggregateStatusBody = z.infer<
  typeof UpdateNeedsAggregateStatusBodySchema
>
