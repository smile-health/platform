import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { DetailStock, Stock } from '#types/stock'
import { handleAxiosResponse } from '#utils/api'

export type ListStockResponse = TCommonResponseList & {
  data: Stock[]
}

type ListStockDetailStockResponse = {
  data: DetailStock[]
}

export type ListStockParams = {
  page: string | number
  paginate: string | number
  only_have_qty?: string
  activity_id?: number
  entity_id?: number
  entity_tag_id?: number
  entity_user_id?: number
  expired_end_date?: string
  expired_start_date?: string
  material_id?: string
  material_type_id?: number
  province_id?: number
  regency_id?: number
  primary_vendor_id?: number
  material_level_id?: string
  batch_ids?: string
  keyword?: string
  with_details?: number
  period_id?: number
}

const MAIN_SERVICE = SERVICE_API.MAIN

export async function listStock(params: ListStockParams) {
  const response = await axios.get(`${MAIN_SERVICE}/stocks`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListStockResponse>(response)
}

export async function listStockByEntities(params: ListStockParams) {
  const response = await axios.get(`${MAIN_SERVICE}/stocks/entities`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListStockResponse>(response)
}

export async function loadListStockByEntities(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    params: Omit<ListStockParams, 'page' | 'paginate'>
    selected_material_ids?: number[]
  }
) {
  const response = await listStockByEntities({
    ...additional.params,
    keyword,
    with_details: 1,
    page: additional?.page.toString(),
    paginate: 10,
  })

  if (response?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page,
      },
    }
  }

  let options: Array<{
    label: string | undefined
    value: Stock | undefined
    isCustomMaterial?: boolean
    isDisabled?: boolean
  }> = response?.data.map((item) => ({
    label: item.material?.name,
    value: item,
    isCustomMaterial: false,
    isDisabled: false,
  }))

  if (additional?.selected_material_ids?.length) {
    options = options?.filter((option) => {
      return !additional?.selected_material_ids?.includes(
        option.value?.material?.id as number
      )
    })
  }

  return {
    options,
    hasMore: !!response?.data?.length,
    additional: {
      ...additional,
      page: Number(additional.page) + 1,
    },
  }
}

export type ListStockDetailStockParams = {
  entity_id?: number | string
  group_by: 'activity' | 'material' | 'activity_material'
  material_id?: number | string
  parent_material_id?: number | string
  batch_ids?: string
  activity_id?: number | string
  only_have_qty?: number
  expired_end_date?: string
  expired_start_date?: string
}

export async function listStockDetailStock(
  params: ListStockDetailStockParams
): Promise<ListStockDetailStockResponse> {
  const response = await axios.get(`${MAIN_SERVICE}/stocks/details`, {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListStockDetailStockResponse>(response)
}

export async function exportStock(params?: ListStockParams) {
  const response = await axios.get(`${MAIN_SERVICE}/stocks/xls`, {
    params,
    cleanParams: true,
  })

  return response?.data
}
