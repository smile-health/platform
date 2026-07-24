import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

export type GetColdStorageCapacityListParams = {
  page?: number
  paginate?: number
  capacities_status?: string
  entity_tag_id?: string
  health_facility_id?: string
  province_id?: string
  regency_id?: string
  sort_by?: string
  sort_type?: string
}

export type GetColdStorageCapacityListResponse = {
  data: TColdStorageCapacityData[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
}

export type TColdStorageCapacityData = {
  id: number
  name: string
  percentage_capacity: number
  total_volume: number
  volume_asset: number
  created_at: string
  created_by: number
  updated_at: string
  updated_by: number
}

const SERVICE = SERVICE_API

export const listColdStorageCapacity = async (
  params: GetColdStorageCapacityListParams
) => {
  const apiUrl = `${SERVICE.CORE}/coldstorage`
  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetColdStorageCapacityListResponse>(response)
}

export async function exportColdStorageCapacity(
  params: GetColdStorageCapacityListParams
) {
  const response = await axios.get(`${SERVICE.CORE}/coldstorage/xls`, {
    responseType: 'blob',
    cleanParams: true,
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
