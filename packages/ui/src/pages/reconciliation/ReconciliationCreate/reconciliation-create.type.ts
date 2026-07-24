import { DateValue } from '@internationalized/date'
import { OptionType } from '#components/react-select'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import { TDetailActivityDate, TEntities } from '#types/entity'
import { Stock } from '#types/stock'

export type ReonciliationItems = {
  reconciliation_category: number | null
  reconciliation_category_label: string | null
  recorded_qty: number | null
  actual_qty: number | null
  reasons: Array<{ id: any; title?: any } | null> | null
  actions: Array<{ id: any; title?: any } | null> | null
}

type RangeValue<T> = {
  start: T
  end: T
} | null

export type ReconciliationCreateForm = {
  entity: OptionType | null
  activity: OptionType | null
  period_date: null | RangeValue<DateValue>
  material: {
    id?: number
    name?: string
  } | null
  opname_stock_items: Array<ReonciliationItems> | []
}

export type ReconciliationReasonAndActionForm = {
  data:
    | {
        reason: OptionType | null
        action: OptionType | null
      }[]
    | null
}

export type ReconciliationGenerateParams = {
  start_date: string | null | undefined
  end_date: string | null | undefined
  material_id: number | null
  entity_id: number | null
  activity_id: number | null
}

export type ReconciliationGenerateResponse = {
  data: DataGenerate[]
}

export type DataGenerate = {
  reconciliation_category: number
  reconciliation_category_label: string
  recorded_qty: number
}

export type ListEntitiesResponse = TCommonResponseList & {
  data: TEntities[]
  statusCode: number
}

export type ListStockParams = TCommonFilter & {
  keyword?: string
  material_level_id?: number
  entity_id?: number
  vendor_id?: number
  activity_id?: number
  with_details?: number
  is_stock_consumption?: boolean
}

export type ListStockResponse = TCommonResponseList & {
  data: Stock[]
  statusCode: number
}

export type listEntityActivitiesReponse = TDetailActivityDate[]

export type listEntityActivitiesParams = {
  id: string
  params?: {
    is_ongoing?: number
  }
}

export type ListReasonParams = TCommonFilter & {
  keyword?: string
}

export type ListReasonResponse = TCommonResponseList & {
  data: {
    id: number
    title: string
  }[]
}

export type ListActionParams = TCommonFilter & {
  keyword?: string
}

export type ListActionResponse = TCommonResponseList & {
  data: {
    id: number
    title: string
  }[]
}

export type ReconciliationPayload = {
  activity_id: number
  end_date?: string
  entity_id: number
  items: ReonciliationItems[]
  material_id?: number
  start_date?: string
}
