import { OptionType } from '#components/react-select'
import { TCommonFilter, TCommonResponseList } from '#types/common'

// types.ts (atau file manapun)

export type TRegionType = 'province' | 'city' | 'district' | 'village'

export type TCommonChartParams = {
  from?: string
  to?: string
  activity_ids?: string
  material_type_ids?: string
  material_level_id?: string
  material_ids?: string
  entity_tag_ids?: string
  start_expired_date?: string | null
  end_expired_date?: string | null
  information_type?: string
  province_id?: string
  regency_id?: string
  entity_id?: string
  transaction_type?: string
}

export type TCommonMicroplanningParams = {
  page?: number
  paginate?: number
  start_date?: string
  end_date?: string
  target_group?: string
  gender?: string
  province_ids?: string
  city_ids?: string
  district_ids?: string
  village_ids?: string
  material_id?: string
  batch_ids?: string
}

export type TChart = {
  number: number
  entity_tag: Array<{
    entity_tag_id: number
    entity_tag_name: string
    value: number
  }>
  material: Array<{
    material_id: number
    material_name: string
    value: number
  }>
  by_month: Array<{
    year: string
    month: string
    value: number
  }>
  byExpMonth: Array<{
    exp_year: string
    exp_month: string
    value: number
  }>
}

export type GetChartResponse = {
  date: string
  chart: TChart
}

export type TProvinceChart = {
  province: {
    id: number
    name: string
  }
  value: number
}
export type GetProvinceChartResponse = {
  date: string
  list: TProvinceChart[]
}

export type TRegencyChart = {
  regency: {
    id: number
    name: string
  }
  value: number
}
export type GetRegencyChartResponse = {
  date: string
  list: TRegencyChart[]
}

export type TEntity = {
  entity: {
    id: number
    name: string
  }
  province: {
    id: number
    name: string
  }
  regency: {
    id: number
    name: string
  }
  value: number
}

export type GetEntityParams = TCommonFilter &
  TCommonChartParams & {
    sort_by_id?: string
  }

export type GetEntityResponse = TCommonResponseList & {
  data: Array<TEntity>
}

export type DataValue = {
  label: string
  value: number
}[]

export type TDashboardTabs<T> = {
  id: T
  label: string
}

export type DashboardIOTBaseParams = {
  period?: 'day' | 'month'
  from?: string
  to?: string
  activity_ids?: string
  material_type_ids?: string
  material_level_id?: string
  material_ids?: string
  entity_tag_ids?: string
  province_id?: string
  regency_id?: string
  entity_id?: string
  information_type?: string
  reason_id?: string
}

export type DashboardIOTPaginationParams = TCommonFilter &
  DashboardIOTBaseParams

export type DashboardIOTOverviewReponse = {
  last_updated: string
  data: {
    categories: TDashboardIOTCategory[]
    dataset: TDashboardIOTDataset[]
  }
}

export type TDashboardIOTDataset = {
  label: string
  color: string
  data: number[]
}

export type TDashboardIOTCategory = {
  label: string
  day: number
  month: number
  year: number
  week_number: number
}

export type TDashboardIOTType = {
  key: string
  label: string
}

export type DashboardIOTPaginateResponse = TCommonResponseList & {
  last_updated: string
  data: {
    categories: TDashboardIOTCategory[]
    type: TDashboardIOTType[]
    dataset: TDashboardIOTDatasetTable[]
  }
}

export type TDashboardIOTDatasetTable = {
  id: number
  name: string
  province: string
  regency: string
  period: Array<{
    [key: string]: number
  }>
}

export type TDashboardIOTFilter = {
  period?: OptionType
  range?: { start: string | null; end: string | null }
  activity?: OptionType[]
  material_type?: OptionType[]
  material_level?: OptionType
  material?: OptionType[]
  entity_tags?: OptionType[]
  province?: OptionType
  regency?: OptionType
  entity?: OptionType
  information_type?: OptionType
  reason?: OptionType
  reasons?: OptionType[]
  transaction_type?: OptionType
}

export type TDashboardIOTSubPath =
  | 'order-response'
  | 'order-difference'
  | 'consumption-supply'
  | 'abnormal-stock'
  | 'add-remove-stock'
  | 'stock-availability'
  | 'filling-stock'
  | 'stock-discard'

export type TDashboardIOTHandler = {
  onResetPage?: VoidFunction
  onExport: VoidFunction
}
export type TBarChart = {
  extra?: {
    tooltip?: string
  }
}
