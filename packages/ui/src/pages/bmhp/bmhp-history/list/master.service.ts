import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { downloadBase64 } from '#utils/download'

export type GetBmhpHistoryTypeListParams = {
  search?: string
  page?: number
  paginate?: number
  sort_by?: string
  sort_type?: string
  year?: number
  examination_id?: number
  status?: string
  province_id?: number
  regency_id?: number
  puskesmas_id?: number
}

export type GetBmhpHistoryTypeListResponse = {
  data: TBmhpHistoryTypeData[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
}

export type TBmhpHistoryTypeData = {
  id: number
  entity_id: number
  entity_name: string
  entity_address: string
  year: number
  examination_id: number
  examination_name: string
  status: string
  submitted_at: null
  approved_at: null
  created_at: Date
  user_updated_by: {
    firstname: string
    lastname: string
  }
  updated_at: Date
  target_group_count: number
}

const baseUrl = 'main/'

/**
 * Get list bmhp history type
 */

export const listBmhpHistoryType = async (
  params: GetBmhpHistoryTypeListParams
) => {
  const apiUrl = `${baseUrl}bmhp-histories`

  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetBmhpHistoryTypeListResponse>(response)
}

/**
 * Delete bmhp history type
 */

export const deleteBmhpHistoryType = async (id: number) => {
  const apiUrl = `${baseUrl}bmhp-histories/${id}`

  const response = await axios.delete(apiUrl)
  return handleAxiosResponse<void>(response)
}

/**
 * Export bmhp history type
 */
export async function exportBmhpHistoryType(
  params: GetBmhpHistoryTypeListParams
) {
  const response = await axios.get(`${baseUrl}bmhp-histories/xls`, {
    responseType: 'json',
    cleanParams: true,
    params,
  })

  const { filename, base64, mimeType } = response.data
  downloadBase64(base64, filename, mimeType)

  return response?.data
}
