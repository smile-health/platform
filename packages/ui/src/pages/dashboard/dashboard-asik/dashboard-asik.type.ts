import { OptionType } from '#components/react-select'
import { TCommonFilter, TCommonResponseList } from '#types/common'

export type TDashboardAsikFilter = {
  period?: { start: string | null; end: string | null }
  year?: OptionType
  activity?: OptionType
  material_type?: OptionType
  material_level?: OptionType
  material?: OptionType
  province?: OptionType
  regency?: OptionType
  entity?: OptionType
  entity_tags?: OptionType[]
}

export type DashboardAsikBaseParams = {
  from?: string
  to?: string
  target_year?: string
  activity_id?: string
  material_type_id?: string
  material_id?: string
  province_id?: string
  regency_id?: string
  entity_id?: string
  entity_tag_ids?: string
  region?: string
}

export type DashboardAsikPaginatedParams = TCommonFilter &
  DashboardAsikBaseParams

export type DashboardAsikChartResponse = {
  last_updated: string
  data: TOverview[]
}

export type TOverview = {
  id: number
  label: string
  value: number
  color: string
  tooltip: string
}

export type DashboardAsikPaginatedResponse = TCommonResponseList & {
  last_updated: string
  data: TAsikItem[]
}

export type TAsikItem = {
  id: number
  label: string
  total_consumed: number
  total_pcare: number
  percentage: string
  consumption_unit_per_distribution_unit: number
  vial: number
  usage_index: number | string
  target_qty: string
  scope: string
}

export type TImperativeHandle = {
  onResetPage: VoidFunction
}
