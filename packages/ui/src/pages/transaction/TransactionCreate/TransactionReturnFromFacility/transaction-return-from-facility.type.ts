import { BOOLEAN } from '#constants/common'
import {
  TCommonObject,
  TCommonResponseList,
  TSingleOptions,
} from '#types/common'
import { Batch } from '#types/stock'

import { CreateTransactionDetail } from '../transaction-create.type'

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
  is_managed_in_batch: number
  is_open_vial: number
  is_temperature_sensitive: number
  consumption_unit_per_distribution_unit: number
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
  title_en: string
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
  lastname: string | null
}

export interface UserUpdatedBy {
  id: number
  username: string
  firstname: string
  lastname: string | null
}

type TSubmitDetailTransaction = {
  transaction_id: number
  transaction_reason_id: number
  other_reason: string
  qty: number
  broken_qty: number
}

export type TPatient = {
  identity_type: number
  identity_number: string
  phone_number: string
  protocol: string
  vaccine_type: {
    id: number
    title: string
  }
  vaccine_method: {
    id: number
    title: string
  }
  vaccine_sequence: {
    id: number
    title: string
  }
}

type Protocol = {
  id: number
  name: string
  is_kipi: number
  is_medical_history: number
  is_vaccine_type: boolean
  is_vaccine_method: boolean
}

export type TTransactionReturnFacilityConsumptionData = {
  activity: TCommonObject
  activity_id?: number
  actual_transaction_date?: null
  change_qty?: number
  closing_qty?: number
  created_at?: string
  created_by?: number
  customer?: null | TCommonObject
  customer_id?: number
  customer_is_open_vial?: boolean
  deleted_at?: null
  discard_open_vial_qty?: number
  device_type?: number
  entity?: Entity
  entity_id?: number
  id: number
  index?: number
  is_open_vial?: number
  material: Material
  material_id?: number
  opening_qty?: number
  max_return: number
  order?: null | Order
  order_id?: null
  other_reason?: string
  return_qty?: number
  open_vial_qty?: number
  returned_qty?: number
  stock?: Stock & { activity: TCommonObject }
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
  discard_qty?: number
  discard_reason?: TSingleOptions
  patients: TPatient[] | []
  protocol: Protocol | null
}

export interface TransactionPurchase {
  id: number
  source_material_id: number
  year: number
  price: number
  pieces_purchase_id: number
  source_material: SourceMaterial
  pieces_purchase: any
}

export interface SourceMaterial {
  id: number
  name: string
}

export interface Stock {
  id: number
  qty: number
  batch: Batch
}

export type TDetailMaterials = {
  transaction_reason: TSingleOptions
  other_reason: string | null
  id: number
  is_temperature_sensitive: BOOLEAN
  consumption_unit_per_distribution_unit: number
}

export type CreateTransactionReturnFromFacilitySubmit = {
  entity_id: number
  activity_id: number
  entity_activity_id: number
  transactions: TSubmitDetailTransaction[]
}

export type CreateTransactionReturnFromFacilityForm = {
  items: TTransactionReturnFacilityConsumptionData[]
} & CreateTransactionDetail

export type ListTransactionConsumptionParams = {
  page: number
  paginate: number
  entity_id?: number
  activity_id?: number
  customer_id?: number
  start_date?: string
  end_date?: string
  material_type_id?: number
  material_id?: string
  transaction_reason_id?: number
}

export type ListTransactionConsumptionResponse =
  | (TCommonResponseList & {
    data: TTransactionReturnFacilityConsumptionData[]
  })
  | undefined
