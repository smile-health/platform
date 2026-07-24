import { OptionType } from '#components/react-select'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import { TDetailActivityDate } from '#types/entity'
import { TProgram } from '#types/program'
import { DetailStock, Stock, StockDetailStock } from '#types/stock'
import { FieldErrors, UseFormSetValue, UseFormTrigger } from 'react-hook-form'

import { CreateTransactionDetail } from '../transaction-create.type'

export type ListProgramsParams = {
  entity_id?: number
  keyword?: string
}

export type ListProgramsResponse = Array<TProgram>

export type ListStockTransferParams = TCommonFilter & {
  keyword?: string
  entity_id?: number
  destination_program_id?: number | null
}

export type ListStockTransferResponse = TCommonResponseList & {
  data: Stock[]
  statusCode: number
}

export type CreateTransactionTransferStock = CreateTransactionDetail & {
  type: 'transfer-stock'
  items: CreateTransactionTransferStockItems[]
}

export type CreateTransactionTransferStockItems = {
  material_id: number | undefined | null
  material_name: string | undefined | null
  available_stock: number | undefined | null
  managed_in_batch: number | undefined | null
  pieces_per_unit: number | undefined | null
  unit: string | undefined | null
  destination_activity: OptionType | undefined | null
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
  available_qty: number | undefined | null
  pieces_per_unit: number | undefined | null
  managed_in_batch: number | undefined | null
  budget_source: OptionType | undefined | null
  budget_source_year: string | undefined | null
  budget_source_total_price: number | undefined | null
  budget_source_price: number | undefined | null
}

export type CreateTransactionChild = {
  batches: CreateTransactionBatch[] | null | undefined
}

export type setBatches = {
  materialItemList?: StockDetailStock[]
  selectedItem?: Stock
}

export type listTransferStockActivitiesParams = {
  destination_program_id?: number | undefined | null
  material_id?: number | undefined | null
  entity_id?: number | null
}

export type listTransferStockActivitiesReponse = TDetailActivityDate[]

export type TransactionCreateTransferStockDetail = {
  handleClose: (value: boolean) => void
  isOpen: boolean
  idRow: number
  items: CreateTransactionTransferStockItems[]
  setValueParent: UseFormSetValue<CreateTransactionTransferStock>
  triggerParent: UseFormTrigger<CreateTransactionTransferStock>
  errorsParent: FieldErrors<CreateTransactionTransferStock>
}

export type CreateTransactionTransferStockBody = {
  entity_id: number | null
  companion_program_id: number | null | undefined
  materials: CreateTransactionTransferStockMaterial[]
  is_acknowledged: boolean
}

export type CreateTransactionTransferStockMaterial =
  | {
      material_id: number | null | undefined
      stock_id: number | null | undefined
      qty: number | null | undefined
      companion_activity_id: number | null | undefined
    }
  | null
  | undefined
