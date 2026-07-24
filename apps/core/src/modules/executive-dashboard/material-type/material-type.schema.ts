import { PaginationQueriesSchema } from "@smile-health/lib/types/paginate"
import { z } from "zod"

export type MaterialTypeRequest = z.infer<typeof PaginationQueriesSchema>
