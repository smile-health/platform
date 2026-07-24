import { OptionType } from '#components/react-select'
import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { ListEntitiesParams } from '#services/entity'
import { ListStockParams, ListStockResponse } from '#services/stock'
import { TEntities } from '#types/entity'
import { Stock } from '#types/stock'
import { handleAxiosResponse } from '#utils/api'

import {
  ListEntitiesResponse,
  listEntityActivitiesParams,
  listEntityActivitiesReponse,
  ListMaterialStatus,
  listStocksParams,
  TDetailActivity,
} from './order-create-return.type'
import { mapDetailStock, mapStock } from './utils'

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
  required_date: string
  activity_id: number
  order_comment: string
  order_items: OrderItem[]
}

export interface OrderItem {
  material_id: number
  stocks: {
    stock_id: number
    allocated_qty: number
    order_stock_status_id: number
  }[]
}

const MAIN_SERVICE = SERVICE_API.MAIN

export async function loadStocksOrderReturn(
  keyword: string,
  _: unknown,
  additional?: {
    page: number
    activity: OptionType | null
    entity_id: number
    material_ids: number[]
  }
) {
  let params: ListStockParams = {
    page: additional?.page ?? 1,
    activity_id: additional?.activity?.value,
    entity_id: additional?.entity_id,
    with_details: 1,
    paginate: 10,
    keyword,
  }

  const fetchStockList = await axios.get(`${MAIN_SERVICE}/stocks/entities`, {
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
        page: (additional?.page ?? 1) + 1,
      },
    }
  }

  const options = result?.data
    ?.filter(
      (x) => !additional?.material_ids.includes(x.material?.id as number)
    )
    .map((item: Stock) => {
      const otherActivityData = result?.data
        ?.find((data) => data?.material?.id === item?.material?.id)
        ?.details?.filter(
          (detail) =>
            detail?.activity?.id !== additional?.activity?.value &&
            detail?.stocks?.length
        )
        .map((filtered) => {
          const batchData = filtered?.stocks?.map((stock) => {
            return {
              batch_code: stock?.batch?.code,
              batch_activity_id: stock?.activity?.id,
              batch_ordered_qty: null,
              batch_order_stock_status_id: null,
              batch_total_qty: stock?.qty,
              batch_allocated_qty: stock?.allocated_qty,
              batch_available_qty: stock?.available_qty,
              batch_production_date: stock?.batch?.production_date,
              batch_expiry_date: stock?.batch?.expired_date,
              batch_manufacturer: stock?.batch?.manufacture_name,
              batch_activity: stock?.activity,
              batch_consumption_unit_per_distribution_unit:
                filtered?.material?.consumption_unit_per_distribution_unit,
              batch_stock_id: stock?.id,
              batch_is_temperature_sensitive:
                filtered?.material?.is_temperature_sensitive,
            }
          })

          return {
            label: filtered?.activity?.name ?? '',
            value: {
              material_activity_name: filtered?.activity?.name,
              material_available_qty: filtered?.total_available_qty,
              material_companions: [],
              material_id: filtered?.material?.id,
              material_is_managed_in_batch:
                filtered?.material?.is_managed_in_batch,
              material_max: filtered?.max,
              material_min: filtered?.min,
              material_name: filtered?.material?.name,
              material_stocks: {
                valid: batchData?.filter(
                  (stock) =>
                    new Date(stock?.batch_expiry_date ?? '') > new Date() ||
                    stock?.batch_expiry_date === undefined
                ),
                expired: batchData?.filter(
                  (stock) =>
                    new Date(stock?.batch_expiry_date ?? '') <= new Date() &&
                    stock?.batch_expiry_date !== undefined
                ),
              },
              material_total_qty: filtered?.total_qty,
            },
            entity_activity_id: filtered?.activity?.id,
          }
        })

      return {
        label: item?.material?.name ?? '',
        value: mapStock(
          0,
          additional?.activity?.label,
          item,
          otherActivityData
        ),
      }
    })

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: (additional?.page ?? 1) + 1,
    },
  }
}

export async function loadMaterialStatus(
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

  const fetchMaterialStatus = await axios.get(
    `${MAIN_SERVICE}/stock-qualities`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<ListMaterialStatus>(fetchMaterialStatus)

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

  const options = result?.data?.map((item: { id: number; label: string }) => ({
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

export async function loadVendor(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    id?: number
  }
) {
  let params: ListEntitiesParams = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  if (!additional.id) {
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

export async function createOrderReturn(
  data: createOrderBody
): Promise<{ id: number }> {
  const response = await axios.post(`${MAIN_SERVICE}/orders/return`, data, {
    cleanBody: true,
  })
  return response?.data
}
