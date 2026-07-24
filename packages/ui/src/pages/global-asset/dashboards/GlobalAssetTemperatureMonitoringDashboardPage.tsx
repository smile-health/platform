'use client'

import useSmileRouter from '#hooks/useSmileRouter'
import DashboardTemperatureMonitoringPage from '#pages/dashboard/dashboard-temperature-monitoring/DashboardTemperatureMonitoringPage'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import GlobalAssetManagementsLayout from '../GlobalAssetManagementsLayout'
import { globalAssetDashboardChildTabs } from './dashboards.constants'

const GlobalAssetTemperatureMonitoringDashboardPage = () => {
  hasPermission('dashboard-asset-temperature-monitoring-view')

  const { i18n } = useTranslation([
    'common',
    'dashboardAssetTemperatureMonitoring',
  ])
  const router = useSmileRouter()

  const childTabs = globalAssetDashboardChildTabs(
    i18n.t,
    router.getAsLinkGlobal
  )?.filter((v) => v?.isShow)

  return (
    <GlobalAssetManagementsLayout
      title={i18n.t('dashboardAssetTemperatureMonitoring:title.page')}
      subTitle={i18n.t('dashboardAssetTemperatureMonitoring:title.sub_title')}
      showButtonCreate={false}
      childTabs={childTabs}
    >
      <DashboardTemperatureMonitoringPage />
    </GlobalAssetManagementsLayout>
  )
}

export default GlobalAssetTemperatureMonitoringDashboardPage
