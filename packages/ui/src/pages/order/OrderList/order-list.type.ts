import { OrderStatusEnum } from '../order.constant'

export type TGeneral = {
  id: number
  name: string
}

export type TOrder = TOrderUserUpdateTime & {
  id: number
  device_type: number
  status: OrderStatusEnum
  type: number
  vendor: TGeneral
  customer: TGeneral
  activity: TGeneral
  total_order_item: number
  metadata: null | TOrderMetadata
  user_created_by: TOrderUserAction
  user_confirmed_by: TOrderUserAction
  user_allocated_by: TOrderUserAction
  user_shipped_by: TOrderUserAction
  user_fulfilled_by: TOrderUserAction
  user_cancelled_by: TOrderUserAction
  user_drafted_by: TOrderUserAction
}

export type TOrderUserUpdateTime = {
  created_at: string
  confirmed_at: string
  shipped_at: string
  fulfilled_at: string
  cancelled_at: string
  allocated_at: string
  drafted_at: string
}

type TOrderUserAction = {
  id: number
  firstname: string
  lastname: string
}

type TOrderMetadata = {
  category?: string
  client_key?: TOrderIntegrationType
  key_ssl?: string
  total_patients?: number
}

export type TOrderIntegrationType = 'siha' | 'sitb' | 'din' | 'biofarma'
