import { OptionType } from '#components/react-select'
import { TCommonFilter, TCommonObject, TCommonResponseList } from '#types/common'
import { Stock, StockDetailStock } from '#types/stock'
import { UseFormSetValue, UseFormTrigger } from 'react-hook-form'

import {
  CreateTransactionDetail,
  DetailStock,
} from '../transaction-create.type'

export type CreateTransactionAddStock = CreateTransactionDetail & {
  type: 'add'
  items: CreateTransactionAddStockItems[]
}

export type CreateTransactionAddStockItems = {
  material_id: number | undefined | null
  material_name: string | undefined | null
  available_stock: number | undefined | null
  on_hand_stock: number | undefined | null
  min: number | undefined | null
  max: number | undefined | null
  managed_in_batch: number | undefined | null
  change_qty: number | null | undefined
  transaction_type_id: number | undefined | null
  temperature_sensitive: number | undefined | null
  pieces_per_unit: number | undefined | null
  stock_id: number | undefined | null
  unit: string | undefined | null
  batches: CreateTransactionBatch[] | null | undefined
}

export type CreateTransactionBatch = {
  batch_id: number | undefined | null
  activity_id: number | undefined | null
  activity_name: string | undefined | null
  change_qty: number | undefined | null
  code: string | undefined | null
  production_date: string | undefined | null
  expired_date: string | undefined | null
  manufacturer: OptionType | undefined | null
  on_hand_stock: number | undefined | null
  min: number | undefined | null
  max: number | undefined | null
  available_qty: number | undefined | null
  allocated_qty: number | undefined | null
  temperature_sensitive: number | undefined | null
  pieces_per_unit: number | undefined | null
  status_material: OptionType | undefined | null
  managed_in_batch: number | undefined | null
  budget_source: OptionType | undefined | null
  budget_source_year: OptionType | undefined | null
  budget_source_price: number | undefined | null
  total_price_input: number | undefined | null
  transaction_reason: OptionType | undefined | null
  other_reason: string | null
  other_reason_required: boolean
}

export type TransactionAddStockChild = {
  batches: CreateTransactionBatch[] | null | undefined
}

export type TransactionReason = {
  id: number | null
  title: string
  transaction_type_id: number | null
  is_purchase: number | null
  is_other: number | null
  transaction_type: {
    id: number | null
    title: string
  }
}

export type ListTransactionReasonResponse = TCommonResponseList & {
  data: TransactionReason[]
}

export type ListTransactionReasonParams = {
  page: string | number | null
  paginate: string | number | null
  keyword?: string
  transaction_type_id?: string | number | null
  status?: number | null
}

export type CreateTransactionAddStockBody = {
  entity_id: number | null
  activity_id: number | null
  entity_activity_id: number | null | undefined
  materials: CreateTransactionAddStockMaterial[]
}

export type CreateTransactionAddStockMaterial =
  | {
      material_id: number | null | undefined
      stock_id: number | null | undefined
      qty: number | null | undefined
      transaction_reason_id: number | null | undefined
      other_reason: string | null | undefined
      batch: {
        code: string | null | undefined
        expired_date: string | null | undefined
        manufacture_id: number | null | undefined
      } | null
      budget_source_id: number | null | undefined
      total_price: number | null | undefined
      year: number | null | undefined
    }
  | null
  | undefined

export type setBatches = {
  obj: DetailStock | null
  materialItemList?: StockDetailStock[]
  selectedItem?: Stock
  isOpenVialCustomer?: boolean
  isKipi?: number
}

export type ListTransactionStatusVVMParams = TCommonFilter & {
  keyword?: string
}

export type TransactionStatusVVM = {
  id: number | null
  label: string
}

export type ListTransactionStatusVVMResponse = TCommonResponseList & {
  data: TransactionStatusVVM[]
}

export type PropsComponentInputInBatch = {
  indexStock: number
  indexBatch: number
  disabledField?: boolean
  fieldName?: string
}

export type BudgetSourceForm = {
  budget_source: OptionType | undefined | null
  budget_source_year: OptionType | undefined | null
  budget_source_price: number | undefined | null
  total_price_input: number | undefined | null
  is_purchase: boolean | undefined | null
}

export type NewBatchForm = {
  code: string | undefined | null
  production_date: string | undefined | null
  expired_date: string | undefined | null
  manufacturer: OptionType | undefined | null
}

export type ModalAddBudgetSource = {
  setIsOpen: (value: boolean) => void
  isOpen: boolean
  item: CreateTransactionBatch | undefined
  index: { indexItems: number; indexBatch: number }
  unit: string
  setValueBatch: UseFormSetValue<TransactionAddStockChild>
  triggerParent: UseFormTrigger<TransactionAddStockChild>
}

export type ModalAddEditBatch = {
  setIsOpen?: (value: boolean) => void
  isOpen?: boolean
  currentItem?: NewBatchForm | null
  itemIndex?: number
  batchIndex?: number | null
  setValueBatch?: UseFormSetValue<TransactionAddStockChild>
  batches: CreateTransactionBatch[] | null | undefined
  activity?: (OptionType & TCommonObject) | null
  temperature_sensitive?: number
  pieces_per_unit?: number
  managed_in_batch?: number
  material_id?: number
}

export type ModalBatchDetail = {
  handleClose: (value: boolean) => void
  isOpen: boolean
  idRow: number
  item: CreateTransactionAddStockItems | null
  setValueParent: UseFormSetValue<CreateTransactionAddStock>
  triggerParent: UseFormTrigger<CreateTransactionAddStock>
  activity: (OptionType & TCommonObject) | null
  setItem?: (val:CreateTransactionAddStockItems | null) => void
}

export type TableBatchDetail = {
  indexData: number
  unit: string
  isManageInBatch: number
  pieces_per_unit: number
  temperature_sensitive: number
  activity: (OptionType & TCommonObject) | null
  material_id?: number
}