'use client'

import useSmileRouter from '#hooks/useSmileRouter'
import StorageTemperatureMonitoringListPage from '#pages/asset-managements/storage-temperature-monitoring/StorageTemperatureMonitoringList/StorageTemperatureMonitoringListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalAssetManagementsLayout from '../../GlobalAssetManagementsLayout'
import {
  globalAssetManagementsChildTabs,
  globalAssetManagementsGrandChildTabs,
} from '../managements.constants'

const GlobalStorageTemperatureMonitoringListPage = () => {
  const {
    i18n: { t },
  } = useTranslation(['storageTemperatureMonitoringList'])

  const router = useSmileRouter()

  const childTabs = globalAssetManagementsChildTabs(
    t,
    router.getAsLinkGlobal
  )?.filter((v) => v?.isShow)

  const grandChildTabs = globalAssetManagementsGrandChildTabs(
    t,
    router.getAsLinkGlobal
  )?.filter((v) => v?.isShow)

  return (
    <GlobalAssetManagementsLayout
      title={t('storageTemperatureMonitoringList:page.title')}
      showButtonCreate={hasPermission(
        'storage-temperature-monitoring-global-mutate'
      )}
      childTabs={childTabs}
      grandChildTabs={grandChildTabs}
    >
      <StorageTemperatureMonitoringListPage isGlobal />
    </GlobalAssetManagementsLayout>
  )
}

export default GlobalStorageTemperatureMonitoringListPage
