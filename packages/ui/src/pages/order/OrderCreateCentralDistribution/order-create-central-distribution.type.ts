import { OptionType } from '#components/react-select'
import { TInfoUserCreated } from '#types/common'
import { TProgram } from '#types/program'

import { MaterialCompanions } from '../order.type'

export type TContractNumber = {
  id: number
  contract_number: string
  created_at: string
  created_by: number
  deleted_at: string
  deleted_by: number
  updated_at: string
  updated_by: number
}

export type TOrderFormValues = TOrderFormInputValues & {
  order_items: TOrderFormItemsValues[]
}

export type TOrderFormInputValues = {
  vendor: OptionType | null
  activity: OptionType | null
  customer: OptionType | null
  delivery_type_id: number | null
  required_date: string | null
  do_number: string
  po_number: OptionType | null
  order_comment: string
}

export type TOrderFormItemsValues = {
  id?: number
  name?: string
  pieces_per_unit?: number
  is_managed_in_batch?: number
  companions?: MaterialCompanions[]
  unit?: string
  stocks: TOrderFormItemStocksValues[]
}

export type TOrderFormItemStocksValues = {
  activity_id: number | null
  expired_date: string | null
  manufacturer: {
    value: string
    label: string
  } | null
  production_date: string | null
  ordered_qty?: number | null
  batch_code: string | null
  budget_year: string | null
  budget_source: {
    value: string
    label: string
  } | null
  price?: number | null
  total_price?: number | null
}

export type TDrawerQuantity = {
  open: boolean
  index: number
  data: TOrderFormItemsValues | null
}

export type TOrderItem = {
  material_id: number
  is_managed_in_batch: boolean
  stocks: TOrderStock[]
}

export type TOrderStock = {
  activity_id: number
  expired_date: string
  manufacture_name: string
  production_date: string
  ordered_qty: number
  batch_code: string
  budget_year: string
  budget_source_id: string
  total_price: number
}

export type TEntityMasterMaterial = {
  id: number
  entity_id: number
  material_id: number
  activity_id: number
  min: number
  max: number
  consumption_rate: number
  retailer_price: number
  tax: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: number
  updated_by: number
  deleted_by: number | null
  global_id: number
  parent_global_id: number | null
  parent_id: number | null
  program_id: number
  status: number
  is_open_vial: number
  is_addremove: number
  name: string
  description: string
  material_level_id: number
  code: string
  hierarchy_code: string
  unit_of_consumption_id: number
  unit_of_consumption: string
  unit_of_distribution: string
  unit_of_distribution_id: number
  consumption_unit_per_distribution_unit: number
  is_temperature_sensitive: number
  min_retail_price: number
  max_retail_price: number
  min_temperature: number
  max_temperature: number
  material_type_id: number
  material_type: string
  is_managed_in_batch: number
  entity_master_material: {
    id: number
    material_id: number
    entity_id: number
    min: number
    max: number
    total_allocated_qty: number
    total_available_qty: number
    updated_at: string
  }
  activity: {
    id: number
    name: string
  }
  entity_master_material_activities_id: number
  material_companions: MaterialCompanions[]
}

export type TEntityMaterial = {
  material_id: number
  name: string
  min_temperature: number
  max_temperature: number
  entity_master_materials: TEntityMasterMaterial[]
}

export type DetailBudgetSourceResponse = {
  created_at: string
  created_by: number
  description: string | null
  id: number
  name: string
  updated_at: string
  user_created_by: TInfoUserCreated
  user_updated_by: TInfoUserCreated
  programs: TProgram[]
}

export type PopulatedBatchAndManufacturer = {
  manufacturer_id?: string | null
  batch_code?: string | null
}