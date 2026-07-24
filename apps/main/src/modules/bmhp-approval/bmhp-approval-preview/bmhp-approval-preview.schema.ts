import { z } from "zod"
import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"

export const GetPreviewQuerySchema = PaginationQueriesSchema.extend({
  program_plan_id: z.coerce.number().int().positive(),
  entity_id: z.coerce.number().int().positive(),
  examination_id: z.coerce.number().int().positive().optional(),
})

export type GetPreviewQuery = z.infer<typeof GetPreviewQuerySchema>
