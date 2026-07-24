import axios from '#lib/axios'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'

import { TOrder } from './order-list.type'

export type ListOrderParams = TCommonFilter & {
  type?: number
  type_ids?: string
  activity_id?: number
  service_type?: number
  status?: number | string
  status_ids?: string
  order_number?: string
  from_date?: string
  to_date?: string
  purpose?: 'sales' | 'purchase'
  entity_tag_id?: string
  vendor_id?: string
  customer_id?: string
  entity_province_id?: string
  entity_city_id?: string
  entity_puskesmas_id?: string
}

export type TOrderCountsResponse = {
  total: number
}

export type ListOrdersResponse = TCommonResponseList & {
  next_cursor: string | null
  prev_cursor: string | null
  data: TOrder[]
}

export async function listOrders(rawParams: ListOrderParams, cursor?: string) {
  const isCursor = !rawParams.page
  const url = isCursor ? '/main/orders/cursor' : '/main/orders'
  const params = isCursor ? { ...rawParams, cursor } : rawParams
  const response = await axios.get(url, { params })
  return handleAxiosResponse<ListOrdersResponse>(response)
}

export async function totalOrdersCursor(params: ListOrderParams) {
  const response = await axios.get('/main/orders/counts', { params })
  return handleAxiosResponse<TOrderCountsResponse>(response)
}

export async function loadListOrders(
  keyword: string,
  _: unknown,
  additional: Omit<ListOrderParams, 'paginate'>
) {
  if (Number.isNaN(Number(keyword))) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }
  }

  const result = await listOrders({
    paginate: 10,
    ...(keyword && { order_number: keyword }),
    ...additional,
  })

  if (result?.statusCode === 204 || result?.data.length === 0) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }
  }

  const options = result?.data.map((item) => ({
    label: `${item.id}`,
    value: item.id,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function exportOrder(params: ListOrderParams) {
  const response = await axios.get('/main/orders/xls', {
    responseType: 'blob',
    params,
  })

  return response?.data
}
