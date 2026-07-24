import { z } from "zod"

// Schema for GET /verify-bmhp-planning (no pagination — returns full list)
export const GetBmhpTargetAdjustmentQuerySchema = z.object({
  program_plan_id: z.coerce.number().int().positive(),
  regency_id: z.coerce.number().int().positive().optional(),
  keyword: z.string().optional(),
  // Accepts: ?examination_id=1&examination_id=2  OR  ?examination_id=10,2,3
  examination_id: z
    .preprocess(
      (v) => {
        if (typeof v === "string" && v.includes(",")) {
          return v.split(",").map((s) => Number(s.trim()))
        }
        return v
      },
      z
        .union([
          z.coerce.number().int().positive(),
          z.array(z.coerce.number().int().positive()),
        ])
        .transform((v) => (Array.isArray(v) ? v : [v]))
    )
    .optional(),
})

export type GetVerifyBmhpPlanningQuery = z.infer<
  typeof GetBmhpTargetAdjustmentQuerySchema
>

// Schema for PATCH /bmhp-approval/verifications
// Only send items that have changed (delta/diff from frontend)
export const UpdateBmhpTargetAdjustmentBodySchema = z.object({
  program_plan_id: z.number().int().positive(),
  data: z
    .array(
      z.object({
        planning_id: z.number().int().positive().optional(),
        entity_id: z.number().int().positive(),
        target: z.array(
          z.object({
            id: z.number().int().positive().nullable(),
            examination_id: z.number().int().positive(),
            target_id: z.number().int().positive().nullable(),
            target: z.number().int().nonnegative(),
            adjustment_target: z.number().int().nonnegative(),
            // true = approved (verification_status=1), false = rejected/needs revision (verification_status=2)
            status: z.boolean(),
            is_not_screening: z.boolean().optional(),
            // Optional message sent to puskesmas when status=false (rejection note)
            revision_note: z.string().optional(),
          })
        ),
      })
    )
    .min(1, "At least one entity data is required"),
})

export type UpdateVerifyBmhpPlanningBody = z.infer<
  typeof UpdateBmhpTargetAdjustmentBodySchema
>

// Schema for GET /bmhp-approval/verifications/export
// Reuses the same query shape as GET
export const ExportVerifyBmhpPlanningQuerySchema =
  GetBmhpTargetAdjustmentQuerySchema

// Schema for GET /bmhp-approval/verifications/target-input
export const GetTargetInputQuerySchema = z.object({
  program_plan_id: z.coerce.number().int().positive(),
  entity_id: z.coerce.number().int().positive(),
})

export type GetTargetInputQuery = z.infer<typeof GetTargetInputQuerySchema>

// Schema for PATCH /bmhp-approval/verifications/target-input
// program_plan_id here is the ACTUAL program plan DB id (not year)
export const UpdateTargetInputBodySchema = z.object({
  program_plan_id: z.number().int().positive(),
  entity_id: z.number().int().positive(),
  target_input: z
    .array(
      z.object({
        id: z.number().int().positive().nullable(),
        examination_id: z.number().int().positive(),
        target_id: z.number().int().positive().nullable(),
        target: z.number().int().nonnegative(),
      })
    )
    .min(1, "At least one target input is required"),
})

export type UpdateTargetInputBody = z.infer<typeof UpdateTargetInputBodySchema>

export const BulkUpdateVerificationStatusBodySchema = z.object({
  program_plan_id: z.number().int().positive(),
  status: z.number(), // true=approve, false=reject
})

export type BulkUpdateVerificationStatusBody = z.infer<
  typeof BulkUpdateVerificationStatusBodySchema
>

export const UpdateVerificationStatusBodySchema = z.object({
  program_plan_id: z.number().int().positive(),
  target_group_id: z.number().int().positive(),
  material_id: z.number().int().positive(),
  entity_id: z.number().int().positive(),
  status: z.number(), // 0=pending, 1=approve, 2=reject
})

export type UpdateVerificationStatusBody = z.infer<
  typeof UpdateVerificationStatusBodySchema
>

export const RevisionProgramPlanBodySchema = z.object({
  program_plan_id: z.number().int().positive(),
  status: z.number().optional(), // 2=reject, 1=approve
  remaining_stock_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format harus YYYY-MM-DD")
    .optional(),
})

export type RevisionProgramPlanBody = z.infer<
  typeof RevisionProgramPlanBodySchema
>

// Schema for GET /bmhp-approval/verifications/template
export const TemplateVerificationQuerySchema = z.object({
  program_plan_id: z.coerce.number().int().positive(),
})

export type TemplateVerificationQuery = z.infer<
  typeof TemplateVerificationQuerySchema
>

// Schema for POST /bmhp-approval/verifications/import (query params)
export const ImportVerificationQuerySchema = z.object({
  program_plan_id: z.coerce.number().int().positive(),
})

export type ImportVerificationQuery = z.infer<
  typeof ImportVerificationQuerySchema
>

// Schema for GET /bmhp-approval/ministry-recapitulation
export const GetMinistryRecapitulationQuerySchema = z.object({
  program_plan_id: z.coerce.number().int().positive(),
  entity_id: z.coerce.number().int().positive(),
  page: z.coerce.number().int().positive().optional(),
  paginate: z.coerce.number().int().positive().optional(),
})

export type GetMinistryRecapitulationQuery = z.infer<
  typeof GetMinistryRecapitulationQuerySchema
>

// Schema for GET /bmhp-approval/ministry-recapitulation/detail
export const GetMinistryRecapitulationDetailQuerySchema = z.object({
  program_plan_id: z.coerce.number().int().positive(),
  entity_id: z.coerce.number().int().positive().optional(),
  province_id: z.coerce.number().int().positive().optional(),
})

export type GetMinistryRecapitulationDetailQuery = z.infer<
  typeof GetMinistryRecapitulationDetailQuerySchema
>
