'use client'

import useSmileRouter from '#hooks/useSmileRouter'
import MonitoringDeviceInventoryListPage from '#pages/asset-managements/monitoring-device-inventory/MonitoringDeviceInventoryList/MonitoringDeviceInventoryListPage'
import Error403Page from '#pages/error/Error403Page'
import { hasPermission } from '#shared/permission/index'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useTranslation } from 'react-i18next'

import GlobalAssetManagementsLayout from '../../GlobalAssetManagementsLayout'
import { globalAssetManagementsChildTabs } from '../managements.constants'

const GlobalMonitoringDeviceInventoryListPage = () => {
  const isFeatureEnabled = useFeatureIsOn('monitoring_device_inventory')
  const {
    i18n: { t },
  } = useTranslation(['monitoringDeviceInventoryList'])

  const router = useSmileRouter()

  const childTabs = globalAssetManagementsChildTabs(
    t,
    router.getAsLinkGlobal
  )?.filter((v) => v?.isShow)

  if (!isFeatureEnabled) return <Error403Page />

  return (
    <GlobalAssetManagementsLayout
      title={t('monitoringDeviceInventoryList:table.title')}
      showButtonCreate={hasPermission(
        'monitoring-device-inventory-global-mutate'
      )}
      buttonCreate={{
        label: t('monitoringDeviceInventoryList:button.create'),
        onClick: () =>
          router.pushGlobal(
            `/v5/global-asset/management/monitoring-device-inventory/create`
          ),
      }}
      childTabs={childTabs}
    >
      <MonitoringDeviceInventoryListPage isGlobal />
    </GlobalAssetManagementsLayout>
  )
}

export default GlobalMonitoringDeviceInventoryListPage
