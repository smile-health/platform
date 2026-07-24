import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

export type GetBmhpMaterialDetailParams = {
  id: number | string
}

export type BmhpMaterialDetailItem = {
  id: number
  material_id: number
  name: string
  is_variant: number
  created_at: string
}

export type BmhpMaterialVariantDetailItem = {
  material_variant_id: number
  material_id: number
  name: string
  test_qty: number
  unit_id: number
  unit_name: string
}

export type GetBmhpMaterialDetailResponse = {
  id: number
  name: string
  is_reagen?: number
  description: string
  is_active?: number
  created_at: Date
  updated_at: Date
  deleted_at: null
  created_by?: string | number
  updated_by?: string | number
  deleted_by: null
  material_details?: BmhpMaterialDetailItem[]
  material_variant_details?: BmhpMaterialVariantDetailItem[]
  bmhp_material_id?: number
  material_id?: number
  material_level_id?: number
}

const baseUrl = 'main/'

export const getBmhpMaterialDetail = async (id: number | string) => {
  const apiUrl = `${baseUrl}bmhp-planning-materials/${id}`

  const response = await axios.get(apiUrl)

  return handleAxiosResponse<GetBmhpMaterialDetailResponse>(response)
}
