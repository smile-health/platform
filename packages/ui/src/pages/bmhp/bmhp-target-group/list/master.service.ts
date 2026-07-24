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
  id: string | number
  program_plan_id: string | number
  target_group_id: string | number
  name: string
  created_at: Date | string
  updated_at: Date | string
  created_by: string | number | null
  updated_by: string | number | null
  deleted_at: Date | string | null
  deleted_by: string | number | null
  user_updated_by?: {
    id: number
    username: string
    email: string
    firstname: string
    lastname: string
  } | null
  user_created_by?: {
    id: number
    username: string
    email: string
    firstname: string
    lastname: string
  } | null
}

const SERVICE = SERVICE_API

const baseUrl = 'main/'

export const listBmhpMaterial = async (params: GetBmhpMaterialListParams) => {
  const apiUrl = `${baseUrl}bmhp-target-groups/plan`

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

export const loadBmhpTargetGroupOptions = async () => {
  const response = await axios.get(`${baseUrl}bmhp-target-groups`, {
    params: { paginate: 100 },
    cleanParams: true,
  })
  const res = handleAxiosResponse<any>(response)
  return res.data.map((item: any) => ({
    value: item.id,
    label: item.name,
  }))
}

export const deleteBmhpTargetGroup = async (id: number | string) => {
  const apiUrl = `${baseUrl}bmhp-target-groups/plan/${id}`

  const response = await axios.delete(apiUrl)

  return handleAxiosResponse<void>(response)
}

export type BulkCreateTargetGroupPlanParams = {
  program_plan_id: number
  target_group_ids: number[]
}

export const bulkCreatePlanTargetGroups = async (
  data: BulkCreateTargetGroupPlanParams
) => {
  const apiUrl = `${baseUrl}bmhp-target-groups/plan`

  const response = await axios.post(apiUrl, data)

  return handleAxiosResponse<void>(response)
}

export const verifyPlanTargetGroup = async (
  program_plan_id: number | string
) => {
  const apiUrl = `${baseUrl}bmhp-target-groups/plan/verify`

  const response = await axios.get(apiUrl, {
    params: { program_plan_id },
  })

  return handleAxiosResponse<{ data: number[] }>(response)
}
