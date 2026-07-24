import { useTranslation } from 'react-i18next'

import DashboardInventoryChart from '../components/DashboardInventoryChart'
import { TEMPERATURE_COLOR } from '../dashboard-inventory-overview.constant'
import { TDashboardInventoryOverviewFilter } from '../dashboard-inventory-overview.type'
import useTemperatureStatus from '../hooks/useTemperatureStatus'

type Props = {
  filter: TDashboardInventoryOverviewFilter
}

export default function DashboardInventoryTemperatureChart({ filter }: Props) {
  const { t } = useTranslation('dashboardInventoryOverview')

  const title = t('title.temperature')

  const { data, isLoading, handleClick, lastUpdated } = useTemperatureStatus({
    title,
    filter,
  })

  return (
    <DashboardInventoryChart
      id="temperature-chart"
      title={title}
      isLoading={isLoading}
      data={data}
      lastUpdated={lastUpdated}
      color={TEMPERATURE_COLOR}
      onClick={handleClick}
      information={{
        description: t('information.temperature.description'),
        details: t('information.temperature.detail', { returnObjects: true }),
      }}
    />
  )
}
