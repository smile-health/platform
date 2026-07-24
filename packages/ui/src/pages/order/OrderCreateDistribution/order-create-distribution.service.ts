import axios from '#lib/axios'

import { TOrderItem } from './order-create-distribution.type'

export type CreateOrderDistributionBody = {
  vendor_id: number
  customer_id: number
  activity_id: number
  required_date: string | null
  order_comment: string
  order_items: TOrderItem[]
}

type CreateOrderDistributionResponse = {
  id: number
}

export async function createOrderDistribution(
  data: CreateOrderDistributionBody
) {
  const response = await axios.post<CreateOrderDistributionResponse>(
    '/main/orders/distribution',
    data,
    {
      cleanBody: true,
    }
  )
  return response?.data
}
