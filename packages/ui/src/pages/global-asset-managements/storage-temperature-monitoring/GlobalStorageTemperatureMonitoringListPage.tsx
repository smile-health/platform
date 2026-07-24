'use client'

import StorageTemperatureMonitoringListPage from '#pages/asset-managements/storage-temperature-monitoring/StorageTemperatureMonitoringList/StorageTemperatureMonitoringListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalAssetManagementsLayout from '../GlobalAssetManagementsLayout'

const GlobalStorageTemperatureMonitoringListPage = () => {
  const {
    i18n: { t },
  } = useTranslation(['storageTemperatureMonitoringList'])
  return (
    <GlobalAssetManagementsLayout
      title={t('storageTemperatureMonitoringList:page.title')}
      showButtonCreate={hasPermission(
        'storage-temperature-monitoring-global-mutate'
      )}
    >
      <StorageTemperatureMonitoringListPage isGlobal />
    </GlobalAssetManagementsLayout>
  )
}

export default GlobalStorageTemperatureMonitoringListPage
