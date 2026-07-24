import Error403Page from '#pages/error/Error403Page'
import MonitoringDeviceInventoryDetailPage from '#pages/asset-managements/monitoring-device-inventory/MonitoringDeviceInventoryDetail/MonitoringDeviceInventoryDetailPage'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

export default function GlobalMonitoringDeviceInventoryDetailPage() {
  const isFeatureEnabled = useFeatureIsOn('monitoring_device_inventory')

  if (!isFeatureEnabled) return <Error403Page />

  return <MonitoringDeviceInventoryDetailPage isGlobal />
}
