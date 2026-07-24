import Error403Page from '#pages/error/Error403Page'
import MonitoringDeviceInventoryFormPage from '#pages/asset-managements/monitoring-device-inventory/MonitoringDeviceInventoryForm/MonitoringDeviceInventoryFormPage'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

export default function GlobalMonitoringDeviceInventoryEditPage() {
  const isFeatureEnabled = useFeatureIsOn('monitoring_device_inventory')

  if (!isFeatureEnabled) return <Error403Page />

  return <MonitoringDeviceInventoryFormPage isGlobal mode="edit" />
}
