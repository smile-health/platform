import { OptionType } from '#components/react-select'
import { TCommonResponseList } from '#types/common'
import { TDetailActivityDate, TEntities } from '#types/entity'
import { TMaterial } from '#types/material'
import { Batch } from '#types/stock'

export type TDistributionDisposal = {
  id: number
  device_type: number
  customer_id: number
  vendor_id: number
  status: number
  type: number
  required_date: string | null
  estimated_date: string | null
  actual_shipment: string | null
  purchase_ref: string | null
  sales_ref: string | null
  reason: string | null
  cancel_reason: string | null
  delivery_number: string | null
  confirmed_at: string | null
  shipped_at: string
  fulfilled_at: string
  cancelled_at: string | null
  allocated_at: string | null
  created_at: string
  updated_at: string
  is_allocated: number
  taken_by_customer: number
  other_reason: string | null
  is_kpcpen: string | null
  qty_kpcpen: string | null
  master_order_id: string | null
  easygo_no_do: string | null
  biofarma_changed: string | null
  service_type: string | null
  no_document: string
  released_date: string | null
  notes: string | null
  activity_id: number
  is_manual: string | null
  no_po: string | null
  created_by: number
  validated_by: string | null
  validated_at: string | null
  customer: Customer
  vendor: Vendor
  activity: Activity
  order_tags: string | null[]
  user_confirmed_by: User | null
  user_shipped_by: User | null
  user_fulfilled_by: User | null
  user_cancelled_by: User | null
  user_allocated_by: User | null
  user_created_by: User | null
  user_updated_by: User | null
  user_deleted_by: User | null
  user_validated_by: User | null
  disposal_items: DetailDistributionDisposalItem[]
  disposal_comments: DetailDistributionDisposalComment[]
}

type Customer = {
  type_label: string
  id: number
  name: string
  address: string
  code: string
  type: number
  status: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  province_id: string
  regency_id: string
  village_id: string | null
  sub_district_id: string | null
  lat: string | null
  lng: string
  postal_code: string | null
  is_vendor: number
  bpom_key: string | null
  is_puskesmas: number
  rutin_join_date: string
  is_ayosehat: number
}

type Vendor = {
  type_label: string
  id: number
  name: string
  address: string
  code: string
  type: number
  status: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  province_id: string
  regency_id: string
  village_id: string | null
  sub_district_id: string
  lat: string | null
  lng: string
  postal_code: string | null
  is_vendor: number
  bpom_key: string | null
  is_puskesmas: number
  rutin_join_date: string
  is_ayosehat: number
}

type Activity = {
  id: number
  name: string
}

type User = {
  id: number
  username: string
  email: string
  firstname: string
  lastname: string | null
}

export type ListDistributionDisposalParams = {
  page: string | number
  paginate: string | number
  activity_id?: number
  customer_id?: number
  date_range?: { start: string; end: string }
  shipped_number?: string
  is_vendor?: number
  status?: number
  purpose?: string
  province_id?: number
  regency_id?: number
  entity_id?: number
  primary_vendor_id?: number
}

export type ListDistributionDisposalResponse = TCommonResponseList & {
  data: Array<TDistributionDisposal>
}

export type DetailDistributionDisposalItem = {
  allocated?: number
  shipped_qty?: number
  not_yet_shipped?: number
  id: number
  order_id: number
  material_id: number | null
  qty: number
  recommended_stock: number | null
  created_at: string
  reason_id: number | null
  other_reason: number | null
  confirmed_qty?: number
  order_item_kfa_id: number | null
  master_material: TMaterial
  disposal_shipment_stocks: TDistributionDisposalShipmentDetailStock[]
}

export type TDistributionDisposalShipmentDetailStock = {
  id: number
  disposal_item_id: number
  stock_id: number
  status: any
  allocated_qty: number
  received_qty: any
  ordered_qty: any
  fulfill_reason: any
  transaction_reasons: {
    id: number
    title: string
  }
  other_reason: any
  qrcode: any
  fulfill_status: any
  stock: DetailDistributionDisposalStock
  disposal_discard_qty: number | null
  disposal_received_qty: number | null
  order_stock_exterminations: OrderStockExtermination[]
}

export type TDistributionDisposalShipmentDetailStockReformed = {
  id: number
  batch?: Batch
  activity?: Activity
  accumulated_reasons: Array<{
    reason_id: number
    reason: string
    qty: number
  }>
  disposal_discard_reasons: Array<{
    reason_id: number
    reason: string
    qty: number
  }>
  disposal_received_reasons: Array<{
    reason_id: number
    reason: string
    qty: number
  }>
  received_qty?: number | null
}

