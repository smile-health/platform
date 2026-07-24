import { MapName } from '#components/chart'
import { OptionType } from '#components/react-select'

import { DashboardInventoryType } from './dashboard-inventory-overview.constant'
import { getLabelOptions } from './dashboard-inventory-overview.helper'

export type TDashboardInventoryOverviewFilter = {
  period_start?: string
  period_end?: string
  activity?: OptionType[]
  material_type?: OptionType
  material?: OptionType[]
  province?: OptionType
  regency?: OptionType
  entity_tag?: OptionType
  transaction_type?: DashboardInventoryType
  material_id?: string
  operational_status?: OptionType
}

export type DashboardInventoryOverviewParams = {
  from?: string
  to?: string
  activity_ids?: string
  material_type_id?: string
  material_ids?: string
  province_id?: string
  regency_id?: string
  entity_tag_id?: string
  working_status_id?: string
}

export type DashboardInventoryMaterialsParams =
  DashboardInventoryOverviewParams & {
    transaction_type?: DashboardInventoryType
  }

export type DashboardInventoryMaterialsEntitiesParams =
  DashboardInventoryMaterialsParams & {
    material_id?: string
  }

export type TCommon = {
  id: number
  name: string
}

export type ChartOverviewResponse = {
  current_time: string
  last_updated: string
  map_name: MapName
  province: TCommon
  regency: TCommon
  data: TChartOverview[]
}

export type TChartOverview = {
  label: string
  type: DashboardInventoryType
  is_selected: boolean
  value: number
  totals: number
  percent: number
  tooltip: string
}

export type ActivityOverviewResponse = {
  last_updated: string
  map_name: string
  axis_name: string
  province: TCommon
  regency: TCommon
  data: TActivityOverview[]
}

export type TActivityOverview = {
  name: string
  type: DashboardInventoryType.Active | DashboardInventoryType.Inactive
  value: number
  percent: number
  tooltip: string
}

export type InventoryMaterialResponse = {
  data: TMaterial[]
}

export type InventoryMaterialEntitiesResponse = {
  data: TEntity[]
}

export type LocationResponse = {
  data: Record<DashboardInventoryType, TLocation[]>
}

export type TMaterial = {
  id: number
  name: string
  value: number
  tooltip: string
}

export type TEntity = TCommon & {
  value: number
  province: TCommon
  regency: TCommon
}

export type TLocation = {
  id: number
  name: string
  value: number
  percent: number
  tooltip: string
}

export type TPieChart = Pick<TChartOverview, 'value' | 'type'> & {
  name: string
  selected: boolean
  label: ReturnType<typeof getLabelOptions>
  tooltip: {
    confine: boolean
    formatter: string
  }
}

export type TMapItem = TCommon & {
  value: number
  selected?: boolean
  province?: TCommon
  regency?: TCommon
  itemStyle?: {
    color?: string
  }
  emphasis?: {
    itemStyle?: {
      areaColor?: string
    }
  }
  label?: {
    show: boolean
  }
  tooltip?: {
    show?: boolean
    confine?: boolean
    formatter?: string | ((params: any) => string)
  }
}

export type TBarChart<T = any> = {
  x: number
  y: string
  extra: T & {
    tooltip: string
  }
}
