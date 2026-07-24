import { z } from "zod"
import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"

export const GetMaterialNeedsQuerySchema = PaginationQueriesSchema.extend({
  program_plan_id: z.coerce.number().int().positive(),
  regency_id: z.coerce.number().int().positive().optional(),
  entity_id: z.coerce.number().int().positive().optional(),
  examination_id: z.coerce.number().int().positive().optional(),
  material_id: z.coerce.number().int().positive().optional(),
})

export type GetMaterialNeedsQuery = z.infer<typeof GetMaterialNeedsQuerySchema>

export const CalculateMaterialNeedsBodySchema = z.object({
  approval_period_id: z.number().int().positive(),
})

export type CalculateMaterialNeedsBody = z.infer<
  typeof CalculateMaterialNeedsBodySchema
>
