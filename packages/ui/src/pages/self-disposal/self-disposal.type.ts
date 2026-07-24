import { OptionType } from '#components/react-select'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import { TEntities } from '#types/entity'

export type ListEntitiesResponse = TCommonResponseList & {
  data: TEntities[]
  statusCode: number
}

// List Stock
export type ListStockParams = TCommonFilter & {
  entity_id?: number
  activity_id?: number
  flow_id?: number
  material_level_id?: number
  only_have_qty?: number
}

type Entity = {
  id: number
  name: string
  type: number
  address: string
  tag: string
  updated_at: string
  location: string
}

type Material = {
  id: number
  name: string
  material_level_id: number
  is_temperature_sensitive: number
  is_open_vial: number
  is_managed_in_batch: number
  unit_of_consumption: string
  consumption_unit_per_distribution_unit: number
  status: number
  companions: any[]
  activities: Array<{
    id: number
    name: string
  }>
}

type Manufacture = {
  id: number
  name: string
  address?: string
}

type Disposal = {
  material_id: number
  stock_id: number
  disposal_stock_id: number
  disposal_qty: number
  disposal_discard_qty: number
  disposal_received_qty: number
  disposal_shipped_qty: number
  updated_at: string
  transaction_reason_id: number
  transaction_reason: {
    id: number
    title: string
    title_en: string
  }
}

type Batch = {
  id: number
  code: string
  production_date: string
  expired_date: string
  manufacture: Manufacture
}

type DetailStock = {
  id: number
  material_id: number
  disposal_qty: number
  disposal_discard_qty: number
  disposal_received_qty: number
  disposal_shipped_qty: number
  batch: Batch | null
  updated_at: string
  disposals: Disposal[]
}

type Detail = {
  activity_id: number
  material_id: number
  material: Material
  disposal_qty: number
  disposal_discard_qty: number
  disposal_received_qty: number
  disposal_shipped_qty: number
  updated_at: string
  activity: {
    id: number
    name: string
  }
  history: {
    total_disposal_shipment: number
    total_self_disposal: number
  }
  stocks: DetailStock[]
}

export type Stock = {
  parent_material_id: number
  updated_at: string
  entity_id: number
  total_disposal_qty: number
  total_disposal_discard_qty: number
  total_disposal_received_qty: number
  total_disposal_shipped_qty: number
  material_id: number
  entity: Entity
  material: Material
  details: Detail[]
}
export type ListStockResponse = TCommonResponseList & {
  data: Stock[]
  statusCode: number
}

//List Self Disposal

export type ListSelfDisposalParams = {
  keyword?: string
  page?: number
  paginate?: number
  activity_id?: number
}

export type SelfDisposalItem = {
  id: number
  entity_id: number
  activity_id: number
  report_number: string
  created_by: number
  updated_by: number
  created_at: string
  stock_disposal_id: number
  opening_qty: number
  change_qty: number
  closing_qty: number
  comment: string
  disposal_transaction_type_id: number
  disposal_discard_qty: null | number
  disposal_received_qty: null | number
  disposal_transaction_type: {
    id: number
    title: string
  }
  disposal_method_id: number
  disposal_method: {
    id: number
    title: string
  }
  entity: {
    id: number
    name: string
    type: number
    address: string
    tag: string
    updated_at: string
    location: string
  }
  material: {
    id: number
    name: string
    material_level_id: number
    is_temperature_sensitive: number
    is_open_vial: number
    is_managed_in_batch: number
    unit_of_consumption: string
    consumption_unit_per_distribution_unit: number
    status: number
    companions: Array<{
      id: number
      name: string
    }>
    activities: Array<{
      id: number
      name: string
    }>
  }
  material_id: number
  transaction_reason: {
    id: number
    title: string
  }
  activity: {
    id: number
    name: string
  }
  user_created: {
    id: number
    username: string
    firstname: string
    lastname: string
    fullname: string
  }
  user_updated: {
    id: number
    username: string
    firstname: string
    lastname: string
    fullname: string
  }
  disposal_stock: {
    id: number
    stock_id: number
    entity_id: number
    batch_id: number
    material_id: number
    activity_id: number
    transaction_reason_id: number
    disposal_qty: number
    disposal_discard_qty: number
    disposal_received_qty: number
    disposal_shipped_qty: number
    updated_at: string
    batch: {
      id: number
      code: string
      production_date: string
      expired_date: string
      manufacture: {
        id: number
        name: string
        address: any
      }
    }
    activity: {
      id: number
      name: string
      code: any
    }
    transaction_reason: {
      id: number
      title: string
      title_en: string
    }
  }
}

export type ListSelfDisposalResponse = TCommonResponseList & {
  data: Array<SelfDisposalItem>
}

type ValueEntity = {
  type: 'entity'
  value: OptionType | null
}
type ValueActivity = {
  type: 'activity'
  value: OptionType | null
}
type ValueFlow = {
  type: 'flow'
  value: OptionType | null
}
type ValueMaterial = {
  type: 'material'
  value: number
}

export type ValueChange = ValueEntity | ValueActivity | ValueFlow | ValueMaterial
