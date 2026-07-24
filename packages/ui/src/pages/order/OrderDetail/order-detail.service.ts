import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { ListStockResponse } from '#services/stock'
import { TDetailActivityDate } from '#types/entity'
import { Stock } from '#types/stock'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'
import { AxiosResponse } from 'axios'

import {
  CreateOrderDetailCommentPayload,
  CreateOrderDetailItemFormValues,
  CreateOrderDetailItemPayload,
  OrderDetailInteroperabilityLogsResponse,
  OrderDetailItem,
  OrderDetailResponse,
  UpdateOrderDetailItemFormValues,
  UpdateOrderDetailItemPayload,
  UpdateOrderStatusToAllocatedPayload,
  UpdateOrderStatusToCancelFormValues,
  UpdateOrderStatusToCancelPayload,
  UpdateOrderStatusToConfirmFormValues,
  UpdateOrderStatusToConfirmHierarchyFormValues,
  UpdateOrderStatusToConfirmPayload,
  UpdateOrderStatusToPendingFromDraftFormValues,
  UpdateOrderStatusToPendingFromDraftPayload,
  UpdateOrderStatusToShippedPayload,
} from './order-detail.type'

const MAIN_SERVICE = SERVICE_API.MAIN
const BASE_URL = `${MAIN_SERVICE}/orders`

// ================================
// API
// ================================

export const getOrderDetail = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/${id}`)
  return response.data as OrderDetailResponse
}

export const getOrderInteroperabilityLogs = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/${id}/integration-logs`)
  return response.data as OrderDetailInteroperabilityLogsResponse
}

export const getStockDetails = async (params: {
  entity_id?: number
  material_id?: string
  only_have_qty: number
  group_by: string
}) => {
  const response = await axios.get(`${MAIN_SERVICE}/stocks/details`, {
    params,
  })

  return handleAxiosResponse<ListStockResponse>(response)
}

export const createOrderDetailItem = async (
  id: string | number,
  values: CreateOrderDetailItemFormValues,
  isHierarchyEnabled: boolean
) => {
  const payload: CreateOrderDetailItemPayload = {
    order_items: [
      {
        order_item_kfa_id: values.order_item_kfa_id,
        material_id: Number(values.material_id),
        ordered_qty: Number(values.ordered_qty),
        order_reason_id: Number(values.order_reason_id?.value),
        other_reason: values.other_reason as string,
        recommended_stock: values.recommended_stock as number,
        children: isHierarchyEnabled
          ? values.children?.filter((child) => Boolean(child?.ordered_qty))
          : undefined,
      },
    ],
  }

  const response = await axios.post(
    `${BASE_URL}/${id}/order-item-stocks`,
    payload
  )

  return handleAxiosResponse(response)
}

export const updateOrderDetailItem = async (
  id: string | number,
  values: UpdateOrderDetailItemFormValues,
  isHierarchyEnabled: boolean
) => {
  const payload: UpdateOrderDetailItemPayload = {
    order_items: [
      {
        id: Number(values.id),
        ordered_qty: Number(values.ordered_qty),
        order_reason_id: Number(values.order_reason_id?.value),
        other_reason: values.other_reason as string,
        recommended_stock: values.recommended_stock as number,
        children: isHierarchyEnabled
          ? values.children?.filter((child) => Boolean(child?.ordered_qty))
          : undefined,
      },
    ],
  }

  const response = await axios.put(
    `${BASE_URL}/${id}/order-item-stocks`,
    payload
  )
  return handleAxiosResponse(response)
}

export const createOrderDetailComment = async (
  id: string | number,
  payload: CreateOrderDetailCommentPayload
) => {
  payload.comment = payload.comment?.trim()
  const response = await axios.post(`${BASE_URL}/${id}/comments`, payload)
  return handleAxiosResponse(response)
}

