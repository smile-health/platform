// API Response Types
export type MasterJenisPemeriksaan = {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export type MasterJenisPemeriksaanListResponse = {
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  list_pagination: number[]
  data: MasterJenisPemeriksaan[]
}

export type MasterJenisPemeriksaanDetailResponse = {
  data: MasterJenisPemeriksaan
}

// Filter Types
export type MasterJenisPemeriksaanFilterQuery = {
  name?: string
  page?: number
  paginate?: number
}