export type TUpdateReceivedStock = {
  confirmed_qty?: number | null
  disposal_item_id?: number
  disposal_shipment_item_id?: number
  stock_members: Array<TDistributionDisposalShipmentDetailStockReformed>
}

export type TSubmitUpdateReceivedStock = {
  comment?: string
  items: TUpdateReceivedStock[]
}

type DetailDistributionDisposalStock = {
  available: number
  stock_id: number
  id: number
  material_entity_id: any
  batch_id: number
  status: any
  qty: number
  created_by: number
  updated_by: number
  updated_at: string
  created_at: string
  allocated: number
  open_vial: number
  activity_id: number
  year: any
  price: any
  total_price: any
  budget_source: any
  batch: DetailDistributionDisposalBatch
  activity: DetailDistributionDisposalActivity
}

type DetailDistributionDisposalBatch = {
  manufacture_name: string
  id: number
  code: string
  expired_date: string
  production_date: string
  manufacture_id: number
  status: number
  manufacture: {
    name: string
  }
}

type DetailDistributionDisposalActivity = {
  id: number
  name: string
  is_ordered_sales: number
  is_ordered_purchase: number
  is_patient_id: number
}

export type OrderStockExtermination = {
  id: number
  order_stock_id: number
  stock_extermination_id: number
  status: number
  allocated_discard_qty: number
  allocated_received_qty: number
  received_qty: number
  stock_extermination: StockExtermination
}

type StockExtermination = {
  extermination_ready_qty: number
  id: number
  stock_id: number
  transaction_reason_id: number
  extermination_discard_qty: number
  extermination_received_qty: number
  extermination_qty: number
  extermination_shipped_qty: number
  transaction_reason: {
    title: string
  }
}
type TransactionReason = {
  id: number
  title: string
  title_en: string
}

type DisposalStock = {
  material_id: number
  stock_id: number
  disposal_stock_id: number
  disposal_qty: number
  disposal_discard_qty: number
  disposal_received_qty: number
  disposal_shipped_qty: number
  updated_at: string // or `Date` if you plan to convert it
  transaction_reason_id: number
  transaction_reason: TransactionReason
}

export type DetailDistributionDisposalComment = {
  id: number
  comment: any
  created_at: string
  disposal_shipment_status: number
  user: User
}

export type CreateDetailDistributionDisposalCommentPayload = {
  comment: string
}

export type CreateDetailDistributionDisposalCommentBody = {
  comment: string
}

export type CreateDetailDistributionDisposalResponse = {
  id: number
  comment: string
  order_status: number
  user_created_by: User
  user_updated_by: User
  user_deleted_by: any
}

export type CreateDetailDistributionDisposalDetailReceived = {
  stocks: Array<{
    id: number
    allocated_qty: number
    received_qty: number
    stock: DetailDistributionDisposalStock
  }>
}

export type DetailDistributionDisposalReceivedItem = {
  id: number
  name: string
  shipped_qty: number
  received_qty: number
} & CreateDetailDistributionDisposalDetailReceived

export type CreateDetailDistributionDisposalReceivedPayload = {
  comment: string
  items: DetailDistributionDisposalReceivedItem[]
}

export type CreateDetailDistributionDisposalReceived =
  CreateDetailDistributionDisposalReceivedPayload

export type DistributionDisposalStockExterminationForm = {
  pieces_per_unit: number
  discard_qty?: number
  received_qty?: number
  extermination_discard_qty: number
  extermination_received_qty: number
  stock_extermination_id: number
  transaction_reason_title: string
  transaction_reason_title_en: string
  transaction_reason_id: number
}

export type DistributionDisposalStockForm = {
  activity_id: number
  activity_name: string
  batch?: {
    code: string
    id: number
    manufacture_name: string
    expired_date: string
    production_date: string
  }
  stock_id: number
  stock_qty: number
  extermination_discard_qty: number
  extermination_received_qty: number
  stock_exterminations: DistributionDisposalStockExterminationForm[]
}

export type DistributionDisposalOrderItemForm = {
  material_id: number
  material_name: string
  managed_in_batch: number
  activity_name: string
  ordered_qty: number
  is_valid: boolean
  stocks?: {
    activity_id: number
    activity_name: string
    batch?: {
      code: string
      id: number
      manufacture_name: string
      expired_date: string
      production_date: string
    }
    stock_id: number
    stock_qty: number
    extermination_discard_qty: number
    extermination_received_qty: number
    stock_exterminations?: {
      pieces_per_unit: number
      discard_qty: undefined | number
      received_qty: undefined | number
      stock_extermination_id: number
      transaction_reason_id: number
      transaction_reason_title: string
      transaction_reason_title_en: string
      extermination_discard_qty: number
      extermination_received_qty: number
    }[]
  }[]
}

