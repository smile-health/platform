export type MasterParameter = {
  id: number
  name: string
  unit: string | null
  description: string
  created_at: string
  updated_at: string
}

export type MasterParameterListResponse = {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: MasterParameter[]
}

export type MasterParameterFilterQuery = {
  name?: string
  page?: number
  paginate?: number
}
