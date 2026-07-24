import { TCommonFilter, TCommonResponseList } from '#types/common'

export type TStockTakingDashboard = TCommonResponseList & {
  date: string
  last_updated: string
}

export type TStockTakingDashboardParams = {
  from?: string | null
  to?: string | null
  period_id?: string
  activity_ids?: string
  material_level_id?: string
  material_type_ids?: string
  material_ids?: string
  batch_id?: string
  start_expired_date?: string | null
  end_expired_date?: string | null
  entity_tag_ids?: string
  province_ids?: string
  regency_ids?: string
  entity_ids?: string
}

export type TStockTakingDashboardPaginateParams = TCommonFilter &
  TStockTakingDashboardParams

export type ListComplianceResponse = TStockTakingDashboard & {
  data: TCompliance[]
}

export type TCompliance = {
  row: number
  entity?: { id: number; name: string }
  not_yet: number
  done: number
  entity_total: number
  not_yet_percentage: number
  done_percentage: number
  entity_total_percentage: number
}

export type ListComplianceSummaryResponse = TStockTakingDashboard & {
  data: TComplianceSummary[]
}

export type TComplianceSummary = {
  row: number
  entity_tag: { id: number; name: string }
  entity_total: number
  done: number
  not_yet: number
  entity_total_percentage: number
  done_percentage: number
  not_yet_percentage: number
}

export type ListResultResponse = TStockTakingDashboard & {
  data: TResult[]
}

export type TResult = {
  row: number
  entity?: { id: number; name: string }
  stock: number
  exp_stock: number
  unreceived_distribution: number
  unreceived_return: number
  stock_in_transit: number
  real_stock: number
  difference: number
  difference_percentage: number
}

export type ListResultSummaryResponse = TStockTakingDashboard & {
  data: TResultSummary[]
}

export type TResultSummary = {
  row: number
  entity_tag: { id: number; name: string }
  stock: number
  exp_stock: number
  unreceived_distribution: number
  unreceived_return: number
  stock_in_transit: number
  real_stock: number
  difference: number
  difference_percentage: number
}

export type ListMaterialResponse = TStockTakingDashboard & {
  data: TMaterial[]
  materials: {
    id: number
    name: string
  }[]
}

export type TMaterial = {
  row: number
  entity?: { id: number; name: string }
  materials: {
    id: number
    name: string
    smile_stock: number | string
    real_stock: number | string
    is_different: number
    is_mandatory: number
    is_stock_opnamed: number
  }[]
  opname_recap: string
}

export type SummaryListItem = {
  title: string
  valueKey: string
  percentageKey?: string
  colorClass: string
}
