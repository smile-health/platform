import { PaginationQueriesSchema } from "@smile-health/lib/types/paginate"
import { z } from "zod"

export type AssetClassificationRequest = z.infer<typeof PaginationQueriesSchema>
