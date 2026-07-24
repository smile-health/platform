import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

export type GetBmhpHistoryDetailParams = {
  id: number | string
}

export interface GetBmhpHistoryDetailResponse {
  id: number
  entity: GetBmhpHistoryDetailEntity
  year: number
  status: string
  submitted_at: null
  approved_at: null
  created_at: Date
  updated_at: Date
  updated_by?: string
  examination_name: string
  examination_type: string
  examination_method: string
  summary: GetBmhpHistoryDetailSummary
  targets: GetBmhpHistoryDetailTarget[]
}

export interface GetBmhpHistoryDetailEntity {
  id: number
  name: string
  address: string
}

export interface GetBmhpHistoryDetailSummary {
  total_sample: number
  total_test: number
  target_count: number
  material_count: number
}

export interface GetBmhpHistoryDetailTarget {
  id: number
  target_name: string
  sample_count: number
  test_count: number
  materials: GetBmhpHistoryDetailMaterial[]
}

export interface GetBmhpHistoryDetailMaterial {
  id: number
  tag: string
  material_name: string
  history_previous_year: number
  product_template: string
  product_variant: string
  unit: number
  estimated_need: number
  estimated_unit: string
}

const baseUrl = 'main/'

export const GetBmhpHistoryDetail = async (id: number | string) => {
  const apiUrl = `${baseUrl}bmhp-histories/${id}`

  const response = await axios.get(apiUrl)

  return handleAxiosResponse<GetBmhpHistoryDetailResponse>(response.data)
}
