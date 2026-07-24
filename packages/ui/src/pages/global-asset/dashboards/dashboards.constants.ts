import { hasPermission } from '#shared/permission/index'
import { TFunction } from 'i18next'

export const globalAssetDashboardChildTabs = (
  t: TFunction<['common', 'dashboardAssetOwnershipInventory']>,
  getLink: (url: string) => string
) => {
  return [
    {
      id: 'tab-global-dashboard-asset-ownership-inventory',
      label: t(
        'tab.global_asset_managements.dashboards.tabs.asset_ownership_inventory'
      ),
      href: getLink('/v5/global-asset/dashboard/asset-ownership-inventory'),
      isShow: hasPermission('asset-type-global-view'),
    },
    {
      id: 'tab-global-asset-dashboard-cold-storage-capacity',
      label: t(
        'tab.global_asset_managements.dashboards.tabs.cold_storage_capacity'
      ),
      href: getLink('/v5/global-asset/dashboard/cold-storage-capacity'),
      isShow: hasPermission('dashboard-asset-cold-storage-capacity-view'),
    },
    {
      id: 'tab-global-asset-dashboard-temperature-monitoring',
      label: t(
        'tab.global_asset_managements.dashboards.tabs.temperature_monitoring'
      ),
      href: getLink('/v5/global-asset/dashboard/temperature-monitoring'),
      isShow: hasPermission('dashboard-asset-temperature-monitoring-view'),
    },
  ]
}
