import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

export type GetBmhpVariantDetailParams = {
  id: number | string
}

export type GetBmhpVariantDetailResponse = {
  id: number
  material_id: number
  material_name: string
  is_variant: number
  brand_name: string
  variants: Array<{
    material_variant_id?: number
    material_id?: number
    name: string
    test_qty: number
    unit_id: number
    unit_name?: string
  }>
  created_at: Date
  updated_at: Date
  deleted_at: null
  created_by: number
  updated_by?: string | number
  deleted_by: null
}

const baseUrl = 'main/'

export const getBmhpVariantDetail = async (id: number | string) => {
  const apiUrl = `${baseUrl}bmhp-planning-materials/variant/${id}`

  const response = await axios.get(apiUrl)

  return handleAxiosResponse<GetBmhpVariantDetailResponse>(response)
}
