import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

export type GetBmhpMethodListParams = {
  keyword?: string
  page?: number
  paginate?: number
  sort_by?: string
  sort_type?: string
  year_id?: number
  program_plan_id?: number
}

export type GetBmhpMethodListResponse = {
  data: TBmhpMethodData[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
}

export type TBmhpMethodData = {
  id: number
  name: string
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

const baseUrl = 'main/'

export const listBmhpMethod = async (params: GetBmhpMethodListParams) => {
  const apiUrl = `${baseUrl}bmhp-examination-methods`

  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetBmhpMethodListResponse>(response)
}

export const loadBmhpMethodOptions = async (program_plan_id: number) => {
  const response = await listBmhpMethod({
    paginate: 100,
    program_plan_id,
  })
  return response.data.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}

export const deleteBmhpMethod = async (id: number) => {
  const apiUrl = `${baseUrl}bmhp-examination-methods/${id}`

  const response = await axios.delete(apiUrl)
  return handleAxiosResponse<void>(response)
}
