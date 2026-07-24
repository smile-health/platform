import { TCommonFilter, TCommonResponseList } from '#types/common'

export type GetOverviewParams = {
  from?: string
  to?: string
  activity_ids?: number
  material_type_ids?: number
  material_ids?: number
  province_id?: number
  regency_id?: number
  entity_tag_ids?: number
  entity_id?: string
  period?: string
  transaction_type?: string
  information_type?: string
  transaction_type_ids?: number
  api_list_type?: string
}

export type GetOverviewResponse = {
  month: string
  activity_id: string
  activity_name: string
  overview: TOverview
}

type TOverview = {
  label: string
  active: TDetailOverview
  inactive: TDetailOverview
}

type TDetailOverview = {
  entity: number
  value: number
  toolText: string
}

export type GetEntityParams = TCommonFilter & GetOverviewParams

export type GetEntityResponse = TCommonResponseList & {
  interval_period: string[]
  data: TEntityItem[]
  month: string
}

export type TEntityItem = {
  activity_id: string
  activity_name: string
  average_frequency: number
  id: number
  name: string
  customer_name: string
  overview: Record<string, number>[]
  total_active_days: number
  total_frequency: number
  total_inactive_days: number
}
