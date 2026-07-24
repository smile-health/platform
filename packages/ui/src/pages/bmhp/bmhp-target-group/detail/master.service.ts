import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

export type GetBmhpMaterialDetailParams = {
  id: number | string
}

export type GetBmhpMaterialDetailResponse = {
  id: number
  code: string
  name: string
  age_range: null
  description: string
  is_active: number
  created_at: Date
  updated_at: Date
  deleted_at: null
  created_by: number
  updated_by: number
  deleted_by: null
  examinations: Examination[]
  statusCode: number
}

export interface Examination {
  relation_id: number
  id: number
  examination_type_id: number
  name: string
  description: string
  is_active: number
  created_at: Date
}

const baseUrl = 'main/'

export const getBmhpMaterialDetail = async (id: number | string) => {
  const apiUrl = `${baseUrl}bmhp-target-groups/${id}`

  const response = await axios.get(apiUrl)

  return handleAxiosResponse<GetBmhpMaterialDetailResponse>(response)
}
