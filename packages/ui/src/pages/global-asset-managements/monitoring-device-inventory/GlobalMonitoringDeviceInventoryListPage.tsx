'use client'

import { useRouter } from 'next/navigation'
import MonitoringDeviceInventoryListPage from '#pages/asset-managements/monitoring-device-inventory/MonitoringDeviceInventoryList/MonitoringDeviceInventoryListPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalAssetManagementsLayout from '../GlobalAssetManagementsLayout'

const GlobalMonitoringDeviceInventoryListPage = () => {
  const router = useRouter()
  const {
    i18n: { language, t },
  } = useTranslation(['monitoringDeviceInventoryList'])
  return (
    <GlobalAssetManagementsLayout
      title={t('monitoringDeviceInventoryList:table.title')}
      showButtonCreate={hasPermission(
        'monitoring-device-inventory-global-mutate'
      )}
      buttonCreate={{
        label: t('monitoringDeviceInventoryList:button.create'),
        onClick: () =>
          router.push(
            `/${language}/v5/global-asset-managements/monitoring-device-inventory/create`
          ),
      }}
    >
      <MonitoringDeviceInventoryListPage isGlobal />
    </GlobalAssetManagementsLayout>
  )
}

export default GlobalMonitoringDeviceInventoryListPage
