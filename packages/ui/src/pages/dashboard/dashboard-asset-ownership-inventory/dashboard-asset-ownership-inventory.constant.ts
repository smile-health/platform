import { TFunction } from 'i18next'

import { TDashboardTabs } from '../dashboard.type'
import DashboardCardSummary from './components/DashboardCardSummary'

export enum AssetOwnershipInventoryChartType {
  All = '0',
  Kemenkes = '3',
  Warehouse = '19',
  Province = '5',
  Regency = '7',
  Entity = '9',
  Hospital = '11',
  Laboratory = '29',
  Others = '1',
}

export enum AssetOwnershipInventorySummaryType {
  VaccineRefrigerator = 'Total Vaccine Refrigerator',
  Freezer = 'Total Freezer',
  ColdRoom = 'Total Cold Room',
  FreezerRoom = 'Total Freezer Room',
  UltraLowTemperature = 'Total Ultra-Low Temperature',
  TotalAsset = 'Total Aset',
}

export const assetOwnershipInventoryChartTabs = (
  t: TFunction<'dashboardAssetOwnershipInventory'>
): Array<TDashboardTabs<AssetOwnershipInventoryChartType>> => [
  {
    id: AssetOwnershipInventoryChartType.All,
    label: t('title.tabs.all'),
  },
  {
    id: AssetOwnershipInventoryChartType.Kemenkes,
    label: t('title.tabs.kemenkes'),
  },
  {
    id: AssetOwnershipInventoryChartType.Warehouse,
    label: t('title.tabs.warehouse'),
  },
  {
    id: AssetOwnershipInventoryChartType.Province,
    label: t('title.tabs.province'),
  },
  {
    id: AssetOwnershipInventoryChartType.Regency,
    label: t('title.tabs.regency'),
  },
  {
    id: AssetOwnershipInventoryChartType.Entity,
    label: t('title.tabs.entity'),
  },
  {
    id: AssetOwnershipInventoryChartType.Hospital,
    label: t('title.tabs.hospital'),
  },
]

export const STOCK_TAB_CONTENT = {
  [AssetOwnershipInventoryChartType.All]: DashboardCardSummary,
  [AssetOwnershipInventoryChartType.Kemenkes]: DashboardCardSummary,
  [AssetOwnershipInventoryChartType.Warehouse]: DashboardCardSummary,
  [AssetOwnershipInventoryChartType.Province]: DashboardCardSummary,
  [AssetOwnershipInventoryChartType.Regency]: DashboardCardSummary,
  [AssetOwnershipInventoryChartType.Entity]: DashboardCardSummary,
  [AssetOwnershipInventoryChartType.Hospital]: DashboardCardSummary,
  [AssetOwnershipInventoryChartType.Laboratory]: DashboardCardSummary,
  [AssetOwnershipInventoryChartType.Others]: DashboardCardSummary,
}

export const assetCapacityData = (
  t: TFunction<'dashboardAssetOwnershipInventory'>
) => {
  return [
    {
      label: t('form.capacity_data.option.exist'),
      value: 1,
    },
    {
      label: t('form.capacity_data.option.not_exist'),
      value: 2,
    },
    {
      label: t('form.capacity_data.option.need_clarification'),
      value: 3,
    },
  ]
}

export const assetOwnershipData = (
  t: TFunction<'dashboardAssetOwnershipInventory'>
) => {
  return [
    {
      label: t('form.ownership_status.option.owned'),
      value: 1,
    },
    {
      label: t('form.ownership_status.option.borrowed'),
      value: 2,
    },
  ]
}

export enum DASHBOARD_TYPE {
  AssetInventory = 'asset_inventory',
}
