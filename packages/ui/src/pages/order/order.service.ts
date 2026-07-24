import axios from '#lib/axios'
import { listStock, listStockByEntities } from '#services/stock'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'

import { StockQualityType } from './order.type'

type ListStockQualitiesParams = TCommonFilter & {
  keyword?: string
}

export type ListStockQualitiesResponse = TCommonResponseList & {
  data: StockQualityType[]
}

export type ListOrderDeliveryTypeResponse = {
  data: {
    id: number
    name: string
  }[]
}

export async function listOrderDeliveryTypes() {
  const response = await axios.get('/main/orders/delivery-types')
  return handleAxiosResponse<ListOrderDeliveryTypeResponse>(response)
}

export async function listStockQualities(params: ListStockQualitiesParams) {
  const response = await axios.get('/main/stock-qualities', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListStockQualitiesResponse>(response)
}

export async function loadStockQualities(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  let params = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const result = await listStockQualities(params)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  const options = result?.data?.map((item) => ({
    label: item?.label,
    value: item?.id,
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

export async function loadMaterial(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    activity_id: number
    entity_id: number
    material_ids: number[]
  }
) {
  const { material_ids, ...restParams } = additional
  const params = {
    ...restParams,
    keyword,
    paginate: 10,
    with_details: 1,
  }

  const response = await listStockByEntities(params)

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

  const options = response?.data
    ?.filter((x) => !additional.material_ids.includes(x.material?.id as number))
    .map((item) => ({
      label: item?.material?.name,
      value: item,
      isDisabled: !item?.total_available_qty,
    }))

  return {
    options,
    hasMore: !!response?.data?.length,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}
