import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { hasPermission } from '#shared/permission/index'
import { TFunction } from 'i18next'

export const globalAssetManagementsChildTabs = (
  t: TFunction<['common']>,
  getLink: (url: string) => string
) => {
  const isStorageTemperatureMonitoringVisible = useFeatureIsOn(
    'storage_temperature_monitoring.view'
  )
  const storageTemperatureMonitoringChildUrl = hasPermission(
    'storage-temperature-monitoring-global-cce-view'
  )
    ? 'cold-chain-equipment'
    : 'warehouse'

  return [
    {
      id: 'tab-global-dashboard-asset-ownership-inventory',
      label: t(
        'tab.global_asset_managements.managements.tabs.storage_temperature_monitoring.label'
      ),
      href: getLink(
        `/v5/global-asset/management/storage-temperature-monitoring/${storageTemperatureMonitoringChildUrl}`
      ),
      isShow:
        hasPermission('storage-temperature-monitoring-global-view') &&
        isStorageTemperatureMonitoringVisible,
    },
    {
      id: 'tab-global-asset-managements-operational_asset_inventory',
      label: t('tab.global_asset_managements.managements.tabs.asset_inventory'),
      href: getLink('/v5/global-asset/management/operational-asset-inventory'),
      isShow: hasPermission('asset-inventory-view'),
    },
    {
      id: 'tab-global-asset-managements-monitoring_device_inventory',
      label: t(
        'tab.global_asset_managements.managements.tabs.remote_temperature_monitoring_device'
      ),
      href: getLink('/v5/global-asset/management/monitoring-device-inventory'),
      isShow: hasPermission('monitoring-device-inventory-global-view'),
    },
  ]
}

export const globalAssetManagementsGrandChildTabs = (
  t: TFunction<['common']>,
  getLink: (url: string) => string
) => [
  {
    id: 'tab-global-storage-temp-monitoring-cold-chain-equipment',
    label: t(
      'tab.global_asset_managements.managements.tabs.storage_temperature_monitoring.tabs.cold_chain_equipment'
    ),
    href: getLink(
      '/v5/global-asset/management/storage-temperature-monitoring/cold-chain-equipment'
    ),
    isShow: hasPermission('storage-temperature-monitoring-global-cce-view'),
  },
  {
    id: 'tab-global-storage-temp-monitoring-warehouse',
    label: t(
      'tab.global_asset_managements.managements.tabs.storage_temperature_monitoring.tabs.warehouse'
    ),
    href: getLink(
      '/v5/global-asset/management/storage-temperature-monitoring/warehouse'
    ),
    isShow: hasPermission(
      'storage-temperature-monitoring-global-warehouse-view'
    ),
  },
]
