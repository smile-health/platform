import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { z } from "zod"

/**
 * GET /bmhp-approval/ministry-of-health
 * Paginated list of provinces with their BMHP approval period submission/approval status.
 */
export const GetMinistryApprovalListQuerySchema = PaginationQueriesSchema.extend(
  {
    program_plan_id: z.coerce.number().int().positive().optional(),
    province_id: z.coerce.number().int().positive().optional(),
    status: z.coerce.number().int().optional(),
  }
)

export type GetMinistryApprovalListQuery = z.infer<
  typeof GetMinistryApprovalListQuerySchema
>

/**
 * GET /bmhp-approval/ministry-of-health/:id
 * Paginated list of national procurement recapitulation per material for a period
 */
export const GetMinistryApprovalRecapitulationQuerySchema =
  PaginationQueriesSchema.extend({
    keyword: z.string().optional(),
    program_plan_id: z.coerce.number().int().positive(),
  })

export type GetMinistryApprovalRecapitulationQuery = z.infer<
  typeof GetMinistryApprovalRecapitulationQuerySchema
>

export const GetMinistryApprovalRecapitulationParamsSchema = z.object({
  province_id: z.coerce.number().int().positive(),
})

export type GetMinistryApprovalRecapitulationParams = z.infer<
  typeof GetMinistryApprovalRecapitulationParamsSchema
>
