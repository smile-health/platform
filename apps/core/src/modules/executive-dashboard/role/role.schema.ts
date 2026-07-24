import { PaginationQueriesSchema } from "@smile/lib/types/paginate"
import { z } from "zod"

export type RoleRequest = z.infer<typeof PaginationQueriesSchema>
