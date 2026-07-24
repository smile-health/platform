import { TCommonObject } from '#types/common'
import { TDetailEntity } from '#types/entity'
import { TUserCreatedBy } from '#types/material'
import { TUser } from '#types/user'

import { TFormatBatch } from '../../../order/OrderCreateDistribution/order-create-distribution.type'
import { TOrder } from '../../../order/OrderList/order-list.type'
import { TicketingSystemStatusEnum } from '../../ticketing-system.constant'

interface TReason {
  id: number
  title: string
  title_en: string
}

export type TicketingSystemItemType = {
  id: number
  event_report_id: number
  material_id: number
  no_batch: string
  expired_date: string
  production_date: string
  qty: number
  reason_id: number
  child_reason_id: number
  custom_material: string
  created_at: string
  updated_at: string
  deleted_at: string
  material: TCommonObject | null
  reason: string | null
  child_reason: string | null
  material_name: string
  batch_code: string | null
}

type TicketingSystemUser = {
  id: number
  username: string
  email: string
  firstname: string
  lastname: string
}

type TicketingSystemComment = {
  id: number
  event_report_id: number
  comment: string
  user_id: number
  status: number
  deleted_at: string
  created_at: string
  updated_at: string
  user: TUser
}

export type HistoryChangeStatus = {
  id: number
  status_id: number
  created_by: TUserCreatedBy
  created_at: string
  status_label: string
}

export type DetailTicketingSystemResponse = {
  event_report_id: string
  status_label: string
  status_id: number
  id: number
  entity_id: number
  status: TicketingSystemStatusEnum
  order_id: number
  no_packing_slip: string
  has_order: number
  arrived_date: string
  created_by: number
  crated_at: string
  updated_by: number
  finished_by: number
  finished_at: string
  deleted_at: string
  deleted_by: number
  canceled_at: string
  canceled_by: number
  link: string
  created_at: string
  updated_at: string
  entity: TDetailEntity
  order: TOrder
  user_created_by: TicketingSystemUser
  user_updated_by: TicketingSystemUser
  user_deleted_by: TicketingSystemUser
  user_finished_by: TicketingSystemUser
  comments: TicketingSystemComment[]
  items: TicketingSystemItemType[]
  history_change_status: HistoryChangeStatus[]
  follow_up_status: { id: number; status_label: string }[] | []
  do_number: string | number | null
  slip_link: string | null
}

// =========================================================

export type TOrderDetailStock = {
  id: number
  stock_id: number
  activity_id: number
  activity_name: string
  status: number
  order_item_id: number
  allocated_qty: number
  received_qty: number
  confirmed_qty: number
  ordered_qty: number
  batch_id: number
  batch: TFormatBatch | null
}

export type OptionMaterial = {
  label: string
  value: any
  managed_in_batch: number
}

type Comment = {
  comment: string
}

export type ItemTicketingSystem = {
  material_id: number | null
  custom_material?: string | null
  no_batch?: string | null
  expired_date?: string | null
  production_date: string | null
  qty: number | null
  reason_id?: number | null
  child_reason_id?: number | null
}

export type TicketingSystemSubmitData = {
  entity_id?: number
  has_order: number | null
  order_id?: number
  no_packing_slip: string | null
  arrived_date: string | null
  comments: Comment[]
  items: ItemTicketingSystem[]
}

export type ListTicketingSystemEventReportStatus = Array<{
  id: number
  label: string
}>

export type TFollowUpChangeStatus = {
  statusId: number
  followUpStatus: { id: number; status_label: string }[] | []
}
