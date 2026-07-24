import { z } from "zod"
import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"

// POST /bmhp-approval/revisions/notify
export const NotifyRevisionBodySchema = z.object({
  program_plan_id: z.number().int().positive(),
  puskesmas_entity_id: z.number().int().positive(),
  message: z.string().min(1),
})
export type NotifyRevisionBody = z.infer<typeof NotifyRevisionBodySchema>

// GET /bmhp-approval/revisions
export const ListRevisionQuerySchema = PaginationQueriesSchema.extend({
  program_plan_id: z.coerce.number().int().positive().optional(),
  puskesmas_id: z.coerce.number().int().positive().optional(),
})
export type ListRevisionQuery = z.infer<typeof ListRevisionQuerySchema>
