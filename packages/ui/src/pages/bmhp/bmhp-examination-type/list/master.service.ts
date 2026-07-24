import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

export type GetBmhpExaminationTypeListParams = {
  keyword?: string
  page?: number
  paginate?: number
  sort_by?: string
  sort_type?: string
  year_id?: number
  program_plan_id?: number
}

export type GetBmhpExaminationTypeListResponse = {
  data: TBmhpExaminationTypeData[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
}

export type TBmhpExaminationTypeData = {
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

const SERVICE = SERVICE_API

const baseUrl = 'main/'

export const listBmhpExaminationType = async (
  params: GetBmhpExaminationTypeListParams
) => {
  const apiUrl = `${baseUrl}bmhp-examinations/types`

  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetBmhpExaminationTypeListResponse>(response)
}

export const loadBmhpExaminationTypeOptions = async (
  program_plan_id: number
) => {
  const response = await listBmhpExaminationType({
    paginate: 100,
    program_plan_id,
  })
  return response.data.map((item) => ({
    value: item.id,
    label: item.name,
  }))
}

export const deleteBmhpExaminationType = async (id: number) => {
  const apiUrl = `${baseUrl}bmhp-examinations/types/${id}`

  const response = await axios.delete(apiUrl)
  return handleAxiosResponse<void>(response)
}

export async function exportBmhpExaminationType(
  params: GetBmhpExaminationTypeListParams
) {
  const response = await axios.get(
    `${SERVICE.CORE}/bmhp-examinations/types/xls`,
    {
      responseType: 'blob',
      cleanParams: true,
      params,
    }
  )

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
