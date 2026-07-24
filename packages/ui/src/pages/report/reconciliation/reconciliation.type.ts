import { TCommonFilter, TCommonResponseList } from '#types/common'

export type ReconciliationSummaryParams = {
  activity_id?: number
  year?: number
  start_date?: string
  end_date?: string
  province_id?: number
  regency_id?: number
  entity_id?: number
  entity_tag_id?: number
}

export type ReconciliationSummaryResponse = {
  data: TReconciliationSummary[]
}

export type TReconciliationSummary = {
  label: string
  value: number
}

export type ReconciliationEntityParams = TCommonFilter &
  ReconciliationSummaryParams

export type ReconciliationEntityResponse = TCommonResponseList & {
  data: TReconciliationEntity[]
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
}

export type TReconciliationEntity = {
  id?: number
  average?: number
  name?: string
  months?: Record<string, number>[]
  total?: number
}
