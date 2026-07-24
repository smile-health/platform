import { IdParamsSchema } from "@smile-health/lib/types/param.js"
import z from "zod"
import { toMysqlDatetime } from "@/common/utils/date.utils.js"

export const GetActivityMaterialParamSchema = z.object({
  activity_id: z.string().transform(Number).pipe(z.number().int().positive()),
})


export const GetActivityDetailParamSchema = z.object({
  activity_id: z.string().transform(Number).pipe(z.number().int().positive()),
})

export const GetActivityDetailQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  entity_tag_ids: z.string().optional(),
  information_type: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(0).max(1))
    .default("0"),
  transaction_type: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional(),
  material_level_id: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional(),
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1))
    .default("1"),
  paginate: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1))
    .default("10"),
  search: z.string().optional(),
})

/**
 * Get Entities Schema
 */
export const GetEntitiesSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default("1"),
  per_page: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default("20"),
  search: z.string().optional(),
  province_id: z.string().optional().nullable(),
  regency_id: z.string().optional().nullable(),
  sub_district_id: z.string().optional().nullable(),
})

/**
 * Get Activities Schema
 */
export const GetActivitiesSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default("1"),
  per_page: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default("20"),
  search: z.string().optional(),
})

/**
 * Get Analysis Parameter by ID Schema (for :id/methods endpoint)
 */
export const GetAnalysisParameterByIdSchema = IdParamsSchema

/**
 * Get Analysis Parameters Query Schema (with optional filter)
 */
export const GetAnalysisParametersQuerySchema = z.object({
  parameter_category_id: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .optional(),
})

/**
 * Get Parameter Categories Query Schema
 */
export const GetParameterCategoriesQuerySchema = z.object({
  activity_id: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .optional(),
})

/**
 * Parameter Type Item Schema
 */
const ParameterTypeItemSchema = z.object({
  id: z.number().positive().optional(),
  key: z.string(),
  label: z.string().optional(),
  value: z.any().nullable(),
})

/**
 * Create Environmental Test Schema
 */
export const CreateEnvironmentalTestSchema = z
  .object({
    entity_id: z.union([
      z.number().int().positive(),
      z.record(z.string(), z.number().int().positive()),
    ]),
    is_distribution: z.number().int().min(0).max(1).default(0),
    parameter_category_id: z.number().positive(),
    parameter_category_items: z.array(ParameterTypeItemSchema),
    activity_id: z.number().positive().optional(),
    inventory_ids: z.array(z.number().positive()).optional(),
    management_asset_id: z.number().positive().optional(),
    sample_id: z.string().min(1),
    received_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    lab_result_status: z.enum(["pending", "completed"]),
    test_start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    test_end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    sample_collected_by: z.enum(["customer", "lab"]).optional(),
    location: z.string().optional(),
    collection_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    has_ikl: z.boolean().optional(),
    ikl_test_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable(),
    ikl_score: z.number().optional().nullable(),
    examination_entity_id: z.number().int().positive().nullable().optional(),
    test_results: z
      .array(
        z.object({
          analysis_parameter_id: z.number().positive().optional(),
          parameter_name: z.string().min(1),
          quality_standard: z.string().optional(),
          unit: z.string().optional(),
          test_methods_id: z.number().positive(),
          result_value: z.string().optional(),
          is_custom: z.boolean().default(false),
        })
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.lab_result_status === "completed"
        ? data.test_results && data.test_results.length > 0
        : true,
    {
      message: "test_results is required when lab_result_status is completed",
    }
  )
  .refine(
    (data) => {
      if (data.has_ikl) {
        return (
          !!data.ikl_test_date &&
          data.ikl_score !== undefined &&
          data.ikl_score !== null
        )
      }
      return true
    },
    {
      message: "ikl_test_date and ikl_score are required when has_ikl is true",
    }
  )
  .refine(
    (data) => {
      if (
        data.is_distribution === 0 &&
        data.lab_result_status === "completed"
      ) {
        return (
          data.examination_entity_id !== undefined &&
          data.examination_entity_id !== null
        )
      }
      return true
    },
    {
      message:
        "examination_entity_id is required when is_distribution is 0 and lab_result_status is completed",
      path: ["examination_entity_id"],
    }
  )

export const GetHistorySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default("1"),
  per_page: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default("10"),
  search: z.string().optional(),
  entity_id: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .optional(),
  start_date: z.string().optional().transform(toMysqlDatetime),
  end_date: z.string().optional().transform(toMysqlDatetime),
  status: z.enum(["completed", "pending"]).optional(),
})

