import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { z } from "zod"

/**
 * approval_status stored in ws_program_plans:
 * 0 = ONDESK (default)
 * 1 = Approved
 * 2 = Revision
 */
export const APPROVAL_STATUS = {
  ONDESK: 0,
  APPROVED: 1,
  REVISION: 2,
} as const

export const APPROVAL_STATUS_LABELS: Record<number, string> = {
  [APPROVAL_STATUS.ONDESK]: "ON DESK",
  [APPROVAL_STATUS.APPROVED]: "APPROVED",
  [APPROVAL_STATUS.REVISION]: "REVISION",
}

/**
 * Regency/City approval_status mapping (as per user request):
 * 0 = On Desk
 * 1 = Approved
 * 2 = Rejected
 * 3 = Approved
 */
export const REGENCY_APPROVAL_STATUS = {
  ON_DESK: 0,
  APPROVED: 1,
  REJECTED: 2,
  FINAL_APPROVED: 3,
} as const

/**
 * Province-level status mapping (as per user request):
 * 0 = Not Submitted
 * 1 = Submitted, Not Yet Reviewed
 * 2 = Not Submitted
 * 3 = Submitted, Reviewed
 */
export const PROVINCE_REPORT_STATUS = {
  NOT_SUBMITTED: "Not Submitted",
  SUBMITTED: "Submitted",
} as const

export const PROVINCE_REVIEW_STATUS = {
  NOT_YET_REVIEWED: "Not Yet Reviewed",
  REVIEWED: "Reviewed",
} as const

export const GetApprovalListQuerySchema = PaginationQueriesSchema.extend({
  program_plan_id: z.coerce.number().int().positive().optional(),
  regency_id: z.coerce.number().int().positive().optional(),
  keyword: z.string().max(255).optional(),
})

export type GetApprovalListQuery = z.infer<typeof GetApprovalListQuerySchema>

export const GetProvinceApprovalListQuerySchema =
  PaginationQueriesSchema.extend({
    program_plan_id: z.coerce.number().int().positive(),
    keyword: z.string().max(255).optional(),
    province_id: z.coerce.number().int().positive().optional(),
  })

export type GetProvinceApprovalListQuery = z.infer<
  typeof GetProvinceApprovalListQuerySchema
>

// Schema for POST /bmhp-approval/review
export const ReviewProgramPlanBodySchema = z.object({
  program_plan_id: z.coerce.number().int().positive(),
  notes: z.string().optional(),
})

export type ReviewProgramPlanBody = z.infer<typeof ReviewProgramPlanBodySchema>

// Schema for POST /bmhp-approval/province/:entity_id
export const UpdateProvinceApprovalBodySchema = z.object({
  program_plan_id: z.coerce.number().int().positive(),
  status: z.union([z.literal(1), z.literal(3)]),
})

export type UpdateProvinceApprovalBody = z.infer<
  typeof UpdateProvinceApprovalBodySchema
>

// Schema for params in POST /bmhp-approval/province/:entity_id
export const UpdateProvinceApprovalParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export type UpdateProvinceApprovalParam = z.infer<
  typeof UpdateProvinceApprovalParamSchema
>

// Schema for GET /bmhp-approval/:program_plan_id
export const GetApprovalDetailParamSchema = z.object({
  program_plan_id: z.coerce.number().int().positive(),
})

export type GetApprovalDetailParam = z.infer<
  typeof GetApprovalDetailParamSchema
>

export const ExportRegencyXlsParamSchema = z.object({
  regency_id: z.coerce.number().int().positive(),
})

export type ExportRegencyXlsParam = z.infer<typeof ExportRegencyXlsParamSchema>

export const ExportRegencyXlsQuerySchema = z.object({
  program_plan_id: z.coerce.number().int().positive(),
})

export type ExportRegencyXlsQuery = z.infer<typeof ExportRegencyXlsQuerySchema>

export const SubmitProvinceApprovalBodySchema = z.object({
  program_plan_id: z.coerce.number().int().positive(),
})

export type SubmitProvinceApprovalBody = z.infer<
  typeof SubmitProvinceApprovalBodySchema
>

export const GetEntityQuerySchema = PaginationQueriesSchema.extend({
  keyword: z.string().optional(),
  entity_regency_id: z.coerce.number().int().positive().optional(),
})

export type GetEntityQuery = z.infer<typeof GetEntityQuerySchema>

export const UpsertSignatureBodySchema = z.object({
  name: z.string().min(1).max(150),
  position: z.string().max(150).optional().nullable(),
  signature_url: z.string().max(255),
  program: z.string().max(255).optional().nullable(),
})

export type UpsertSignatureBody = z.infer<typeof UpsertSignatureBodySchema>
