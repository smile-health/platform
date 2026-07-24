import {
  TCommonObject,
  TCommonResponseList,
  TSingleOptions,
} from '#types/common'
import { TFunction } from 'i18next'

import { TPeriodOfStockTaking } from '../../../period-of-stock-taking/list/libs/period-of-stock-taking-list.type'

// Masters in StockOpname List
export type TStockOpnameEntity = {
  id: number
  name: string
  province: TCommonObject
  regency: TCommonObject
  type: number
  address: string
  tag: string
  updated_at: string
  location: string
}

export type TUserCreatedUpdatedBy = {
  id: number
  username: string
  firstname: string
  lastname?: string | null
  fullname: string
}

// Options in StockOpname List

export type TStockOpnameMaterial = {
  id: number
  name: string
  unit_of_distribution: string
  code: string
  description: string
  pieces_per_unit: number
  unit: string
  temperature_sensitive: number
  temperature_min: number | null
  temperature_max: number | null
  managed_in_batch: number
  status: number
  is_vaccine: number
  is_stockcount: number
  is_addremove: number
  updated_at: string
  is_openvial: number
  kfa_code: string | null
  need_sequence: number | null
  parent_id: number | null
  kfa_level_id: number
}

export type TStockOpnameBatch = {
  code: string | null
  expired_date: string | null
}

export type TStockOpnameData = {
  id: number
  si_no?: number
  recorded_qty: number
  actual_qty: number
  in_transit_qty: number
  created_at: string
  updated_at: string
  is_within_period: number
  entity: TStockOpnameEntity
  activity: TCommonObject
  material: TCommonObject
  parent_material: TCommonObject
  batch: TStockOpnameBatch | null
  period: TCommonObject & {
    cutoff_date: string | null
  }
  user_created_by: TUserCreatedUpdatedBy
  user_updated_by: TUserCreatedUpdatedBy
}

export type ListPeriodStockOpnameResponse = TCommonResponseList & {
  data: Array<TPeriodOfStockTaking>
}

// StockOpname List
export type ListStockOpnameResponse = TCommonResponseList & {
  data: Array<TStockOpnameData>
  statusCode: number
}

// StockOpname Params
export type ListStockOpnameParams = {
  page: number
  paginate: number
  expired_date_range?: {
    start: string
    end: string
  }
  created_at_range?: {
    start: string
    end: string
  }
  activity_id?: TSingleOptions | number
  material_id?: TSingleOptions | number
  material_type_id?: TSingleOptions | number
  period_id?: TSingleOptions | number
  batch_code?: string
  only_have_qty?: TSingleOptions | number
  entity_tag_id?: TSingleOptions | number
  entity_id?: TSingleOptions | number
  province_id?: TSingleOptions | number
  regency_id?: TSingleOptions | number
}

// Stock Opname Other Needs
export type TStockOpnameMainColumn = {
  t: TFunction<['common', 'stockOpname']>
  locale: string
}

export type TAncientResponse = {
  page: string | number
  perPage: string | number
  total: number
  statusCode: number
  list: Array<any>
}
