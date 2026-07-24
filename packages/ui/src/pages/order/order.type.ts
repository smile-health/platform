import { Color } from '#types/component'

import { OrderStatusEnum } from './order.constant'

export type OrderStatusOption = {
  value: OrderStatusEnum
  label: string
  color: Color
}

export type StockQualityType = {
  id: number | null
  label: string
}

export type MaterialCompanions = {
  id: number
  name: string
}
