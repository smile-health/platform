import { OptionType } from '#components/react-select'
import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

const MAIN_SERVICE = SERVICE_API.MAIN
const BASE_URL = `${MAIN_SERVICE}/orders`

export type ReceivePayload = {
  order_items?: Array<ReceiveOrderItem | ReceiveOrderItemHierarchy>
  fulfilled_at: string
  comment: string
}

export type ReceiveOrderItem = {
  id: number
  receives: Array<ReceiveOrderItemReceive>
}

export type ReceiveOrderItemHierarchy = {
  id?: number
  children?: {
    id?: number
    receives?: Array<ReceiveOrderItemReceive>
  }
}

export type ReceiveOrderItemReceive = {
  stock_id: number
  received_qty: number | null
  fulfill_stock_status_id: OptionType | null
}

export type ReceiveErrorResponse = {
  order_items: Array<Record<'id' | 'receives', string[]>>
  fulfilled_at: string[]
  comment: string[]
}

export async function updateOrderStatusToFulfilled(
  orderId: string,
  payload: ReceivePayload
) {
  const response = await axios.put(`${BASE_URL}/${orderId}/fulfilled`, payload)
  return handleAxiosResponse(response)
}
