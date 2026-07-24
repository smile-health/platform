import { OptionType } from '#components/react-select'
import { TCommonResponseList } from '#types/common'
import { Stock, StockDetailStock } from '#types/stock'

import { OrderStatusEnum, OrderTypeEnum } from '../order.constant'
import { TOrderIntegrationType } from '../OrderList/order-list.type'

// =========================================================
// API Response
// =========================================================

export interface OrderDetailResponse {
  activity: OrderDetailActivity
  actual_shipment_date: null | string
  allocated_at: null | string
  cancelled_at: null | string
  confirmed_at: null | string
  created_at: null | string
  drafted_at: null | string
  customer: OrderDetailCustomerVendor
  customer_id: number
  deleted_at: null | string
  delivery_number: null | string
  delivery_type?: null | string
  device_type: number
  doc_no?: null | string
  estimated_date: null | string
  fulfilled_at: null | string
  id: number
  notes?: null | string
  order_comments: OrderDetailComment[]
  order_items: OrderDetailItem[]
  order_item_projection_capacities?: OrderItemProjectionCapcity[]
  po_no?: null | string
  purchase_ref: null | string
  required_date: null | string
  sales_ref: null | string
  shipped_at: null | string
  status: OrderStatusEnum
  taken_by_customer: number
  type: OrderTypeEnum
  updated_at: string
  metadata: null | OrderDetailMetadata
  user_allocated_by: null | OrderDetailUser
  user_cancelled_by: null | OrderDetailUser
  user_confirmed_by: null | OrderDetailUser
  user_drafted_by: OrderDetailUser
  user_created_by: OrderDetailUser
  user_deleted_by: null | OrderDetailUser
  user_fulfilled_by: null | OrderDetailUser
  user_validated_by: null | OrderDetailUser
  user_shipped_by: null | OrderDetailUser
  user_updated_by: null | OrderDetailUser
  vendor: OrderDetailCustomerVendor
  vendor_id: number
}

export type OrderItemProjectionCapcity = {
  capacity_asset: number
  created_at: string
  deleted_at: null | string
  id: number
  is_confirm: number
  order_id: number
  percent_capacity: number
  total_volume: number
  updated_at: null | string
}

export type OrderDetailActivity = {
  id: number
  name: string
}

export type OrderDetailCustomerVendor = {
  address: string
  id: number
  name: string
  status: number
  type: number
}

export type OrderDetailComment = {
  comment: string
  created_at: string
  id: number
  order_status: OrderStatusEnum
  user: OrderDetailUser
}

export type OrderDetailMetadata = {
  client_key?: TOrderIntegrationType
  key_ssl?: string
  category?: string
  total_patients?: number
}

export type OrderDetailUser = {
  firstname: string
  id: number
  lastname: string | null
}

export type ChildrenMaterial = {
  id: number
  name: string
  code?: string
  type?: string
  kfa_level_id?: number | null
  kfa_level_name?: string | null
  unit_of_consumption?: string | null
  unit_of_distribution?: string | null
  consumption_unit_per_distribution_unit: number
  is_managed_in_batch: number
  pieces_per_unit?: number
}

export interface ChildrenStocks {
  id: number
  stock_id: number
  activity_id: number
  activity_name: string
  status: number
  allocated_qty: number
  shipped_qty: number
  received_qty: number
  batch_id: number
  batch: Batch
}

export interface Batch {
  id: number
  code: string
  expired_date: string
  production_date: any
  manufacture_name: any
}

export type OrderDetailChildren = {
  allocated_qty?: number
  confirmed_qty?: number | null
  ordered_qty?: number | null
  material?: ChildrenMaterial
  id?: number
  material_id?: number
  qty?: number
  shipped_qty?: number
  stock_customer?: OrderDetailItemStockCustomerVendor
  stock_vendor?: OrderDetailItemStockCustomerVendor
  order_stocks?: ChildrenStocks[]
}

export type ChildrenStockCustomer = {
  allocated_stock: number
  available_stock: number
  entity_id: number
  id: number
  max: number
  min: number
  on_hand_stock: number
  stock_update: string
}

export type ChildrenStockVendor = {
  allocated_stock: number
  available_stock: number
  confirmation_stock: number
  entity_id: number
  id: number
  max: number
  min: number
  on_hand_stock: number
  stock_update: string
}

