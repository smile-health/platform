import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

export type GetBmhpMethodDetailParams = {
  id: number | string
}

export type GetBmhpMethodDetailResponse = {
  id: number
  name: string
  description: string
  created_at: Date
  updated_at: Date
  deleted_at: null
  created_by?: string | number
  updated_by?: string | number
  deleted_by: null
}

const baseUrl = 'main/'

export const getBmhpMethodDetail = async (id: number | string) => {
  const apiUrl = `${baseUrl}bmhp-examination-methods/${id}`

  const response = await axios.get(apiUrl)

  return handleAxiosResponse<GetBmhpMethodDetailResponse>(response)
}
