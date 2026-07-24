import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

export type GetBmhpPemeriksaanDetailParams = {
  id: number | string
}

export type GetBmhpPemeriksaanDetailResponse = {
  id: number
  name: string
  description: string
  is_active: number
  examination_type_id: number
  examination_type_name?: string
  parameters?: Array<{ id: number; name: string }>
  methods?: Array<{ id: number; name: string }>
  target_groups?: Array<{ id: number; name: string }>
  materials?: Array<{
    material_id: number
    material_name?: string
    target_group_ids: number[]
  }>
  created_at: Date
  updated_at: Date
  deleted_at: null
  created_by?: string | number
  updated_by?: string | number
  deleted_by: null
}

const baseUrl = 'main/'

export const getBmhpPemeriksaanDetail = async (id: number | string) => {
  const apiUrl = `${baseUrl}bmhp-examinations/${id}`

  const response = await axios.get(apiUrl)

  return handleAxiosResponse<GetBmhpPemeriksaanDetailResponse>(response)
}
