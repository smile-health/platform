import z from "zod"
import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { IdParamsSchema } from "@smile/lib/types/param.js"

export const GetAnalysisParameterListQuerySchema =
  PaginationQueriesSchema.extend({
    keyword: z.string().optional(),
    sort_by: z.enum(["name", "unit", "created_at", "updated_at"]).optional(),
    sort_type: z.enum(["asc", "desc"]).optional(),
  })

export const GetAnalysisParameterParamSchema = IdParamsSchema
export const UpdateAnalysisParameterParamSchema = IdParamsSchema
export const DeleteAnalysisParameterParamSchema = IdParamsSchema

export const CreateAnalysisParameterRequestSchema = z.object({
  name: z.string().min(1, "Nama parameter wajib diisi").max(255),
  unit_id: z.number().positive("Satuan wajib diisi"),
})

export const UpdateAnalysisParameterRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  unit_id: z.number().positive().optional().nullable(),
})

export type GetAnalysisParameterListQuery = z.infer<
  typeof GetAnalysisParameterListQuerySchema
>
export type CreateAnalysisParameterRequest = z.infer<
  typeof CreateAnalysisParameterRequestSchema
>
export type UpdateAnalysisParameterRequest = z.infer<
  typeof UpdateAnalysisParameterRequestSchema
>