export type DistributionDisposalForm = {
  activity?: OptionType
  sender?: OptionType | null
  receiver?: OptionType | null
  order_items: DistributionDisposalOrderItemForm[]
}

export type DistributionDisposalConfirmationForm = {
  no_document: string
  comment: string
}

export type DistributionDisposalStockExterminationsPayload = {
  discard_qty: number
  received_qty: number
  disposal_stock_id: number
  transaction_reasons: {
    id: number
  }
}

export type DistributionDisposalStocksPayload = {
  activity_id: number
  activity_name: string
  batch: {
    code: string
    id: number
  } | null
  stock_id: number
  stock_qty: number
  disposal_stocks: DistributionDisposalStockExterminationsPayload[]
}

export type DistributionDisposalOrderItemsPayload = {
  material_id: number
  material_name: string
  shipment_qty: number
  stocks: DistributionDisposalStocksPayload[]
}

export type CreateDistributionDisposalPayload = {
  activity_id: number
  customer_id: number
  flow_id: number
  is_allocated: number
  no_document: string
  disposal_comments: string
  disposal_items: DistributionDisposalOrderItemsPayload[]
  type: number
  vendor_id: number
  follow_up_action_id?: number | null
}

export type ListStockExtermination = {
  activity: Activity
  stock_update: string
  total_disposal_ready_qty: number
  id: number
  material_id: number
  entity_id: number
  stock_last_update: string
  total_disposal_discard_qty: number
  total_disposal_received_qty: number
  total_disposal_shipped_qty: number
  total_disposal_qty: number
  material: TMaterial
  entity: TEntities
  stocks: Array<{
    stock_id: number
    disposal_ready_qty: number
    id: number
    entity_has_material_id: number
    batch_id: number
    status: number | null
    activity_id: number
    disposal_discard_qty: number
    disposal_received_qty: number
    disposal_qty: number
    disposal_shipped_qty: number
    batch: {
      manufacture_name: string
      id: number
      code: string
      expired_date: string
      production_date?: string
      manufacture_id: number
      status: number
      manufacture: {
        name: string
        address?: string
      }
    }
    activity: Activity
    disposals: DisposalStock[]
  }>
}

export type ListStockExterminationResponse = TCommonResponseList & {
  statusCode: number
  total: number
  page: string
  perPage: string
  list: ListStockExtermination[]
  data: []
}

export type ListStockExterminationParams = {
  flow_id?: number
  only_have_qty?: number
  activity_id?: number
  entity_id?: number
  keyword?: string
  page: number
  paginate: number
  material_level_id?: number
}

export type listEntityActivitiesReponse = TDetailActivityDate[]

export type listEntityActivitiesParams = {
  id: string
  params?: {
    is_ordered_purchase?: number
    entity_id?: string
  }
}

export type ListEntitiesResponse = TCommonResponseList & {
  data: TEntities[]
  statusCode: number
}

export type DisposalItemStockDetail = {
  parent_material_id: number
  updated_at: string
  entity_id: number
  total_disposal_qty: number
  total_disposal_discard_qty: number
  total_disposal_received_qty: number
  total_disposal_shipped_qty: number
  material_id: number
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
    companions: any[]
    activities: {
      id: number
      name: string
    }[]
  }
  details: DisposalDetailItemStock[]
}

export type DisposalDetailItemStock = {
  activity_id: number
  material_id: number
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
  disposal_qty: number
  disposal_discard_qty: number
  disposal_received_qty: number
  disposal_shipped_qty: number
  updated_at: string
  activity: {
    id: number
    name: string
    code: string | null
  }
  history: {
    total_disposal_shipment: number
    total_self_disposal: number
  }
  stocks: {
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
    disposals: {
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
    }[]
  }[]
}

export type DisposalDetailStock = {
  activity_id: number
  activity_name: string
  batch?: {
    code: string
    id: number
    manufacture_name: string
    expired_date: string
    production_date: string
  }
  stock_id: number
  stock_qty: number
  extermination_discard_qty: number
  extermination_received_qty: number
  stock_exterminations?: {
    pieces_per_unit: number
    discard_qty: undefined | number
    received_qty: undefined | number
    stock_extermination_id: number
    transaction_reason_id: number
    transaction_reason_title: string
    transaction_reason_title_en: string
    extermination_discard_qty: number
    extermination_received_qty: number
  }[]
}