export type OrderDetailItem = {
  shipped_qty?: number | null
  fulfilled_qty?: number | null
  allocated_qty?: number | null
  confirmed_qty?: number | null
  ordered_qty?: number | null
  validated_qty?: number | null
  created_at: string
  children?: OrderDetailChildren[]
  id: number
  material: OrderDetailItemMaterial
  order_id: number
  order_item_kfa_id?: number | null
  order_stocks: OrderDetailStock[]
  other_reason?: string | null
  qty: number
  reason: {
    id: number
    name: string
  }
  recommended_stock?: number | null
  stock_customer: OrderDetailItemStockCustomerVendor
  stock_vendor?: OrderDetailItemStockCustomerVendor
}

export type OrderDetailItemMaterial = {
  code: string
  consumption_unit_per_distribution_unit: number
  id: number
  is_managed_in_batch: number
  is_temperature_sensitive: number
  kfa_level_id: number | null
  kfa_level_name: string | null
  name: string
  pieces_per_unit: number
  material_level_id: number
  type: string
  unit_of_consumption: string
  unit_of_distribution: string
}

export type OrderDetailStock = {
  activity_id: number
  activity_name: string
  allocated_qty: number | null
  validated_qty: number | null
  batch: OrderDetailStockBatch
  batch_id: number
  confirmed_qty: number
  id: number
  order_item_id: number
  ordered_qty: number
  received_qty: number | null
  shipped_qty: number | null
  status: number // depend on is_temperature_sensitive, ex; VVMA, VVMB, VVMC, VVMD
  stock_id: number
  children?: OrderDetailChildren[]
}

export type OrderDetailStockBatch = {
  code: string
  expired_date: string
  id: number
  manufacture_name: string
  production_date: string
}

export type OrderDetailItemStockCustomerVendor = {
  id?: number
  entity_id?: number
  material_id?: number
  max: number
  min: number
  program_id?: number
  total_allocated_qty: number
  total_available_qty: number
  total_exterminated_qty?: number
  total_in_transit_qty?: number
  total_open_vial_qty?: number
  total_available_qty_activity?: number
  total_qty: number
  updated_at?: null | string
}

// =========================================================
// Feature: Add Order Item
// =========================================================

export type CreateOrderDetailItemFormValues = {
  order_item_kfa_id: number | null
  material_id?: number
  ordered_qty?: number | null
  order_reason_id?: OptionType | null
  other_reason?: string | null
  recommended_stock?: number | null
  children?: OrderDetailItem['children']
}

export type CreateOrderDetailItemPayload = {
  order_items: Array<
    Required<
      Omit<CreateOrderDetailItemFormValues, 'order_reason_id' | 'children'>
    > & {
      order_reason_id: number
      children?: CreateOrderDetailItemFormValues['children']
    }
  >
}

export interface CreateOrderDetailItemResponseError {
  order_items: Array<Record<keyof CreateOrderDetailItemFormValues, string[]>>
}

// =========================================================
// Feature: Edit Order Item
// =========================================================

export type UpdateOrderDetailItemFormValues = Omit<
  CreateOrderDetailItemFormValues,
  'order_item_kfa_id' | 'material_id'
> & {
  id?: number
  ordered_qty?: OrderDetailItem['qty'] | null
  order_reason_id?: OptionType | null
  other_reason: OrderDetailItem['other_reason']
  recommended_stock?: OrderDetailItem['recommended_stock']
  children?: OrderDetailItem['children']
}

export type UpdateOrderDetailItemPayload = {
  order_items: Array<
    Required<
      Omit<UpdateOrderDetailItemFormValues, 'order_reason_id' | 'children'>
    > & {
      order_reason_id: number
      children?: UpdateOrderDetailItemFormValues['children']
    }
  >
}

export interface UpdateOrderDetailItemResponseError {
  order_items: Array<Record<keyof UpdateOrderDetailItemFormValues, string[]>>
}

// =========================================================
// Feature: Comment
// =========================================================

export type CreateOrderDetailCommentPayload = {
  comment: string | undefined
}

// =========================================================
// Feature: Cancel Order
// =========================================================

export type UpdateOrderStatusToCancelFormValues = {
  cancel_reason_id?: OptionType | null
  other_reason: string
  comment: string
}

export type UpdateOrderStatusToCancelPayload = {
  order_cancel_reason_id: number
  other_reason: string
  comment: string
}

