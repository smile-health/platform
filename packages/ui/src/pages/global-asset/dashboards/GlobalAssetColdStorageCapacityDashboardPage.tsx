'use client'

import { useFeatureIsOn } from '@growthbook/growthbook-react'
import useSmileRouter from '#hooks/useSmileRouter'
import { DashboardColdStorageCapacityPage } from '#pages/dashboard/dashboard-cold-storage-capacity/DashboardColdStorageCapacityPage'
import Error403Page from '#pages/error/Error403Page'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import { DASHBOARD_CCE_FEATURE_KEY } from '../../dashboard/dashboard-cold-storage-capacity/dashboard-cold-storage-capacity.constants'
import GlobalAssetManagementsLayout from '../GlobalAssetManagementsLayout'
import { globalAssetDashboardChildTabs } from './dashboards.constants'

const GlobalAssetColdStorageCapacityDashboardPage = () => {
  const router = useSmileRouter()
  const { i18n } = useTranslation(['common', 'dashboardColdStorageCapacity'])
  const isFeatureEnabled = useFeatureIsOn(DASHBOARD_CCE_FEATURE_KEY)

  if (!isFeatureEnabled) return <Error403Page />

  hasPermission('dashboard-asset-cold-storage-capacity-view')

  const childTabs = globalAssetDashboardChildTabs(
    i18n.t,
    router.getAsLinkGlobal
  )?.filter((v) => v?.isShow)

  return (
    <GlobalAssetManagementsLayout
      title={i18n.t('dashboardColdStorageCapacity:title.page')}
      showButtonCreate={false}
      childTabs={childTabs}
    >
      <DashboardColdStorageCapacityPage />
    </GlobalAssetManagementsLayout>
  )
}

export default GlobalAssetColdStorageCapacityDashboardPage
