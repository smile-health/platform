import { z } from "zod"

export const EntityTagsQueryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  item_per_page: z.coerce.number().int().min(1).max(100).default(100),
})

export type EntityTagsQueryParams = z.infer<typeof EntityTagsQueryParamsSchema>

// DTO from ClickHouse
export interface EntityTagDTO {
  id: number
  title: string | null
}

// Response item
export interface EntityTagItem {
  id: number
  title: string
}

// Response schema
export interface EntityTagsResponse {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: EntityTagItem[]
}
