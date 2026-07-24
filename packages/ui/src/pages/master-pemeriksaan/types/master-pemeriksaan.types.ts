// API Response Types
export type MasterPemeriksaan = {
  id: number
  examination_type_id: number
  examination_type_name: string
  name: string
  description: string
  // API returns arrays of objects, not just IDs
  parameters?: Array<{
    id: number
    name: string
    unit?: string
    sort_order?: number
  }>
  methods?: Array<{
    id: number
    name: string
    description?: string
  }>
  target_groups?: Array<{
    id: number
    name: string
    code?: string
    age_range?: string
  }>
  // Legacy fields (kept for backward compatibility)
  parameter_ids?: number[]
  metode_ids?: number[]
  materials?: Array<{
    template_id: number
    sasaran_ids: number[]
  }>
  is_active: number
  created_at: string
  updated_at: string
}

export type MasterPemeriksaanListResponse = {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: MasterPemeriksaan[]
}

export type MasterPemeriksaanDetailResponse = {
  data: MasterPemeriksaan
}

// Filter Types
export type MasterPemeriksaanFilterQuery = {
  name?: string
  examination_type_id?: number | number[]
  page?: number
  paginate?: number
}
