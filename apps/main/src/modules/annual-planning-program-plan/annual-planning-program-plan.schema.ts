import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import z from "zod"

export type ProgramPlanTaskDTO = {
  plan_task_id: number
  province_id: number
  coverage_number: number
  created_by: number | undefined
  updated_by: number | undefined
}

export const GetListProgramPlanSchema = PaginationQueriesSchema.extend({
  year: z.string().optional(),
  is_final: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sort_by: z.enum(["year", "is_final", "updated_at"]).optional(),
  sort_type: z.enum(["asc", "desc"]).optional(),
}).refine(
  (data) => {
    if (
      (data.sort_by && !data.sort_type) ||
      (!data.sort_by && data.sort_type)
    ) {
      return false
    }
    return true
  },
  { message: "Both sort_by and sort_type must be provided together" }
)

export const SubmitProgramPlanSchema = z.object({
  year: z.string(),
  approach_id: z.number(),
})

export const SubmitSetStatusProgramPlanSchema = z.object({
  status: z.string(),
})

export const CopyProgramPlanSchema = z.object({
  source_id: z.number(),
  target_year: z.number(),
  copy_items: z.array(
    z.enum([
      "program_plan",
      "target_group",
      "task",
      "material_ratio",
      "material_substitution",
    ])
  ),
  approach_id: z.number().optional(), // added in middleware
  source_target_group_ids: z.array(z.number()).default([]), // added in middleware
  source_task_list: z // added in middleware
    .array(
      z.object({
        id: z.number(),
        code: z.string(),
        program_plan_id: z.number(),
        material_id: z.number(),
        activity_id: z.number(),
        ip: z.number(),
        month_distribution: z.string().nullable(),
        target_group_id: z.number(),
        number_of_dose: z.number(),
      })
    )
    .default([]), // added in middleware
  source_coverages: z
    .array(
      z.object({
        plan_task_id: z.number(),
        province_id: z.number(),
        coverage_number: z.number(),
      })
    )
    .default([]), // added in middleware
  source_material_ratios: z
    .array(
      z.object({
        program_plan_id: z.number(),
        from_subtype_id: z.number(),
        from_material_id: z.number(),
        from_material_qty: z.number(),
        to_subtype_id: z.number(),
        to_material_id: z.number(),
        to_material_qty: z.number(),
      })
    )
    .default([]), // added in middleware
  source_material_substitutions: z
    .array(
      z.object({
        program_plan_id: z.number(),
        material_id: z.number(),
        substitution_material_id: z.number(),
      })
    )
    .default([]), // added in middleware
})

export type GetListProgramPlanQueries = z.infer<typeof GetListProgramPlanSchema>
export type SubmitProgramPlanRequest = z.infer<typeof SubmitProgramPlanSchema>
export type SubmitSetStatusProgramPlanRequest = z.infer<
  typeof SubmitSetStatusProgramPlanSchema
>
export type CopyProgramPlanRequest = z.infer<typeof CopyProgramPlanSchema>

export type BmhpStatus = {
  master_pemeriksaan: boolean
  jenis_pemeriksaan: boolean
  method: boolean
  parameter: boolean
  variant: boolean
  material: boolean
}
