import { z } from "zod"
import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"

export const GetWorkspacesParamsSchema = PaginationQueriesSchema.extend({
  is_material_hierarchy_enabled: z.preprocess((value) => {
    if (!value) return
    if (typeof value === "string") return parseInt(value, 10)
  }, z.number().min(0).max(1).int().nullish()),
  sort_by: z.string().nullish().optional(),
  sort_type: z.string().nullish().optional(),
})

export const CreateUserWorkspaceSchema = z.object({
  user_id: z.number().int(),
  workspace_id: z.number().int(),
})

export type GetWorkspacesParams = z.infer<typeof GetWorkspacesParamsSchema>
export type CreateUserWorkspaceRequest = z.infer<
  typeof CreateUserWorkspaceSchema
>
