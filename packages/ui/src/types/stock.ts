import { OptionType } from '#components/react-select'

import { TCommonObject } from './common'

export type MaterialStock = {
  id: number
  global_id: number
  parent_global_id: null | number
  program_id: number
  status: number
  name: string
  description: string
  material_level_id: number
  code: string
  hierarchy_code: null | string
  unit_of_consumption_id: number
  unit_of_consumption?: string
  unit_of_distribution_id: number
  consumption_unit_per_distribution_unit: number
  is_temperature_sensitive: number
  is_open_vial: number
  min_retail_price: number
  max_retail_price: number
  min_temperature: number
  max_temperature: number
  material_type_id: number
  is_managed_in_batch: number
  is_stock_opname_mandatory: number
  created_by: number
  updated_by: number
  deleted_by: number | null
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  companions: {
    id: number
    name: string
  }[]
  activities?: Array<{
    id: number
    name: string
  }>
}

export type MaterialEntity = {
  id: number
  name: string
  type: number
  address: string | null
  tag: string | null
  location: string | null
  updated_at?: string | null
}

export type AggregateStock = {
  max: number
  min: number
  total_allocated_qty: number
  total_available_qty: number
  total_in_transit_qty: number
  total_open_vial_qty: number
  total_qty: number
  updated_at: string
}

export type StockProtocol = {
  key: string
  material_id: number
  activity_id: number
  is_sequence: number
  is_patient_needed: number
  protocol_id?: number
}

export type Stock = {
  total_qty: number
  total_allocated_qty: number
  total_available_qty: number
  total_in_transit_qty: number
  total_open_vial_qty: number
  min: number
  max: number
  updated_at: string
  material?: MaterialStock
  entity?: MaterialEntity
  details?: DetailStock[]
  aggregate?: AggregateStock
  protocol?: StockProtocol
  last_opname_date?: string | null
  material_level_id?: number | null
  activity?: {
    id: number
    name: string
  }
}

export type Activity = {
  id: number
  name: string
}

export type BudgetSource = {
  id: number
  name: string
  is_restricted: number
}

export type Batch = {
  id?: number
  code: string
  production_date: string
  expired_date: string
  manufacture: {
    id?: number
    name: string
    address?: string
  }
  manufacture_name?: string
}

type SourceMaterial = {
  created_at: string
  deleted_at: null
  id: number
  name: string
  updated_at: string
}

export type StockDetailStock = {
  id: number
  batch: Batch | null
  budget_source: BudgetSource | null
  qty: number
  input_qty?: number | null
  allocated_qty: number
  available_qty: number
  open_vial_qty: number
  in_transit_qty: number
  price: number
  min: number
  max: number
  total_price: number
  unreceived_qty: number
  year: string | null
  updated_at: null | string
  activity: Activity
  shipped_qty: number
  material_status?: TCommonObject | OptionType | null
  transaction_reason?: OptionType | null
  other_reason?: string | null
  ordered_qty?: number
}

export type MaterialDetailStock = {
  id: number
  material_level_id: number
  name: string
  is_temperature_sensitive: number
  is_open_vial: number
  is_managed_in_batch: number
  is_stock_opname_mandatory: number
  unit_of_consumption: string
  consumption_unit_per_distribution_unit: number
  activities?: Array<{
    id: number
    name: string
  }>
}

export type DetailStock = {
  activity?: TCommonObject | null
  material?: MaterialDetailStock | null
  total_qty: number
  total_allocated_qty: number
  total_available_qty: number
  total_open_vial_qty: number
  total_in_transit_qty: number
  min: number
  max: number
  updated_at: string
  stocks: StockDetailStock[]
  last_opname_date?: string | null
  details?: {
    activity?: TCommonObject | null
    material?: MaterialDetailStock | null
    total_qty: number
    total_allocated_qty: number
    total_available_qty: number
    total_open_vial_qty: number
    total_in_transit_qty: number
    min: number
    max: number
    updated_at: string
    stocks: StockDetailStock[]
    last_opname_date?: string | null
  }[]
}

export type BatchTrademarkStock = {
  id: number
  activity: Activity
  batch: Batch
  on_hand_stock: number
  allocated_qty: number
  qty: number
  updated_at: string
  source_material: SourceMaterial
}

export type TrademarkStock = {
  material: {
    description: string
    id: number
    is_managed_in_batch: number
    name: string
  }
  total_on_hand_stock: number
  total_allocated_qty: number
  total_qty: number
  min: number
  max: number
  updated_at: string
  stocks: BatchTrademarkStock[]
}
