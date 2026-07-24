import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

export type GetBmhpMaterialListParams = {
  keyword?: string
  page?: number
  paginate?: number
  sort_by?: string
  sort_type?: string
}

export type GetBmhpMaterialListResponse = {
  data: TBmhpMaterialData[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
}

export type TBmhpMaterialData = {
  id: number
  name: string
  is_reagen: boolean
  description: string
  is_active: boolean
  created_at: Date
  updated_at: Date | null
  deleted_at: Date | null
  created_by: number
  updated_by: number | null
  deleted_by: number | null
}

const SERVICE = SERVICE_API

export const listBmhpMaterial = async (params: GetBmhpMaterialListParams) => {
  const apiUrl = `https://mock.apidog.com/m1/1120864-1112040-default/bmhp/bmhp-materials`
  //   const apiUrl = `${SERVICE.CORE}/coldstorage`
  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetBmhpMaterialListResponse>(response)
}

export async function exportBmhpMaterial(params: GetBmhpMaterialListParams) {
  const response = await axios.get(`${SERVICE.CORE}/coldstorage/xls`, {
    responseType: 'blob',
    cleanParams: true,
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
