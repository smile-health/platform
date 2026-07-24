import { OptionType } from '#components/react-select'
import {
  TCommonFilter,
  TCommonObject,
  TCommonResponseList,
} from '#types/common'
import { TDetailActivityDate, TEntities } from '#types/entity'
import { Stock, StockDetailStock } from '#types/stock'
import { TTransactionData } from '#types/transaction'

import { CreateTransactionAddStock } from './TransactionAddStock/transaction-add-stock.type'
import { CreateCancelTransactionDiscard } from './TransactionCancelDiscard/transaction-cancel-discard.type'
import { CreateTransactionConsumption } from './TransactionConsumption/transaction-consumption.type'
import {
  CreateTransactionDiscard,
  PayloadTransactionDiscard,
} from './TransactionDiscard/transaction-discard.type'
import { CreateTransactionRemoveForm } from './TransactionRemoveStock/transaction-remove-stock.type'
import { CreateTransactionReturnFromFacilityForm } from './TransactionReturnFromFacility/transaction-return-from-facility.type'
import { CreateTransactionTransferStock } from './TransactionTransferStock/transaction-transfer-stock.type'

export type CreateTransactionFormType =
  | 'add'
  | 'remove'
  | 'discard'
  | 'consumption'
  | 'cancel-discard'
  | 'transfer-stock'

export type CreateTransactionDetail = {
  entity: OptionType | null
  transactionType: OptionType | null
  destination_program_id?: number | null
  activity: (OptionType & TCommonObject) | null
  type: CreateTransactionFormType
  entity_activity_id: number | null | undefined
  customer?: OptionType | null
  actual_date: string | null | undefined
  is_open_vial_customer?: boolean
}

export type CreateTransctionForm =
  | (CreateTransactionDetail &
      Omit<
        CreateTransactionAddStock,
        'entity' | 'transactionType' | 'activity'
      >)
  | CreateTransactionDiscard
  | CreateCancelTransactionDiscard
  | CreateTransactionConsumption
  | CreateTransactionRemoveForm
  | CreateTransactionReturnFromFacilityForm
  | CreateTransactionTransferStock

export type ListEntitiesResponse = TCommonResponseList & {
  data: TEntities[]
  statusCode: number
}

export type ListEntitiesParams = {
  page: string | number
  paginate: string | number
  keyword?: string
  type_ids?: string | number
  entity_tag_ids?: string | number
  province_ids?: string
  regency_ids?: string
  sub_district_ids?: string
  village_ids?: string
  program_ids?: string
  is_vendor?: number
}

export type listEntityActivitiesReponse = TDetailActivityDate[]

export type listEntityActivitiesParams = {
  id: string
  params?: {
    is_ongoing?: number
  }
}

export type TransactionType = {
  id: number
  title: string
}

export type ListTransactionTypeResponse = TCommonResponseList & {
  data: TransactionType[]
}

export type ListTransactionTypeParams = TCommonFilter & { keyword: string }

export type ListStockParams = TCommonFilter & {
  keyword?: string
  material_level_id?: number
  entity_id?: number
  vendor_id?: number
  activity_id?: number
  with_details?: number
  is_stock_consumption?: boolean
  is_addremove?: number
}

export type ListStockResponse = TCommonResponseList & {
  data: Stock[]
  statusCode: number
}

export type ListStockDetailStockParams = {
  entity_id: number | string | undefined
  vendor_id?: number | string
  customer_id?: number | string
  group_by: 'activity' | 'material'
  material_id: number | string | undefined
  only_have_qty?: number
}

type MaterialDetailStock = {
  id: number
  name: string
  is_temperature_sensitive: number
  is_open_vial: number
  is_managed_in_batch: number
  unit_of_consumption: string
  consumption_unit_per_distribution_unit: number
}

export type DetailStock = {
  activity?: TCommonObject | null
  material?: MaterialDetailStock | null
  total_qty: number
  total_allocated_qty: number
  total_available_qty: number
  total_open_vial_qty: number
  total_in_transit_qty: number
  min: number
  max: number
  updated_at: string
  stocks: StockDetailStock[]
}

export type ListStockDetailStockResponse = {
  data: DetailStock[]
}

export type CreateTransactionDiscardBody = PayloadTransactionDiscard
export type CreateTransactionDiscardResponse = {
  data: TTransactionData
}
export type ParamsEntityCustomer = {
  is_vendor?: number
  is_consumption?: number
  keyword?: string
  page?: number
  paginate?: number
  activity_id?: number
}

export type ApiErrorResponse = {
  message: string;
  errors: ErrorFields;
}

export type ErrorFields = {
  materials?: Record<string, MaterialError>;
}

export type MaterialError = {
  budget_source_id?: string[];
}