export const GetAssetInventoriesQuerySchema = z.object({
  search: z.string().optional(),
})

export const GetManagementAssetsQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default("1"),
  per_page: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default("20"),
  search: z.string().optional(),
})

export const UpdateEnvironmentalTestParamSchema = IdParamsSchema

export const UpdateEnvironmentalTestSchema = z
  .object({
    entity_id: z.number().positive().optional(),
    parameter_category_id: z.number().positive().optional(),
    parameter_category_items: z.array(ParameterTypeItemSchema).optional(),
    activity_id: z.number().positive().optional(),
    inventory_ids: z.array(z.number().positive()).optional(),
    management_asset_id: z.number().positive().optional(),
    sample_id: z.string().min(1).optional(),
    received_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    lab_result_status: z.enum(["pending", "completed"]).optional(),
    test_start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    test_end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    sample_collected_by: z.enum(["customer", "lab"]).nullable().optional(),
    location: z.string().nullable().optional(),
    collection_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    has_ikl: z.boolean().optional(),
    ikl_test_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    ikl_score: z.number().nullable().optional(),
    examination_entity_id: z.number().int().positive().nullable().optional(),
    test_results: z
      .array(
        z.object({
          id: z.number().positive().optional(),
          analysis_parameter_id: z.number().positive().optional(),
          parameter_name: z.string().min(1),
          quality_standard: z.string().optional(),
          unit: z.string().optional(),
          test_methods_id: z.number().positive(),
          result_value: z.string().optional(),
          is_custom: z.boolean().default(false),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.has_ikl) {
        return (
          !!data.ikl_test_date &&
          data.ikl_score !== undefined &&
          data.ikl_score !== null
        )
      }
      return true
    },
    {
      message: "ikl_test_date and ikl_score are required when has_ikl is true",
    }
  )

/**
 * Export Types
 */
export type ParameterValue = string | number | boolean | null

export type TestResultItem = {
  analysis_parameter_id?: number
  parameter_name: string
  quality_standard?: string
  unit?: string
  test_methods_id: number
  result_value?: string
  is_custom: boolean
}

export type GetEntitiesInput = z.infer<typeof GetEntitiesSchema>
export type GetAnalysisParameterByIdInput = z.infer<
  typeof GetAnalysisParameterByIdSchema
>
export type GetAnalysisParametersQueryInput = z.infer<
  typeof GetAnalysisParametersQuerySchema
>
export type CreateEnvironmentalTestInput = z.infer<
  typeof CreateEnvironmentalTestSchema
>

export type GetHistoryInput = z.infer<typeof GetHistorySchema>
export type UpdateEnvironmentalTestInput = z.infer<
  typeof UpdateEnvironmentalTestSchema
>
export type GetActivitiesInput = z.infer<typeof GetActivitiesSchema>
export type GetParameterCategoriesQueryInput = z.infer<
  typeof GetParameterCategoriesQuerySchema
>


export type GetAssetInventoriesQueryInput = z.infer<
  typeof GetAssetInventoriesQuerySchema
>

export type GetManagementAssetsQueryInput = z.infer<
  typeof GetManagementAssetsQuerySchema
>

/**
 * Get Distribution Details Param Schema
 */
export const GetDistributionDetailsParamSchema = IdParamsSchema

export type GetDistributionDetailsParamInput = z.infer<
  typeof GetDistributionDetailsParamSchema
>

/**
 * Create Unit Schema
 */
export const CreateUnitSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(255, "Name must not exceed 255 characters"),
})

export type CreateUnitInput = z.infer<typeof CreateUnitSchema>

/**
 * Get Document Param Schema (for /tests/:id/document endpoint)
 */
export const GetDocumentParamSchema = IdParamsSchema

/**
 * Get Document Query Schema (for /tests/:id/document endpoint)
 */
export const GetDocumentQuerySchema = z.object({
  type: z.enum(["word", "pdf"]).default("word"),
})

export type GetDocumentParamInput = z.infer<typeof GetDocumentParamSchema>
export type GetDocumentQueryInput = z.infer<typeof GetDocumentQuerySchema>

