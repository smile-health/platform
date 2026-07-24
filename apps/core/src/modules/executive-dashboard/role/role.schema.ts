import { PaginationQueriesSchema } from "@smile-health/lib/types/paginate"
import { z } from "zod"

export type RoleRequest = z.infer<typeof PaginationQueriesSchema>
