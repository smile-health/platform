// API Response Types
export type MasterMethod = {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export type MasterMethodListResponse = {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: MasterMethod[]
}

export type MasterMethodDetailResponse = {
  data: MasterMethod
}

// Filter Types
export type MasterMethodFilterQuery = {
  name?: string
  page?: number
  paginate?: number
}
