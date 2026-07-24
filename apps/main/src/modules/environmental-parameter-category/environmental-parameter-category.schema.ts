import z from "zod"
import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { IdParamsSchema } from "@smile/lib/types/param.js"

export const GetParameterCategoryListQuerySchema =
  PaginationQueriesSchema.extend({
    keyword: z.string().optional(),
    sort_by: z.enum(["name", "created_at", "updated_at"]).optional(),
    sort_type: z.enum(["asc", "desc"]).optional(),
  })

export const GetParameterCategoryParamSchema = IdParamsSchema
export const UpdateParameterCategoryParamSchema = IdParamsSchema
export const DeleteParameterCategoryParamSchema = IdParamsSchema
export const UpdateParameterCategoryStatusParamSchema = IdParamsSchema

export const UpdateParameterCategoryStatusRequestSchema = z.object({
  status: z
    .union([z.literal(0), z.literal(1)])
    .describe("0 = non-aktif, 1 = aktif"),
})

export type UpdateParameterCategoryStatusRequest = z.infer<
  typeof UpdateParameterCategoryStatusRequestSchema
>

// Schema untuk field
export const ParameterCategoryFieldSchema = z.object({
  key: z.string().max(100).optional(),
  type_data: z.string().min(1, "Type data wajib diisi").max(100),
  label: z.string().min(1, "Label wajib diisi").max(100),
  hint: z.string().max(100).nullable().optional(),
  mandatory: z.number().int(),
  options: z.string().optional().nullable(),
})

// Schema untuk response field (include id)
export const ParameterCategoryFieldResponseSchema =
  ParameterCategoryFieldSchema.extend({
    id: z.number().int(),
  })

export const CreateParameterCategoryRequestSchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(100),
  analysis_parameters: z
    .array(
      z.object({
        env_analysis_parameter_id: z.number().int().positive(),
        env_test_method_ids: z.array(z.number().int().positive()),
      })
    )
    .min(1, "analysis_parameters cannot be empty"),
  fields: z.array(ParameterCategoryFieldSchema).optional(),
})

export const UpdateParameterCategoryRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  analysis_parameters: z
    .array(
      z.object({
        id: z.number().int().optional(),
        env_analysis_parameter_id: z.number().int().positive(),
        env_test_method_ids: z.array(z.number().int().positive()),
        _delete: z.boolean().optional(),
      })
    )
    .min(1, "analysis_parameters cannot be empty")
    .optional(),
  fields: z.array(ParameterCategoryFieldSchema).optional(),
})

export type GetParameterCategoryListQuery = z.infer<
  typeof GetParameterCategoryListQuerySchema
>
export type CreateParameterCategoryRequest = z.infer<
  typeof CreateParameterCategoryRequestSchema
>
export type UpdateParameterCategoryRequest = z.infer<
  typeof UpdateParameterCategoryRequestSchema
>
export type ParameterCategoryField = z.infer<
  typeof ParameterCategoryFieldSchema
>
export type ParameterCategoryFieldResponse = z.infer<
  typeof ParameterCategoryFieldResponseSchema
>
