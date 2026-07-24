import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { ListEntitiesParams } from '#services/entity'
import { ListStockParams, ListStockResponse } from '#services/stock'
import { TEntities } from '#types/entity'
import { Stock } from '#types/stock'
import { handleAxiosResponse } from '#utils/api'
import { OptionType } from 'dayjs'

import { OrderDetailItem } from '../OrderDetail/order-detail.type'
import {
  ListEntitiesResponse,
  listEntityActivitiesParams,
  listEntityActivitiesReponse,
  ListReasons,
  listStocksParams,
  TDetailActivity,
} from './order-create.type'
import { mapStock } from './utils'

type loadEntityActivitiesParams = {
  is_ordered_purchase?: number
  entity_id?: number
  page?: number
  paginate?: number
  keyword?: string
}

export type createOrderBody = {
  customer_id: number
  vendor_id: string
  required_date: string | null
  activity_id: number
  order_comment: string | null
  order_items: OrderItem[]
}

export interface OrderItem {
  ordered_qty: number
  material_id: number
  order_reason_id: number
  recommended_stock: number
  other_reason: any
}

const MAIN_SERVICE = SERVICE_API.MAIN

export async function loadStockEntites(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    paginate: number
    entity_id?: number
    activity_id?: number
    material_ids?: number[]
    material_level_id?: string
    is_hierarchy?: number
  }
) {
  let params = {
    page: additional.page,
    paginate: additional.paginate ?? 10,
    entity_id: additional.entity_id,
    activity_id: additional.activity_id,
    material_level_id: additional.material_level_id,
    keyword,
    ...(additional.is_hierarchy && { with_details: 1 }),
  }

  const response = await axios.get(
    `${MAIN_SERVICE}/stocks${additional.is_hierarchy ? '/entities' : ''}`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<ListStockResponse>(response)

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

  const options = result?.data
    ?.filter((item) => {
      const isItemAdded = additional.material_ids?.find(
        (id) => id === item.material?.id
      )
      return !isItemAdded
    })
    .map((item: Stock) => {
      return mapStock(item)
    })

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadStocks(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    activity: {
      label: string
      value: number
    }
    entity_id: number
    material_ids: number[]
  }
) {
  let params: ListStockParams = {
    page: additional.page,
    activity_id: additional.activity.value,
    entity_id: additional.entity_id,
    paginate: 10,
    with_details: 1,
    keyword,
  }

  const fetchStockList = await axios.get(`${MAIN_SERVICE}/stocks`, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<ListStockResponse>(fetchStockList)

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

  const options = result?.data
    ?.filter(
      (x) => !additional?.material_ids.includes(x.material?.id as number)
    )
    .map((item: Stock) => ({
      label: item?.material?.name ?? '',
      value: {
        id: item.material?.id,
        material_id: item.material?.id,
        material_name: item.material?.name,
        total_qty: item.total_qty,
        total_allocated_qty: item.total_allocated_qty,
        total_available_qty: item.total_available_qty,
        total_in_transit_qty: item.total_in_transit_qty,
        min: item.min,
        max: item.max,
      },
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
export async function loadReasons(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    type?: 'request' | 'relocation'
  }
) {
  let params: {
    page: string | number
    paginate: string | number
    order_type?: 'request' | 'relocation'
    keyword?: string
  } = {
    page: additional.page,
    order_type: additional.type,
    paginate: 10,
    keyword,
  }

  const fetchReasonList = await axios.get(`${MAIN_SERVICE}/order-reasons`, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<ListReasons>(fetchReasonList)

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

  const options = result?.data?.map((item: TEntities) => ({
    label: item?.name,
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

export async function loadEntity(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    is_vendor?: number
    isSuperAdmin?: boolean
    defaultOptions: {
      value: number
      label: string
    }
  }
) {
  if (!additional.isSuperAdmin) {
    return {
      options: [additional.defaultOptions],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  let params: ListEntitiesParams = {
    page: additional.page,
    is_vendor: additional.is_vendor,
    paginate: 10,
    keyword,
  }

  const fetchEntityList = await axios.get(`${MAIN_SERVICE}/entities`, {
    params,
    cleanParams: true,
  })

  const result = handleAxiosResponse<ListEntitiesResponse>(fetchEntityList)

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

  const options = result?.data?.map((item: TEntities) => ({
    label: item?.name,
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

type LoadVendorParams = {
  is_relocation?: number
  activity_id?: number
}
export async function loadVendor(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    id?: number
    is_relocation?: number
    activity_id?: number
  }
) {
  let params: ListEntitiesParams & LoadVendorParams = {
    page: additional.page,
    paginate: 10,
    keyword,
    ...(additional.is_relocation && {
      activity_id: additional.activity_id,
      is_relocation: 1,
    }),
  }

  if (!additional.id || (additional.is_relocation && !additional.activity_id)) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  const fetchVendorList = await axios.get(
    `${MAIN_SERVICE}/entities/${additional.id}/vendors`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<any>(fetchVendorList)

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

  const options = result?.data?.map((item: TEntities) => ({
    label: item?.name,
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

export async function loadActivities(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    is_ordered_purchase?: number
    entity_id?: number
  }
) {
  let params: loadEntityActivitiesParams = {
    is_ordered_purchase: additional.is_ordered_purchase,
    entity_id: additional.entity_id,
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const fetchActivityList = await axios.get(
    `${MAIN_SERVICE}/entities/${additional?.entity_id}/activities`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<any>(fetchActivityList)

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

  const options = result?.data?.map((item: TDetailActivity) => ({
    label: item?.name,
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

export async function listEntityActivities({
  id,
  params,
}: listEntityActivitiesParams): Promise<listEntityActivitiesReponse> {
  const response = await axios.get(
    `${MAIN_SERVICE}/entities/${id}/activities`,
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function listStocks({
  params,
}: listStocksParams): Promise<listEntityActivitiesReponse> {
  const response = await axios.get(`${MAIN_SERVICE}/stocks`, {
    params,
    cleanParams: true,
  })

  return response?.data
}

export async function createOrder(
  data: createOrderBody
): Promise<{ createdOrderId: number }> {
  const response = await axios.post(`${MAIN_SERVICE}/orders/request`, data, {
    cleanParams: true,
  })
  return response?.data
}

export async function loadCancelReasons(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  let params: ListEntitiesParams = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const fetchReasonList = await axios.get(
    `${MAIN_SERVICE}/order-cancel-reasons`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<ListReasons>(fetchReasonList)

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

  const options = result?.data?.map((item: TEntities) => ({
    label: item?.name,
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
