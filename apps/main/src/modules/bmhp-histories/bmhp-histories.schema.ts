import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { z } from "zod"

export const GetBmhpHistoryQueriesSchema = PaginationQueriesSchema.extend({
  search: z.string().optional(),
  year: z.coerce.number().int().positive().optional(),
  examination_id: z.coerce.number().int().positive().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]).optional(),
  province_id: z.coerce.number().int().positive().optional(),
  regency_id: z.coerce.number().int().positive().optional(),
  sub_district_id: z.coerce.number().int().positive().optional(),
  puskesmas_id: z.coerce.number().int().positive().optional(),
  sort_by: z
    .enum(["year", "examination_name", "status", "created_at", "updated_at"])
    .optional(),
  sort_type: z.enum(["asc", "desc"]).optional(),
})

export type GetBmhpHistoryQueries = z.infer<typeof GetBmhpHistoryQueriesSchema>
