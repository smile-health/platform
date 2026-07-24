import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

export type GetBmhpVariantListParams = {
  keyword?: string
  page?: number
  paginate?: number
  sort_by?: string
  sort_type?: string
  year_id?: number
  program_plan_id?: number
}

export type GetBmhpVariantListResponse = {
  data: TBmhpVariantData[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
}

export type TBmhpVariantData = {
  id: number
  bmhp_material_id: number
  material_name: string
  brand_name: string
  variants: Array<{
    name: string
    test_qty: number
    unit: string
  }>
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

export const listBmhpVariant = async (params: GetBmhpVariantListParams) => {
  const apiUrl = `${baseUrl}bmhp-planning-materials/variant`

  const response = await axios.get(apiUrl, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<GetBmhpVariantListResponse>(response)
}

export const deleteBmhpVariant = async (id: number) => {
  const apiUrl = `${baseUrl}bmhp-planning-materials/variant/${id}`

  const response = await axios.delete(apiUrl)
  return handleAxiosResponse<void>(response)
}

export async function exportBmhpVariant(params: GetBmhpVariantListParams) {
  const response = await axios.get(
    `${SERVICE.CORE}/bmhp-planning-materials/variant/xls`,
    {
      responseType: 'blob',
      cleanParams: true,
      params,
    }
  )

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
