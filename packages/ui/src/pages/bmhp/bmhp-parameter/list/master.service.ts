import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

export type GetBmhpParameterListParams = {
  keyword?: string
  page?: number
  paginate?: number
  sort_by?: string
  sort_type?: string
  year_id?: number
  program_plan_id?: number
}

export type GetBmhpParameterListResponse = {
  data: TBmhpParameterData[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
}

export type TBmhpParameterData = {
  id: number
  name: string
  unit: string
  description: string
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

export const listBmhpParameter = async (params: GetBmhpParameterListParams) => {
  const apiUrl = `${baseUrl}bmhp-parameters`

  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetBmhpParameterListResponse>(response)
}

export const loadBmhpParameterOptions = async (program_plan_id: number) => {
  const response = await listBmhpParameter({
    paginate: 100,
    program_plan_id,
  })
  return response.data.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}

export const deleteBmhpParameter = async (id: number) => {
  const apiUrl = `${baseUrl}bmhp-parameters/${id}`

  const response = await axios.delete(apiUrl)
  return handleAxiosResponse<void>(response)
}

export async function exportBmhpParameter(params: GetBmhpParameterListParams) {
  const response = await axios.get(`${SERVICE.CORE}/bmhp-parameters/xls`, {
    responseType: 'blob',
    cleanParams: true,
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
