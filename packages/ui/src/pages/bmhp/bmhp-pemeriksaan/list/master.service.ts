import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

export type GetBmhpPemeriksaanListParams = {
  keyword?: string
  is_active?: number
  page?: number
  paginate?: number
  sort_by?: string
  sort_type?: string
  year_id?: number
  program_plan_id?: number
}

export type GetBmhpPemeriksaanListResponse = {
  data: TBmhpPemeriksaanData[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
}

export type TBmhpPemeriksaanData = {
  id: number
  name: string
  description: string
  is_active: number
  examination_type_id: number
  examination_type_name?: string
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

export const listBmhpPemeriksaan = async (
  params: GetBmhpPemeriksaanListParams
) => {
  const apiUrl = `${baseUrl}bmhp-examinations`

  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetBmhpPemeriksaanListResponse>(response)
}

export const loadBmhpPemeriksaanOptions = async () => {
  const response = await listBmhpPemeriksaan({
    paginate: 100,
  })
  return response.data.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}

export const deleteBmhpPemeriksaan = async (id: number) => {
  const apiUrl = `${baseUrl}bmhp-examinations/${id}`

  const response = await axios.delete(apiUrl)
  return handleAxiosResponse<void>(response)
}
