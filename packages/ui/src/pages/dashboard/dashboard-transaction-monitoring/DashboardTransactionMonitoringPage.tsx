import { useFeatureIsOn } from '@growthbook/growthbook-react'

import DashboardTransactionMonitoringV1Page from './DashboardTransactionMonitoringV1Page'
import DashboardTransactionMonitoringV2Page from './DashboardTransactionMonitoringV2Page'

export default function DashboardTransactionMonitoringPage() {
  const isNewVersionEnabled = useFeatureIsOn(
    'dashboard.transaction_monitoring.new'
  )

  return isNewVersionEnabled ? (
    <DashboardTransactionMonitoringV2Page />
  ) : (
    <DashboardTransactionMonitoringV1Page />
  )
}