export interface UpdateOrderDetailItemResponseError
  extends Record<keyof UpdateOrderStatusToCancelFormValues, string[]> {}

// =========================================================
// Feature: Confirm Order
// =========================================================

export type OrderItemsStatusToConfirmFormValues = {
  id: OrderDetailItem['id']
  confirmed_qty?: OrderDetailItem['confirmed_qty']
}

export type OrderItemsStatusToConfirmHierarchyFormValues = {
  material_id?: OrderDetailItem['id']
  id: OrderDetailItem['id']
  confirmed_qty?: OrderDetailItem['confirmed_qty']
}

export interface UpdateOrderStatusToPendingFromDraftFormValues {
  order_items?: Array<{
    id: OrderDetailItem['id']
    validated_qty?: OrderDetailItem['validated_qty']
  }>
  comment?: string
  letter_number?: string
}

export type UpdateOrderStatusToPendingFromDraftPayload =
  UpdateOrderStatusToPendingFromDraftFormValues

export interface UpdateOrderStatusToPendingFromDraftResponseError {
  order_items: Array<Record<'id' | 'validated_qty', string[]>>
  comment: string[]
  letter_number: string[]
}

export type OrderDetailValidateDrawerFormValues = {
  order_items?: UpdateOrderStatusToPendingFromDraftFormValues['order_items']
}

export interface UpdateOrderStatusToConfirmFormValues {
  order_items?: Array<{
    id: OrderDetailItem['id']
    confirmed_qty?: OrderDetailItem['confirmed_qty']
  }>
  comment?: string
}

export type OrderDetailConfirmDrawerFormValues = {
  order_items?: UpdateOrderStatusToConfirmFormValues['order_items']
}

export type UpdateOrderStatusToConfirmHierarchyFormValues = {
  order_items?: Array<
    OrderItemsStatusToConfirmHierarchyFormValues & OrderDetailItem
  >
  comment?: string
}

export type OrderDetailConfirmDrawerHierarchyFormValues = {
  order_items?: UpdateOrderStatusToConfirmHierarchyFormValues['order_items']
}

export type UpdateOrderStatusToConfirmPayload =
  UpdateOrderStatusToConfirmFormValues

export interface UpdateOrderStatusToConfirmResponseError {
  order_items: Array<Record<'id' | 'confirmed_qty', string[]>>
  comment: string[]
}

export interface UpdateOrderHierarchyStatusToConfirmResponseError {
  order_items: Array<{
    confirmed_qty: string[]
    children: Array<Record<'material_id' | 'confirmed_qty', string[]>>
  }>
  comment: string[]
}

// =========================================================
// Feature: Allocate Order
// =========================================================

export interface OrderDetailAllocateFormValues {
  order_items: Array<OrderDetailAllocateFormValuesOrderItem>
}

export interface OrderDetailAllocateHierarchyFormValues {
  order_items: Array<OrderDetailAllocateFormValueHierarchysOrderItem>
}

export interface OrderDetailAllocateFormValuesOrderItem {
  id?: number
  allocations?: Array<OrderDetailAllocateFormValuesOrderItemAllocation>
}

export interface OrderDetailAllocateFormValueHierarchysOrderItemAllocation {
  id?: number
  children?: {
    child_id?: number
    allocated_qty?: number
    allocations?: Array<OrderDetailAllocateChildrenFormValuesOrderItemHierarchyAllocation>
    confirmed_qty?: number | null
    kfa_level_id?: number | null
    order_stock_status_id?: OptionType | null
    _child_detail?: any
    _stock_of_detail_stock?: any
  }[]
  _order_item: OrderDetailItem
}

export interface OrderDetailAllocateFormValueHierarchysOrderItem {
  id?: number
  children?: {
    id?: number | null
    child_id?: number
    allocated_qty?: number
    order_stock_status_id?: OptionType
    allocations?: Array<OrderDetailAllocateChildrenFormValuesOrderItemHierarchyAllocation>
    _activity?: any
    _stock_vendor?: any
    _stock_customer?: any
    _child_detail?: any
    _stock_of_detail_stock?: any
    _child_of_detail_stock?: any
    _order_item_children?: any[]
    _vendor_stock?: any
    _customer?: any
    _vendor?: any
  }[]
  _order_item?: OrderDetailItem
  _vendor_stock?: any
  _customer?: any
  _vendor?: any
  _activity?: any
}

