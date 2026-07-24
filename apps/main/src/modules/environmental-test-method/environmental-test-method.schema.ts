import z from "zod"
import { PaginationQueriesSchema } from "@smile-health/lib/types/paginate.js"
import { IdParamsSchema } from "@smile-health/lib/types/param.js"

export const GetEnvironmentalTestMethodListQuerySchema =
  PaginationQueriesSchema.extend({
    keyword: z.string().optional(),
    sort_by: z.enum(["name", "created_at", "updated_at"]).optional(),
    sort_type: z.enum(["asc", "desc"]).optional(),
  })

export const GetEnvironmentalTestMethodParamSchema = IdParamsSchema
export const UpdateEnvironmentalTestMethodParamSchema = IdParamsSchema
export const DeleteEnvironmentalTestMethodParamSchema = IdParamsSchema

// Validation schema for parameter validation rules
export const ValidationRuleSchema = z
  .object({
    result_format_type: z.enum(["number", "text"]),
    validation_type: z.enum(["range", "comparison", "options", "none"]),
    // For range type
    min_value: z.number().optional().nullable(),
    max_value: z.number().optional().nullable(),
    // For comparison type
    comparison_operator: z
      .enum(["<", "<=", ">", ">=", "=", "!="])
      .optional()
      .nullable(),
    comparison_value: z.number().optional().nullable(),
    // Additional config
    allow_decimal: z.boolean().optional().default(false),
    // For options type (text)
    options: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // If validation_type is 'options', options array is required
      if (data.validation_type === "options") {
        return data.options && data.options.length > 0
      }
      return true
    },
    {
      message: "Options array is required when validation_type is 'options'",
      path: ["options"],
    }
  )

export const CreateEnvironmentalTestMethodRequestSchema = z.object({
  name: z.string().min(1, "Nama metode pengujian wajib diisi").max(255),
  deskripsi: z.string().max(255).optional().nullable(),
  quality_standard: z.string().max(255).optional().nullable(),
  validation: ValidationRuleSchema.optional().nullable(),
})

export const UpdateEnvironmentalTestMethodRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  deskripsi: z.string().max(255).optional().nullable(),
  quality_standard: z.string().max(255).optional().nullable(),
  validation: ValidationRuleSchema.optional().nullable(),
})

export type GetEnvironmentalTestMethodListQuery = z.infer<
  typeof GetEnvironmentalTestMethodListQuerySchema
>
export type CreateEnvironmentalTestMethodRequest = z.infer<
  typeof CreateEnvironmentalTestMethodRequestSchema
>
export type UpdateEnvironmentalTestMethodRequest = z.infer<
  typeof UpdateEnvironmentalTestMethodRequestSchema
>
export type ValidationRule = z.infer<typeof ValidationRuleSchema>
