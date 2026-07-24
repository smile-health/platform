import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import z from "zod"

/* ========== Examination Type ========== */

export const GetListExaminationTypeQuerySchema = PaginationQueriesSchema.extend({
  program_plan_id: z.coerce.number().optional(),
  sort_by: z.enum(["name", "updated_at"]).optional(),
  sort_type: z.enum(["asc", "desc"]).optional(),
})

export const CreateExaminationTypeBodySchema = z.object({
  program_plan_id: z.number().int().positive().optional(),
  name: z.string().min(1).max(100),
  description: z.string().nullish(),
})

export const UpdateExaminationTypeBodySchema = z.object({
  program_plan_id: z.number().int().positive().optional(),
  name: z.string().min(1).max(100),
  description: z.string().nullish(),
})

export type GetListExaminationTypeQuery = z.infer<
  typeof GetListExaminationTypeQuerySchema
>

export type CreateExaminationTypeBody = z.infer<
  typeof CreateExaminationTypeBodySchema
>

export type UpdateExaminationTypeBody = z.infer<
  typeof UpdateExaminationTypeBodySchema
>

/* ========== Examination ========== */

export const GetListExaminationQuerySchema = PaginationQueriesSchema.extend({
  program_plan_id: z.coerce.number().optional(),
  examination_type_id: z.coerce.number().optional(),
  is_active: z.coerce.number().min(0).max(1).optional(),
  sort_by: z.enum(["name", "updated_at"]).optional(),
  sort_type: z.enum(["asc", "desc"]).optional(),
})

export const CreateExaminationBodySchema = z.object({
  program_plan_id: z.number().int().positive().optional(),
  examination_type_id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().nullish(),
  is_active: z.boolean().optional().default(true),
  target_group_ids: z.array(z.number().int().positive()).optional(), // Optional: can be derived from materials
  method_ids: z.array(z.number().int().positive()).optional(),
  parameters: z.array(z.object({
    id: z.number().int().positive(),
    sort_order: z.number().int().min(0).optional(),
  })).optional(),
  materials: z.array(z.object({
    material_id: z.number().int().positive(),
    target_group_ids: z.array(z.number().int().positive()).min(1),
  })).optional(),
})

export const UpdateExaminationBodySchema = z.object({
  program_plan_id: z.number().int().positive().optional(),
  examination_type_id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().nullish(),
  is_active: z.boolean().optional(),
  target_group_ids: z.array(z.number().int().positive()).optional(), // Optional: can be derived from materials
  method_ids: z.array(z.number().int().positive()).optional(),
  parameters: z.array(z.object({
    id: z.number().int().positive(),
    sort_order: z.number().int().min(0).optional(),
  })).optional(),
  materials: z.array(z.object({
    material_id: z.number().int().positive(),
    target_group_ids: z.array(z.number().int().positive()).min(1),
  })).optional(),
})

export type GetListExaminationQuery = z.infer<
  typeof GetListExaminationQuerySchema
>

export type CreateExaminationBody = z.infer<typeof CreateExaminationBodySchema>

export type UpdateExaminationBody = z.infer<typeof UpdateExaminationBodySchema>

/* ========== Examination Target Materials ========== */

export const GetExaminationTargetMaterialsQuerySchema = PaginationQueriesSchema.extend({
  bmhp_material_id: z.coerce.number().optional(),
  exam_target_group_id: z.coerce.number().optional(),
  sort_by: z.enum(["exam_target_group_id", "bmhp_material_id", "created_at"]).optional(),
  sort_type: z.enum(["asc", "desc"]).optional(),
})

export const CreateExaminationTargetMaterialBodySchema = z.object({
  exam_target_group_id: z.number().int().positive(),
  bmhp_material_id: z.number().int().positive(),
})

export const UpdateExaminationTargetMaterialBodySchema = z.object({
  exam_target_group_id: z.number().int().positive().optional(),
  bmhp_material_id: z.number().int().positive().optional(),
})

export type GetExaminationTargetMaterialsQuery = z.infer<
  typeof GetExaminationTargetMaterialsQuerySchema
>

export type CreateExaminationTargetMaterialBody = z.infer<
  typeof CreateExaminationTargetMaterialBodySchema
>

export type UpdateExaminationTargetMaterialBody = z.infer<
  typeof UpdateExaminationTargetMaterialBodySchema
>
