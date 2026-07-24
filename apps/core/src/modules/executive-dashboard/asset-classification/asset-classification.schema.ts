import { PaginationQueriesSchema } from "@smile/lib/types/paginate"
import { z } from "zod"

export type AssetClassificationRequest = z.infer<typeof PaginationQueriesSchema>