export type OrderDetailAllocateFormValuesOrderItemAllocation = {
  stock_id: number
  allocated_qty?: number | null
  order_stock_status_id?: OptionType | null
  _stock_of_detail_stock: StockDetailStock
}

export type OrderDetailAllocateChildrenFormValuesOrderItemHierarchyAllocation =
  {
    stock_id?: number
    allocated_qty?: number | null
    confirmed_qty?: number | null
    kfa_level_id?: number | null
    order_stock_status_id?: OptionType | null
    order_stocks?: {
      stock_id: number
      allocated_qty: number | undefined
      _stock_detail: StockDetailStock
      _stock_customer: OrderDetailItemStockCustomerVendor
      _stock_vendor: OrderDetailItemStockCustomerVendor
      _stock_material: any
    }[]
    _stock_detail?: any
    _stock_material?: any
    _stock_vendor?: any
    _stock_customer?: any
    _stock_of_detail_stock?: StockDetailStock
  }

export type OrderDetailAllocateBatchFormValuesOrderItemHierarchyAllocation = {
  stock_id: number
  allocated_qty?: number | null
  order_stock_status_id?: OptionType | null
  _stock_of_detail_stock: StockDetailStock
}

export interface UpdateOrderStatusToAllocatedPayload {
  order_items: Array<UpdateOrderStatusToAllocatedPayloadOrderItem>
}

export type UpdateOrderStatusToAllocatedPayloadOrderItem = {
  id: number
  allocations: Array<UpdateOrderStatusToAllocatedPayloadAllocation>
}

export type UpdateOrderStatusToAllocatedPayloadAllocation = Required<
  Omit<
    OrderDetailAllocateFormValuesOrderItemAllocation,
    '_stock_of_detail_stock' | 'order_stock_status_id'
  > & {
    order_stock_status_id: number | null
  }
>

// =========================================================
// Feature: Ship Order
// =========================================================
export interface UpdateOrderStatusToShippedPayload {
  sales_ref: string | null
  estimated_date: string | null
  taken_by_customer: number | null
  actual_shipment_date: string
  comment: string | null
}

export type OrderDetailShipFormValues =
  Partial<UpdateOrderStatusToShippedPayload>

export type UpdateOrderStatusToShippedResponseError = Array<
  Record<
    | 'sales_ref'
    | 'estimated_date'
    | 'taken_by_customer'
    | 'actual_shipment_date'
    | 'comment',
    string[]
  >
>

// =========================================================
// Feature: Fulfilled Order
// =========================================================
export interface UpdateOrderStatusToFulfilledPayload {
  order_items: Array<UpdateOrderStatusToFulfilledPayloadOrderItem>
  fulfilled_at: string
  comment: string
}

export type UpdateOrderStatusToFulfilledPayloadOrderItem = {
  id: number
  receives: Array<UpdateOrderStatusToFulfilledPayloadOrderItemReceive>
}

export type UpdateOrderStatusToFulfilledPayloadOrderItemReceive = {
  stock_id: number
  received_qty: number
  _stock_of_detail_stock: StockDetailStock
}

export type OrderDetailReceiveFormValues =
  Partial<UpdateOrderStatusToFulfilledPayload>

export type OrderDetailReceiveFormValuesOrderItems =
  Partial<UpdateOrderStatusToFulfilledPayloadOrderItem>

export type OrderDetailReceiveFormValuesOrderItemsReceive =
  Partial<UpdateOrderStatusToFulfilledPayloadOrderItemReceive>

export type UpdateOrderStatusToFulfilledResponseError = Array<
  Record<
    | 'sales_ref'
    | 'estimated_date'
    | 'taken_by_customer'
    | 'actual_shipment_date'
    | 'comment',
    string[]
  >
>

// =========================================================
// Feature: Order Interoperability Logs
// =========================================================

export type OrderDetailInteroperabilityLogsResponse = TCommonResponseList & {
  data: Array<OrderDetailInteroperabilityLogs>
}

export type OrderDetailInteroperabilityLogs = {
  action: string
  source: string
  target: string
  request: {
    method: string
    url: string
    body: string
  }
  response: {
    status: number
    body: string
  }
  created_at: string
}

// =========================================================
// Miscellaneous
// =========================================================

export type OrderDetailItemFormType = 'add' | 'edit'

export type OrderDetailMappedOrderItem = {
  order_item: OrderDetailItem | undefined
  vendor_stock: Stock | undefined
}
