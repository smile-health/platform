import { OptionType } from '#components/react-select'
import { TCommonResponseList } from '#types/common'
import { TDetailActivityDate, TEntities } from '#types/entity'

import { MaterialCompanions } from '../order.type'

export type TOrderCreateForm = {
  order_items: MappedMaterialData[]
  customer_id: OptionType | null
  activity_id: OptionType | null
  vendor_id: OptionType | null
  required_date: string | null
  order_comment: string | null
}

export type MaterialChildren = {
  kfa_type: number
  material_id?: number
  ordered_qty: number | null
  total_ordered_qty: number | null
  available_qty: number
  max: number
  min: number
  name?: string
}

export type MappedMaterialData = {
  label?: string
  value: {
    material_companions: MaterialCompanions[] | null
    material_id?: number
    total_available_qty?: number
    total_qty?: number
    ordered_qty?: number | null
    min?: number
    max?: number
    order_reason_id?: OptionType | null
    other_reason?: string | null
    recommended_stock?: number
    consumption_unit_per_distribution_unit?: number
    children?: MaterialChildren[]
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

export interface Reason {
  id: number
  name: string
}
