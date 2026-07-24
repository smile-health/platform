import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { useTranslation } from 'react-i18next'

import { OperationalStatusBadge } from '../../components/OperationalStatusBadge'
import { useMonitoringDeviceInventoryDetail } from '../MonitoringDeviceInventoryDetailContext'

export const DeviceDetailInfo = () => {
  const { t } = useTranslation(['monitoringDeviceInventory'])
  const { data, isLoading } = useMonitoringDeviceInventoryDetail()

  return (
    <RenderDetailValue
      data={[
        {
          label: t('monitoringDeviceInventory:data.asset_type'),
          value: data?.asset_type?.name ?? '-',
        },
        {
          label: t('monitoringDeviceInventory:data.asset_model_name'),
          value: data?.asset_model?.name ?? '-',
        },
        {
          label: t('monitoringDeviceInventory:data.manufacturer'),
          value: data?.manufacturer?.name ?? '-',
        },
        {
          label: t('monitoringDeviceInventory:data.vendor'),
          value: data?.asset_vendor?.name ?? '-',
        },
        {
          label: t('monitoringDeviceInventory:data.communication_provider'),
          value: data?.communication_provider?.name ?? '-',
        },
        {
          label: t('monitoringDeviceInventory:data.serial_number'),
          value: data?.serial_number ?? '-',
        },
        {
          label: t('monitoringDeviceInventory:data.production_year'),
          value: data?.production_year?.toString() ?? '-',
        },
        {
          label: t('monitoringDeviceInventory:data.device_status'),
          value: data?.device_status?.name ?? '-',
        },
        {
          label: t('monitoringDeviceInventory:data.operational_status'),
          value: data?.rtmd_status ? (
            <OperationalStatusBadge
              statusId={data.rtmd_status.id}
              statusName={data.rtmd_status.name}
            />
          ) : (
            '-'
          ),
        },
      ]}
      loading={isLoading}
      skipEmptyValue={false}
    />
  )
}
