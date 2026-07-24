import { PaginationQueriesSchema } from "@smile/lib/types/paginate"
import { z } from "zod"

export type MaterialTypeRequest = z.infer<typeof PaginationQueriesSchema>
