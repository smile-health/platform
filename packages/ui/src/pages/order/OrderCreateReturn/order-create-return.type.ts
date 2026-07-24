import { OptionType } from '#components/react-select'
import { TCommonResponseList } from '#types/common'
import { TDetailActivityDate, TEntities } from '#types/entity'

export type TOrderCreateReturnForm = {
  order_items: OrderItem[]
  customer_id: OptionType | null
  activity_id: (OptionType & { entity_activity_id: number }) | null
  vendor_id: OptionType | null
  required_date: string | null
  order_comment: string | null
}

export type TOrderCreateReturnFormChild = {
  order_items: OrderItem[]
}

export type TMaterialCompanions = {
  id: number
  name: string
}

export type OrderItem = {
  material_id?: number
  material_is_managed_in_batch?: number
  material_stocks: {
    valid: Stock[]
    expired: Stock[]
  }
  material_name?: string
  material_total_qty?: number | null
  material_available_qty?: number | null
  material_activity_name?: string
  material_min?: number
  material_max?: number
  material_companions?: TMaterialCompanions[]
  material_other_activity?: {
    label?: string
    entity_activity_id?: number
    value?: OrderItem
  }[]
}

export type Stock = {
  batch_activity_id?: number
  batch_ordered_qty?: number | null
  batch_order_stock_status_id?: OptionType | null
  batch_stock_id?: number
  batch_consumption_unit_per_distribution_unit?: number
  batch_is_temperature_sensitive?: number
  batch_code?: string
  batch_total_qty?: number
  batch_allocated_qty?: number
  batch_available_qty?: number
  batch_production_date?: string
  batch_expiry_date?: string
  batch_manufacturer?: string
  batch_activity?: {
    id?: number
    name?: string
  }
}

export type ListEntitiesResponse = TCommonResponseList & {
  data: TEntities[]
  statusCode: number
}

export type ListEntitiesParams = {
  page: string | number
  paginate: string | number
  keyword?: string
  type_ids?: string | number
  entity_tag_ids?: string | number
  province_ids?: string
  regency_ids?: string
  sub_district_ids?: string
  village_ids?: string
  program_ids?: string
  is_vendor?: number
}

export interface TDetailActivity {
  id: number
  name: string
  is_ordered_purchase: number
  is_ordered_sales: number
  created_at: string
  updated_at: string
  user_created_by: UserCreatedBy
  user_updated_by: UserUpdatedBy
}

export interface UserCreatedBy {
  id: number
  username: string
  firstname: string
  lastname: any
  fullname: string
}

export interface UserUpdatedBy {
  id: number
  username: string
  firstname: string
  lastname: any
  fullname: string
}

export type listEntityActivitiesReponse = TDetailActivityDate[]

export type listEntityActivitiesParams = {
  id: string
  params?: {
    is_ordered_purchase?: number
    entity_id?: string
    is_ongoing?: number
  }
}

export type listStocksParams = {
  params?: {
    keyword?: string
    page?: string
    kfa?: string
  }
}

export type ListReasons = {
  data: Reason[]
}

export type MaterialStatus = {
  id: number
  label: string
}

export type ListMaterialStatus = {
  data: MaterialStatus[]
}

export interface Reason {
  id: number
  name: string
}
