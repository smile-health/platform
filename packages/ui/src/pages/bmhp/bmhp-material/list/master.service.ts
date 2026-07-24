import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

export type GetBmhpMaterialListParams = {
  keyword?: string
  is_reagen?: number
  is_active?: number
  page?: number
  paginate?: number
  sort_by?: string
  sort_type?: string
  year_id?: number
  program_plan_id?: number
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
  is_reagen: number
  description: string
  is_active: number
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
  created_by: number
  updated_by: number
  user_updated_by: {
    firstname: string
    lastname: string
  } | null
  user_created_by: {
    firstname: string
    lastname: string
  } | null
  deleted_by: Date | null
}

const SERVICE = SERVICE_API

const baseUrl = 'main/'

export const listBmhpMaterial = async (params: GetBmhpMaterialListParams) => {
  const apiUrl = `${baseUrl}bmhp-planning-materials`

  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetBmhpMaterialListResponse>(response)
}

export const loadBmhpMaterialOptions = async (year_id: number) => {
  const response = await listBmhpMaterial({
    paginate: 100,
    program_plan_id: year_id,
  })
  return response.data.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}

export const deleteBmhpMaterial = async (id: number) => {
  const apiUrl = `${baseUrl}bmhp-planning-materials/${id}`

  const response = await axios.delete(apiUrl)
  return handleAxiosResponse<void>(response)
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
