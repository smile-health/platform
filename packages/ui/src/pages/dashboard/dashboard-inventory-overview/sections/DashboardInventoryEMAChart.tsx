import { useTranslation } from 'react-i18next'

import DashboardInventoryChart from '../components/DashboardInventoryChart'
import { EMA_COLOR } from '../dashboard-inventory-overview.constant'
import { TDashboardInventoryOverviewFilter } from '../dashboard-inventory-overview.type'
import useStockStatus from '../hooks/useStockStatus'

type Props = {
  filter: TDashboardInventoryOverviewFilter
}

export default function DashboardInventoryEMAChart({ filter }: Props) {
  const { t } = useTranslation('dashboardInventoryOverview')

  const title = t('title.ema')

  const { handleClick, isLoading, data, lastUpdated } = useStockStatus({
    title,
    filter,
  })

  return (
    <DashboardInventoryChart
      id="inventory-chart"
      title={title}
      isLoading={isLoading}
      data={data}
      lastUpdated={lastUpdated}
      color={EMA_COLOR}
      onClick={handleClick}
      information={{
        description: t('information.ema.description'),
        details: t('information.ema.detail', { returnObjects: true }),
      }}
    />
  )
}
