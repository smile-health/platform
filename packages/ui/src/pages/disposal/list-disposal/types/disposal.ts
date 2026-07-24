export type Disposal = {
  details: StockDisposal[]
  entity: Entity
  entity_id: number
  material: Material
  material_id: number
  stock_update: string
  total_disposal_discard_qty: number
  total_disposal_qty: number
  total_disposal_received_qty: number
  total_disposal_shipped_qty: number
  // Legacy fields for backward compatibility
  id?: number
  material_id?: number
  stock_last_update?: string
  extermination_discard_qty?: number
  extermination_received_qty?: number
  extermination_shipped_qty?: number
  extermination_qty?: number
  stocks?: StockDisposal[]
}

type Material = {
  id: number
  name: string
  unit_of_distribution: string
  code: string
  description: string
  pieces_per_unit: number
  unit: string
  temperature_sensitive: number
  temperature_min: number
  temperature_max: number
  managed_in_batch: number
  status: number
  is_vaccine: number
  is_stockcount: number
  is_addremove: number
  updated_at: string
  is_openvial: number
  kfa_code: any
  need_sequence: any
  parent_id: any
  kfa_level_id: number
  material_companion: MaterialCompanion[]
}

type MaterialCompanion = {
  id: number
  name: string
  code: string
  description: string
}

type Entity = {
  type_label: string
  id: number
  name: string
  address: string
  code: string
  type: number
  status: number
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  province_id: string | null
  regency_id: string | null
  village_id: string | null
  sub_district_id: string | null
  lat: string | null
  lng: string | null
  postal_code: string | null
  is_vendor: number
  bpom_key: string | null
  is_puskesmas: number
  rutin_join_date: string | null
  is_ayosehat: number
  province: {
    id: string
    name: string
  } | null
  regency: {
    id: string
    name: string
  } | null
  sub_district: {
    id: string
    name: string
  } | null
  village: {
    id: string
    name: string
  } | null
  entity_tags: EntityTag[]
}

type EntityTag = {
  id: number
  entity_entity_tags: EntityEntityTags
}

type EntityEntityTags = {
  entity_id: number
  entity_tag_id: number
}

export type StockDisposal = {
  activity_id: number
  material_id: number
  disposal_qty: number
  disposal_discard_qty: number
  disposal_received_qty: number
  disposal_shipped_qty: number
  updated_at: string
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
    companions: any[]
    activities: {
      id: number
      name: string
    }[]
  }
  activity: {
    id: number
    name: string
    code: string | null
  }
  stocks: Array<{
    id: number
    material_id: number
    disposal_qty: number
    disposal_discard_qty: number
    disposal_received_qty: number
    disposal_shipped_qty: number
    activity: {
      id: number
      name: string
      code: string | null
    }
    batch: {
      id: number
      code: string
      production_date: string
      expired_date: string
      manufacture: {
        id: number
        name: string
        address: string | null
      }
    }
    updated_at: string
    disposals: Array<{
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
    }>
  }>
}

export interface Batch {
  manufacture_name: string
  id: number
  code: string
  expired_date: string
  production_date: string
  manufacture_id: number
  status: number
  manufacture: Manufacture
}

export interface Manufacture {
  name: string
  address: string
}

export interface StockExtermination {
  extermination_ready_qty: number
  id: number
  stock_id: number
  transaction_reason_id: number
  extermination_discard_qty: number
  extermination_received_qty: number
  extermination_qty: number
  extermination_shipped_qty: number
  transaction_reason: TransactionReason
}

export interface TransactionReason {
  id: number
  title: string
  title_en: string
  transaction_type_id: number
  is_other: number
  is_purchase: number
  createdAt: string
  updatedAt: number | null
  deletedAt: number | null
}

export interface Activity {
  id: number
  name: string
  is_ordered_sales: number
  is_ordered_purchase: number
  is_patient_id: number
}

export type ListDisposalParams = {
  page?: string | number
  paginate?: string | number
  activity_id?: string
  batch_ids?: string
  entity_id?: string
  entity_tag_id?: string
  expired_from?: string
  expired_to?: string
  is_vaccine?: string
  material_id?: string
  only_have_qty?: string
  province_id?: string
  regency_id?: string
  keyword?: string
  // Legacy parameters for backward compatibility
  entity_user_id?: number
  material_type_id?: number
  primary_vendor_id?: number
  material_level_id?: string
  with_details?: number
}

export type ListDisposalResponse = {
  data: Array<Disposal>
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
  // Legacy fields for backward compatibility
  statusCode?: number
  total?: number
  perPage?: string
  list?: Array<Disposal>
}
