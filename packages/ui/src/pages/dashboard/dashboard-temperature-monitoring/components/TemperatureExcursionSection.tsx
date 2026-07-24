import { useTranslation } from 'react-i18next'

import DashboardTemperatureMonitoringBox from './DashboardTemperatureMonitoringBox'

type TemperatureExcursionSectionProps = Readonly<{
  isLoading?: boolean
  children?: React.ReactNode
}>

export default function TemperatureExcursionSection({
  isLoading,
  children,
}: TemperatureExcursionSectionProps) {
  const { t } = useTranslation('dashboardAssetTemperatureMonitoring')

  return (
    <DashboardTemperatureMonitoringBox
      id="temperature-excursion"
      title={t('temperature_excursion.title')}
      info={
        <p className="ui-text-gray-500 ui-whitespace-pre-line">
          {t('temperature_excursion.info')}
        </p>
      }
      isLoading={isLoading}
      showConfig={false}
      headerClassName="ui-bg-gray-100 ui-pt-6"
      bodyClassName="ui-bg-gray-100 ui-pt-0 ui-pb-6"
    >
      <div className="ui-space-y-4 ui-w-full">{children}</div>
    </DashboardTemperatureMonitoringBox>
  )
}
