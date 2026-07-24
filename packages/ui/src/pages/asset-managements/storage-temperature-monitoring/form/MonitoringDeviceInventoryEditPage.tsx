import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { DUMMY_GLOBAL_DETAIL_DATA } from '../monitoring-device-inventory.constants'
import { detailAsset } from '../services/storage-temperature-monitoring.services'
import MonitoringDeviceInventoryForm from './components/MonitoringDeviceInventoryForm'

const MonitoringDeviceInventoryEditPage = () => {
  usePermission('monitoring-device-inventory-global-mutate')
  const { t } = useTranslation(['common', 'monitoringDeviceInventory'])
  const router = useSmileRouter()
  const {
    query: { id },
  } = router

  const {
    data: assetInventoryData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['asset-inventory', id],
    queryFn: () => detailAsset(Number(id)),
    // enabled: !!id,
    enabled: false,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  // if (!assetInventoryData) {
  //   return null
  // }

  return (
    <Container
      title={t('monitoringDeviceInventory:asset_inventory')}
      withLayout
      backButton={{
        label: t('monitoringDeviceInventory:back_to_detail'),
        show: true,
        onClick: () => {
          router.pushGlobal(
            '/v5/global-asset-managements/monitoring-device-inventory'
          )
        },
      }}
    >
      <Meta
        title={`SMILE | ${t('monitoringDeviceInventory:asset_inventory')}`}
      />
      <MonitoringDeviceInventoryForm data={DUMMY_GLOBAL_DETAIL_DATA} />
    </Container>
  )
}

export default MonitoringDeviceInventoryEditPage
