import { OptionType } from '#components/react-select'
import { TCommonObject, TCommonResponseList } from '#types/common'
import { TTransactionData } from '#types/transaction'

import { CreateTransactionDetail } from '../transaction-create.type'

export type KeyFilter = 'transaction_reason' | 'material_type' | 'material'

export type Filter = {
  page: number
  paginate: number
  transaction_type_id: number
  transaction_reason?: OptionType | null
  date_range?: {
    start: string
    end: string
  }
  material_type?: OptionType | null
  material?: OptionType | null
  entity_id?: number
  activity_id?: number
  customer_id?: number
}

export type ItemsCancelTransactionDiscard = {
  stock_id: number
  transaction_reason: OptionType | null
  transaction_ids: number[]
  stock?: Stock
  material: Material | null
  activity: TCommonObject | null
  change_qty: number
  change_qty_open_vial: number
  details: TransactionsDiscard[]
}

export type CreateCancelTransactionDiscard = CreateTransactionDetail & {
  type: 'cancel-discard'
  items: ItemsCancelTransactionDiscard[]
}

export type PayloadCancelTransactionDiscard = {
  entity_id: number
  activity_id: number
  entity_activity_id: number | null | undefined
  transactions: Array<{
    stock_id: number
    transaction_reason_id: number
    transaction_ids: number[]
  }>
}

export type CreateCancelTransactionDiscardResponse = {
  data: TTransactionData
}

export type ListTransactionDiscardParams = {
  page: number
  paginate: number
  entity_id?: number
  activity_id?: number
  start_date?: string
  end_date?: string
  material_type_id?: number
  material_id?: string
  transaction_reason_id?: number
}

export interface Entity {
  id: number
  name: string
  province: TCommonObject
  regency: TCommonObject
}

export interface Material {
  id: number
  name: string
  description: string
  material_type: TCommonObject
  is_open_vial: number
}

export interface TransactionType {
  id: number
  title: string
  title_en: string
  change_type: number
}

export interface TransactionReason {
  id: number
  title: string
  is_other: number
  is_purchase: number
}

export interface Order {
  status_label: string
  id: number
  type: number
  status: number
}

export interface UserCreatedBy {
  id: number
  username: string
  firstname: string
  lastname: any
}

export interface UserUpdatedBy {
  id: number
  username: string
  firstname: string
  lastname: any
}

export interface TransactionPurchase {
  id: number
  source_material_id: number
  year: number
  price: number
  pieces_purchase_id: any
  source_material: SourceMaterial
  pieces_purchase: any
}

export interface SourceMaterial {
  id: number
  name: string
}

export interface Stock {
  batch: Batch
}

export interface Batch {
  id: number
  code: string
  expired_date: string
  production_date: string
  status: number
  manufacture_id: number
  manufacture: Manufacture
}

export interface Manufacture {
  id: number
  name: string
  address: any
}

export type TransactionsDiscard = {
  activity: TCommonObject
  activity_id?: number
  actual_transaction_date?: null
  change_qty?: number
  change_qty_open_vial?: number
  closing_qty?: number
  created_at?: string
  created_by?: number
  customer?: null | TCommonObject
  customer_id?: number
  deleted_at?: null
  device_type?: number
  entity?: Entity
  entity_id?: number
  id: number
  material: Material
  material_id?: number
  opening_qty?: number
  order?: null | Order
  order_id?: null
  other_reason?: string
  stock?: Stock
  stock_id?: number
  transaction_purchase?: TransactionPurchase
  transaction_reason?: TransactionReason
  transaction_reason_id?: number
  transaction_type?: TransactionType
  transaction_type_id?: number
  updated_at?: string
  updated_by?: number
  user_created_by?: UserCreatedBy
  user_updated_by?: UserUpdatedBy
  vendor?: null | TCommonObject
  vendor_id?: number
}

export type ListTransactionDiscardResponse = TCommonResponseList & {
  data: TransactionsDiscard[]
}
