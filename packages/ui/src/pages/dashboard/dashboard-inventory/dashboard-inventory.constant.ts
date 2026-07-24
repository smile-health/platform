import { TFunction } from 'i18next'

import DashboardAbnormalStockOverall from './sections/DashboardAbnormalStockOverall'
import DashboardCountStockOverall from './sections/DashboardCountStockOverall'
import DashboardFillingStockOverall from './sections/DashboardFillingStockOverall'
import DashboardInventoryEntity from './sections/DashboardInventoryEntity'
import DashboardInventoryLocation from './sections/DashboardInventoryLocation'
import DashboardInventoryMaterial from './sections/DashboardInventoryMaterial'
import DashboardInventoryMaterialEntity from './sections/DashboardInventoryMaterialEntity'
import DashboardStockAvailabilityOverall from './sections/DashboardStockAvailabilityOverall'

export const ADD_STOCK = 7
export const REDUCE_STOCK = 8

export enum DashboardInventoryTabType {
  All = 'overall',
  Material = 'material',
  Entity = 'entity',
  Entity_Material = 'entity-material',
  Location = 'location',
}

export function getDashboardTabs(
  t: TFunction<'dashboardInventory'>,
  isShowEntityMaterial = true
) {
  return [
    {
      id: DashboardInventoryTabType.All,
      label: t('title.tabs.all'),
    },
    {
      id: DashboardInventoryTabType.Material,
      label: 'Material',
    },
    {
      id: DashboardInventoryTabType.Entity,
      label: t('title.tabs.entity'),
    },
    ...(isShowEntityMaterial
      ? [
          {
            id: DashboardInventoryTabType.Entity_Material,
            label: t('title.tabs.entity-material'),
          },
        ]
      : []),
    {
      id: DashboardInventoryTabType.Location,
      label: t('title.tabs.location'),
    },
  ]
}

export const INVENTORY_STOCK_AVAILABILITY_CONTENT = {
  [DashboardInventoryTabType.All]: DashboardStockAvailabilityOverall,
  [DashboardInventoryTabType.Material]: DashboardInventoryMaterial,
  [DashboardInventoryTabType.Entity]: DashboardInventoryEntity,
  [DashboardInventoryTabType.Entity_Material]: DashboardInventoryMaterialEntity,
  [DashboardInventoryTabType.Location]: DashboardInventoryLocation,
}

export const INVENTORY_COUNT_STOCK_CONTENT = {
  [DashboardInventoryTabType.All]: DashboardCountStockOverall,
  [DashboardInventoryTabType.Material]: DashboardInventoryMaterial,
  [DashboardInventoryTabType.Entity]: DashboardInventoryEntity,
  [DashboardInventoryTabType.Entity_Material]: DashboardInventoryMaterialEntity,
  [DashboardInventoryTabType.Location]: DashboardInventoryLocation,
}

export const INVENTORY_ABNORMAL_STOCK_CONTENT = {
  [DashboardInventoryTabType.All]: DashboardAbnormalStockOverall,
  [DashboardInventoryTabType.Material]: DashboardInventoryMaterial,
  [DashboardInventoryTabType.Entity]: DashboardInventoryEntity,
  [DashboardInventoryTabType.Entity_Material]: DashboardInventoryMaterialEntity,
  [DashboardInventoryTabType.Location]: DashboardInventoryLocation,
}

export const INVENTORY_FILLING_STOCK_CONTENT = {
  [DashboardInventoryTabType.All]: DashboardFillingStockOverall,
  [DashboardInventoryTabType.Material]: DashboardInventoryMaterial,
  [DashboardInventoryTabType.Entity]: DashboardInventoryEntity,
  [DashboardInventoryTabType.Entity_Material]: DashboardInventoryMaterialEntity,
  [DashboardInventoryTabType.Location]: DashboardInventoryLocation,
}