export const updateOrderStatusToCancel = async (
  id: string | number,
  values: UpdateOrderStatusToCancelFormValues
) => {
  const payload: UpdateOrderStatusToCancelPayload = {
    order_cancel_reason_id: Number(values.cancel_reason_id?.value),
    other_reason: values.other_reason,
    comment: values.comment,
  }
  const response = await axios.put(`${BASE_URL}/${id}/cancel`, payload)
  return handleAxiosResponse(response)
}

export const updateOrderStatusToPendingFromDraft = async (
  id: string | number,
  values: UpdateOrderStatusToPendingFromDraftFormValues
) => {
  const payload: UpdateOrderStatusToPendingFromDraftPayload = values
  const response = await axios.put(`${BASE_URL}/${id}/validate`, payload)
  return handleAxiosResponse(response)
}

export const updateOrderStatusToPending = async (id: string | number) => {
  const response = await axios.put(`${BASE_URL}/${id}/pending`)
  return handleAxiosResponse(response)
}

export const updateOrderStatusToConfirm = async (
  id: string | number,
  values:
    | UpdateOrderStatusToConfirmFormValues
    | UpdateOrderStatusToConfirmHierarchyFormValues
) => {
  const payload:
    | UpdateOrderStatusToConfirmPayload
    | UpdateOrderStatusToConfirmHierarchyFormValues = values
  const response = await axios.put(`${BASE_URL}/${id}/confirm`, payload)
  return handleAxiosResponse(response)
}

export const updateOrderStatusToAllocated = async (
  id: string | number,
  payload: UpdateOrderStatusToAllocatedPayload
) => {
  const response = await axios.put(`${BASE_URL}/${id}/allocate`, payload)
  return handleAxiosResponse(response)
}

export const updateOrderStatusToShipped = async (
  id: string | number,
  payload: UpdateOrderStatusToShippedPayload
) => {
  const response = await axios.put(`${BASE_URL}/${id}/ship`, payload)
  return handleAxiosResponse(response)
}

// ================================
// Loaders
// ================================

export async function loadOrderDetailStocks(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    paginate: number
    entity_id?: number
    activity_id?: number
    order_items?: OrderDetailItem[]
    is_hierarchy?: number
    material_level_id?: number
  }
) {
  let params = {
    page: additional.page,
    paginate: additional.paginate ?? 10,
    entity_id: additional.entity_id,
    activity_id: additional.activity_id,
    keyword,
    material_level_id: additional?.material_level_id,
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
      const isItemAdded = additional.order_items?.find(
        (orderItem) => orderItem.material.id === item.material?.id
      )
      return !isItemAdded
    })
    .map((item: Stock) => ({
      label: item?.material?.name ?? '',
      value: item.material?.id,
      data: item,
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

export async function loadOrderDetailActivities(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    entity_id: number
  }
) {
  let params = {
    entity_id: additional.entity_id,
    keyword,
  }

  const response: AxiosResponse<TDetailActivityDate[]> = await axios.get(
    `${MAIN_SERVICE}/entities/${additional?.entity_id}/activities`,
    {
      params,
    }
  )

  if (response?.status === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
      },
    }
  }

  const options = response?.data?.map((item) => ({
    label: item?.name,
    value: item?.id,
    data: item,
  }))

  return {
    options,
    hasMore: false,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

// ================================================
// Exports
// ================================================

export async function exportLetterRequest(id: string | number) {
  const response = await axios.get(`${BASE_URL}/${id}/request-letter/xls`, {
    responseType: 'blob',
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function exportConfirmationNote(id: string | number) {
  const response = await axios.get(`${BASE_URL}/${id}/nota-confirmation/xls`, {
    responseType: 'blob',
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function exportBatchNote(id: string | number) {
  const response = await axios.get(`${BASE_URL}/${id}/nota-batch/xls`, {
    responseType: 'blob',
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function exportSbbk(id: string | number) {
  const response = await axios.get(`${BASE_URL}/${id}/sbbk/xls`, {
    responseType: 'blob',
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function exportVar(id: string | number) {
  const response = await axios.get(`${BASE_URL}/${id}/var/xls`, {
    responseType: 'blob',
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
