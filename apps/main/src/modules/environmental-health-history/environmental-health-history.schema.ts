import z from "zod"
import { PaginationQueriesSchema } from "@smile-health/lib/types/paginate.js"
import { IdParamsSchema } from "@smile-health/lib/types/param.js"

export const GetHistoryListQuerySchema = PaginationQueriesSchema.extend({
  keyword: z.string().optional(),
  entity_id: z.coerce.number().positive().optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .optional(),
  status: z.enum(["completed", "pending"]).optional(),
  parameter_category_id: z.coerce.number().positive().optional(),
  sample_collected_by: z.enum(["lab", "customer"]).optional(),
  has_ikl: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .optional(),
  sort_by: z
    .enum([
      "created_at",
      "entity_name",
      "sample_id",
      "lab_result_status",
      "received_date",
    ])
    .optional(),
  sort_type: z.enum(["asc", "desc"]).optional(),
  province_id: z.coerce.number().positive().optional(),
  regency_id: z.coerce.number().positive().optional(),
  health_center_id: z.coerce.number().positive().optional(),
})

export const GetHistoryParamSchema = IdParamsSchema
export const DeleteHistoryParamSchema = IdParamsSchema
export const ExportPdfHistoryParamSchema = IdParamsSchema

export type GetHistoryListQuery = z.infer<typeof GetHistoryListQuerySchema>
