import { z } from "zod"
import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"

export const GetMonitoringQuerySchema = PaginationQueriesSchema.extend({
  program_plan_id: z.coerce.number().int().positive(),
  regency_id: z.coerce.number().int().positive().optional(),
  entity_id: z.coerce.number().int().positive().optional(),
  entity_ids: z.string().optional(),
  examination_id: z.coerce.number().int().positive().optional(),
  examination_ids: z.string().optional(),
  status: z
    .enum(["all", "completed", "not_applicable", "not_submitted"])
    .default("all"),
  keyword: z.string().max(255).optional(),
  not_submitted: z.enum(["0", "1"]).optional(),
})

export type GetMonitoringQuery = z.infer<typeof GetMonitoringQuerySchema>

export const APPROVAL_VALID_STATUSES = [
  "ONDESK",
  "REVISION",
  "APPROVED",
] as const
export type ApprovalStatus = (typeof APPROVAL_VALID_STATUSES)[number]

export const GetApprovalListQuerySchema = PaginationQueriesSchema.extend({
  year: z.coerce.number().int().positive().optional(),
  keyword: z.string().max(255).optional(),
})

export type GetApprovalListQuery = z.infer<typeof GetApprovalListQuerySchema>
