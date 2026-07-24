import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { useTranslation } from 'react-i18next'

import { useMonitoringDeviceInventoryDetail } from '../MonitoringDeviceInventoryDetailContext'
import { MonitoringDeviceInventoryDetailBox } from './MonitoringDeviceInventoryDetailBox'

export const BudgetSection = () => {
  const { t } = useTranslation([
    'monitoringDeviceInventory',
    'monitoringDeviceInventoryDetail',
  ])
  const { data, isLoading } = useMonitoringDeviceInventoryDetail()

  return (
    <MonitoringDeviceInventoryDetailBox
      title={t('monitoringDeviceInventoryDetail:section.budget.title')}
    >
      <RenderDetailValue
        data={[
          {
            label: t('monitoringDeviceInventory:data.budget_year'),
            value: data?.budget_year?.toString(),
          },
          {
            label: t('monitoringDeviceInventory:data.budget_source'),
            value: data?.budget_source?.name,
          },
        ]}
        loading={isLoading}
        skipEmptyValue={false}
      />
    </MonitoringDeviceInventoryDetailBox>
  )
}
