import { z } from "zod"
import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"

export const CreateBmhpPlanningBodySchema = z.object({
  year: z.number().int().positive(),
  examination_id: z.number().int().positive(),
  status: z
    .enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "REVISION"])
    .default("DRAFT"),
  target_groups: z.array(
    z.object({
      target_group_id: z.number().int().positive(),
      sample_count: z.number().int().nonnegative(),
      test_count: z.number().int().nonnegative(),
    })
  ),
  methods: z.array(
    z.object({
      method_id: z.number().int().positive(),
    })
  ),
  materials: z
    .array(
      z.object({
        target_group_index: z.number().int().nonnegative(),
        material_id: z.number().int().positive(),
        material_template_id: z.number().int().positive().optional(),
        variant_id: z.number().int().positive().optional(),
        method_id: z.number().int().positive().optional(),
        lab_usage: z.number().int().nonnegative().optional(),
        calculated_requirement: z.number().int().nonnegative().optional(),
      })
    )
    .optional(),
})

export const UpdateBmhpPlanningBodySchema = z.object({
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]).optional(),
  target_groups: z
    .array(
      z.object({
        target_group_id: z.number().int().positive(),
        sample_count: z.number().int().nonnegative(),
        test_count: z.number().int().nonnegative(),
      })
    )
    .optional(),
  methods: z
    .array(
      z.object({
        method_id: z.number().int().positive(),
      })
    )
    .optional(),
  materials: z
    .array(
      z.object({
        target_group_index: z.number().int().nonnegative(),
        material_id: z.number().int().positive(),
        material_template_id: z.number().int().positive().optional(),
        variant_id: z.number().int().positive().optional(),
        method_id: z.number().int().positive().optional(),
        lab_usage: z.number().int().nonnegative().optional(),
        calculated_requirement: z.number().int().nonnegative().optional(),
      })
    )
    .optional(),
})

export type CreateBmhpPlanningBody = z.infer<
  typeof CreateBmhpPlanningBodySchema
>
export type UpdateBmhpPlanningBody = z.infer<
  typeof UpdateBmhpPlanningBodySchema
>

export const GetListPlanningQuerySchema = PaginationQueriesSchema.extend({
  year: z.coerce.number().int().positive().optional(),
  examination_id: z.coerce.number().int().positive().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]).optional(),
  search: z.string().optional(),
})

export type GetListPlanningQuery = z.infer<typeof GetListPlanningQuerySchema>

export const CheckPlanningQuerySchema = z.object({
  year: z.coerce.number().int().positive(),
  examination_id: z.coerce.number().int().positive(),
})

export type CheckPlanningQuery = z.infer<typeof CheckPlanningQuerySchema>

// Schema for POST /:planning_id/target-groups
export const PlanningIdParamSchema = z.object({
  planning_id: z.string().regex(/^\d+$/, "planning_id must be a number"),
})

export const CreateTargetGroupsBodySchema = z.object({
  planning_id: z.number().int().positive(),
  target_groups: z
    .array(
      z.object({
        target_group_id: z.number().int().positive(),
        sample_count: z.number().int().nonnegative(),
        test_count: z.number().int().nonnegative(),
      })
    )
    .min(1, "At least one target group is required"),
})

export type PlanningIdParam = z.infer<typeof PlanningIdParamSchema>
export type CreateTargetGroupsBody = z.infer<
  typeof CreateTargetGroupsBodySchema
>

// Schema for GET /bmhp-planning/edit/:history_id/:target_group_id
export const GetPlanningEditParamSchema = z.object({
  history_id: z.coerce.number().int().positive(),
  target_group_id: z.coerce.number().int().positive(),
})

export type GetPlanningEditParam = z.infer<typeof GetPlanningEditParamSchema>

// Schema for PUT /bmhp-planning/edit
export const UpdatePlanningEditBodySchema = z.object({
  program_plan_id: z.number().int().positive(),
  examination_id: z.number().int().positive(),
  status: z.string().optional(),
  target_groups: z
    .array(
      z.object({
        target_group_id: z.number().int().positive(),
        sample_count: z.number().int().nonnegative(),
        test_count: z.number().int().nonnegative(),
      })
    )
    .min(1, "At least one target group is required"),
  materials: z
    .array(
      z.object({
        target_group_index: z.number().int().nonnegative(),
        material_id: z.number().int().positive(),
        material_template_id: z.number().int().positive().optional(),
        variant_id: z.number().int().positive().optional(),
        method_id: z.number().int().positive().optional(),
        lab_usage: z.number().int().nonnegative().optional(),
        calculated_requirement: z.number().int().nonnegative().optional(),
      })
    )
    .optional(),
})

export type UpdatePlanningEditBody = z.infer<
  typeof UpdatePlanningEditBodySchema
>

// Schema for POST /examination-target-materials
export const CreateExaminationTargetMaterialsBodySchema = z.object({
  materials: z
    .array(
      z.object({
        exam_target_group_id: z.number().int().positive(),
        bmhp_material_id: z.number().int().positive(),
      })
    )
    .min(1, "At least one material is required"),
})

export type CreateExaminationTargetMaterialsBody = z.infer<
  typeof CreateExaminationTargetMaterialsBodySchema
>

export const SetupExaminationBodySchema = z.object({
  examination_id: z.number().int().positive(),
  parameters: z
    .array(
      z.object({
        parameter_id: z.number().int().positive(),
      })
    )
    .optional(),
  target_groups: z
    .array(
      z.object({
        target_group_id: z.number().int().positive(),
        materials: z
          .array(
            z.object({
              bmhp_material_id: z.number().int().positive(),
            })
          )
          .optional(),
      })
    )
    .optional(),
  methods: z
    .array(
      z.object({
        method_id: z.number().int().positive(),
      })
    )
    .optional(),
})

export type SetupExaminationBody = z.infer<typeof SetupExaminationBodySchema>

export const CreateBmhpParameterBodySchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().optional(),
  is_active: z.boolean().optional().default(true),
})

export type CreateBmhpParameterBody = z.infer<
  typeof CreateBmhpParameterBodySchema
>

export const CreateBmhpTargetGroupBodySchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().optional(),
  is_active: z.boolean().optional().default(true),
})

export type CreateBmhpTargetGroupBody = z.infer<
  typeof CreateBmhpTargetGroupBodySchema
>

export const CreateBmhpExaminationMethodBodySchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().optional(),
  is_active: z.boolean().optional().default(true),
})

export type CreateBmhpExaminationMethodBody = z.infer<
  typeof CreateBmhpExaminationMethodBodySchema
>

export const CreateBmhpMaterialBodySchema = z.object({
  name: z.string().min(1).max(150),
  is_reagen: z.boolean().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional().default(true),
})

export type CreateBmhpMaterialBody = z.infer<
  typeof CreateBmhpMaterialBodySchema
>

export const CityDistrictHealthOfficeTargetSchema = z.object({
  examination_id: z.number().int().positive(),
  year: z.number().int().positive(),
  target_group_ids: z.array(z.number().int().positive()).min(1),
})

export type CityDistrictHealthOfficeTargetBody = z.infer<
  typeof CityDistrictHealthOfficeTargetSchema
>

// Schema for GET /program-plans with status
export const GetProgramPlansWithStatusQuerySchema =
  PaginationQueriesSchema.extend({
    is_final: z.coerce.boolean().optional(),
  })

export type GetProgramPlansWithStatusQuery = z.infer<
  typeof GetProgramPlansWithStatusQuerySchema
>
