import { TFunction } from 'i18next'

import DashboardOrderConsumptionSupplyOverall from './sections/DashboardOrderConsumptionSupplyOverall'
import DashboardOrderDifferenceOverall from './sections/DashboardOrderDifferenceOverall'
import DashboardOrderEntity from './sections/DashboardOrderEntity'
import DashboardOrderLocation from './sections/DashboardOrderLocation'
import DashboardOrderMaterial from './sections/DashboardOrderMaterial'
import DashboardOrderResponseTimeOverall from './sections/DashboardOrderResponseTimeOverall'

export enum DashboardOrderTabType {
  All = 'overall',
  Material = 'material',
  Entity = 'entity',
  Location = 'location',
}

export function getDashboardTabs(t: TFunction<'dashboardOrder'>) {
  return [
    {
      id: DashboardOrderTabType.All,
      label: t('title.tabs.all'),
    },
    {
      id: DashboardOrderTabType.Material,
      label: 'Material',
    },
    {
      id: DashboardOrderTabType.Entity,
      label: t('title.tabs.entity'),
    },
    {
      id: DashboardOrderTabType.Location,
      label: t('title.tabs.location'),
    },
  ]
}

export const ORDER_RESPONSE_TIME_CONTENT = {
  [DashboardOrderTabType.All]: DashboardOrderResponseTimeOverall,
  [DashboardOrderTabType.Material]: DashboardOrderMaterial,
  [DashboardOrderTabType.Entity]: DashboardOrderEntity,
  [DashboardOrderTabType.Location]: DashboardOrderLocation,
}

export const ORDER_DIFFERENCE_CONTENT = {
  [DashboardOrderTabType.All]: DashboardOrderDifferenceOverall,
  [DashboardOrderTabType.Material]: DashboardOrderMaterial,
  [DashboardOrderTabType.Entity]: DashboardOrderEntity,
  [DashboardOrderTabType.Location]: DashboardOrderLocation,
}

export const ORDER_CONSUMPTION_SUPPLY_CONTENT = {
  [DashboardOrderTabType.All]: DashboardOrderConsumptionSupplyOverall,
  [DashboardOrderTabType.Material]: DashboardOrderMaterial,
  [DashboardOrderTabType.Entity]: DashboardOrderEntity,
  [DashboardOrderTabType.Location]: DashboardOrderLocation,
}
