import { BOOLEAN } from '#constants/common'
import {
  TCommonFilter,
  TCommonObject,
  TCommonObjectTitle,
  TCommonResponseList,
  TSingleOptions,
} from '#types/common'

// Masters in Transaction List
export type TTransactionEntity = {
  id: number
  name: string
  province: TCommonObject
  regency: TCommonObject
}

export type TTransactionMaterial = {
  id: number
  name: string
  description: string
  material_type: TCommonObject
  managed_in_batch: number
  is_open_vial?: number
}

export type TTransactionOrder = {
  id: number
  status_label: string
  type: number
  status: number
}

export type TUserCreatedUpdatedBy = {
  id: number
  username: string
  firstname: string
  lastname?: string | null
}

export type TPatient = {
  id: number
  identity_type: number
  identity_number: string
  phone_number: string | null
  protocol: string | null
  vaccine_type: TCommonObjectTitle | null
  vaccine_method: TCommonObjectTitle | null
  vaccine_sequence: TCommonObjectTitle | null
}

type TConsumption = {
  id: number
  patient: TPatient | null
  vaccine_method: TCommonObject | null
  vaccine_sequence_id: number | null
}

// Options in Transaction List
type TTransactionType = {
  id: number
  title: string
  can_remove?: boolean
  can_restock?: boolean
  change_type: number
}

type TTransactionReason = {
  id: number
  title: string
  is_other: BOOLEAN
  is_purchase: BOOLEAN
  transaction_type?: TTransactionType
  title_en: string
}

type TTransactionPurchase = {
  id: number
  year: number
  price: number
  source_material: TCommonObject
  pieces_purchase?: number | null
  budget_source: TCommonObject | null
}

type TTransactionBatch = {
  id: number
  code: string
  expired_date: string
  production_date: string
  status: BOOLEAN
  manufacture: TCommonObject & { address: string | null }
  activity: TCommonObject | null
}

export type TTransactionStock = {
  id: number | null
  batch?: TTransactionBatch | null
  non_batch?: TTransactionBatch | null
  stockIndex: number
  actual_transaction_date: string | null
  activity: TCommonObject | null
  transaction_purchase: TTransactionPurchase | null
  transaction_reason: TTransactionReason | null
  change_qty: number | null
  consumption: TConsumption | null
  material?: TTransactionMaterial | null
  close_vial: number | null
  open_vial: number | null
}

export type TTransactionData = {
  id: number
  entity: TTransactionEntity | null
  material: TTransactionMaterial | null
  parent_material: TTransactionMaterial | null
  activity: TCommonObject | null
  opening_qty: number | null
  opening_qty_open_vial: number | null
  transaction_type: TTransactionType | null
  transaction_reason: TTransactionReason | null
  customer?: (TCommonObject & { is_open_vial: number | null }) | null
  vendor?: (TCommonObject & { is_open_vial: number | null }) | null
  other_reason: string | null
  order: TTransactionOrder | null
  change_qty: number | null
  change_qty_open_vial: number | null
  closing_qty: number | null
  closing_qty_open_vial: number | null
  created_at: string | null
  updated_at: string | null
  deleted_at?: string | null
  created_by: number | null
  updated_by: number | null
  user_created_by: TUserCreatedUpdatedBy | null
  user_updated_by: TUserCreatedUpdatedBy | null
  device_type: number | null
  actual_transaction_date?: string | null
  transaction_purchase: TTransactionPurchase | null
  stock: TTransactionStock | null
  patients: Array<TPatient> | []
  si_no: number | string
  companion_program?: TCommonObject | null
  companion_activity?: TCommonObject | null
}

export type TTransactionTypeParams = TCommonFilter & {
  page?: string | number
  paginate?: string | number
  keyword?: string
  is_enable?: number
}

export type TListTransactionsTypes = TCommonResponseList & {
  data: Array<TTransactionType>
}

export type TListTransactionsReasons = TCommonResponseList & {
  data: Array<TTransactionReason>
}

export type TListStockQualities = TCommonResponseList & {
  data: Array<{ id: number; label: string }>
}

// Transaction List
export type ListTransactionsResponse = TCommonResponseList & {
  data: Array<TTransactionData>
}

// Transaction Params
export type ListTransactionsParams = {
  page: number
  paginate: number
  date_range?: {
    start: string
    end: string
  }
  start_date?: string
  end_date?: string
  is_order?: TSingleOptions | number
  order_type?: TSingleOptions | number
  entity_for_consumption?: TSingleOptions | number
  entity_user_id?: TSingleOptions | number
}

export type ReactionItemData = {
  value: number
  title: string
}

export type ListReactionResponse = TCommonResponseList & {
  data: Array<ReactionItemData>
}

// Detail Transaction
export type ResponseDetailTransaction = {
  data: DetailTransaction
  message: string
  success: boolean
}

export type DetailTransaction = {
  consumption: Consumption
  consumption_id: number
  patients: Patient[]
  protocol: Protocol
  transaction: Transaction
  stock?: StockTransaction
}

export type StockTransaction = {
  id: number | null
  open_vial: number | null
  close_vial: number | null
  activity: {
    id: number | null
    name: string | null
  }
  batch: {
    id: number | null
    code: string | null
    expired_date: string | null
    production_date: string | null
    status: number | null
    manufacturer: {
      id: number | null
      name: string | null
      address: string | null
    }
  }
}

export type Consumption = {
  disease_history_prevention: DiseaseHistoryPrevention
  kipi_history: SideEffect[]
  pep_shifted_by_entity?: {
    name: string
    id: number
  }
}

export type DiseaseHistoryPrevention = {
  has_dengue_before: boolean
  has_voluntary_vaccination: boolean
  last_dengue_month: string
  last_dengue_year: number
}

export type SideEffect = {
  other_reaction: string
  reaction: string
  reaction_date: string
  sequence_name: string
}

export type Patient = {
  identity?: Identity
  vaccination?: Vaccination
}

export type Identity = {
  age: number
  date_of_birth: string
  education: string
  ethnicity: string
  gender: string
  identity_number: string
  patient_id: number
  identity_type: number
  name: string
  occupation: string
  phone_number: string
  registered_address: string
  religion: string
  residential_address: string
  marital_status: string
}

export type Vaccination = {
  age_at_vaccination: number
  disease_history: boolean
  material_status: string
  method: string
  sequence: string
  type: string
}

export type Protocol = {
  id: number
  is_kipi: boolean
  is_medical_history: boolean
  name: string
}

export type TransactionPurchase = {
  budget_source: TCommonObject | null
  price: number | null
  year: number | null
  total_price: number | null
}

export type Transaction = {
  actual_transaction_date: string
  activity_name: string
  batch_code: string
  created_at: string
  created_by: string
  device: string
  entity_name: string
  expired_date: string
  manufacturer: string
  material_name: string
  production_date: string
  order_id: string
  order_status: string
  transaction_purchase: TransactionPurchase
}
