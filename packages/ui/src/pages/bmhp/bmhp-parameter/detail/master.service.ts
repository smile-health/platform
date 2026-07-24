import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

export type GetBmhpParameterDetailParams = {
  id: number | string
}

export type GetBmhpParameterDetailResponse = {
  id: number
  name: string
  unit: string
  description: string
  created_at: Date
  updated_at: Date
  deleted_at: null
  created_by?: string | number
  updated_by?: string | number
  deleted_by: null
}

const baseUrl = 'main/'

export const getBmhpParameterDetail = async (id: number | string) => {
  const apiUrl = `${baseUrl}bmhp-parameters/${id}`

  const response = await axios.get(apiUrl)

  return handleAxiosResponse<GetBmhpParameterDetailResponse>(response)
}
