import { HorizontalGaugeChart } from '#components/chart'
import { Trans, useTranslation } from 'react-i18next'

import DashboardColdStorageCapacityBox from '../../components/DashboardColdStorageCapacityBox'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'

export default function AverageOrderLeadTime() {
  const { t } = useTranslation('dashboardColdStorageCapacity')
  const { overview } = useDashboardColdStorageCapacity()

  const avgDuration = overview?.data?.average_order_lead_time?.avg_duration || 0
  const maxDuration = overview?.data?.average_order_lead_time?.max_duration || 0

  const data = [
    {
      name: t('section.avg_order_lead_time.ideal_time'),
      value: 0,
      color: '#22C55E',
      pointerValue: 5,
    },
    {
      name: t('section.avg_order_lead_time.actual_time'),
      value: avgDuration,
      color: '#1B4B8F',
    },
    {
      name: t('section.avg_order_lead_time.longest_time'),
      value: Math.max(maxDuration - avgDuration, 0),
      color: '#D1D5DB',
    },
  ]

  return (
    <DashboardColdStorageCapacityBox
      id="average-order-lead-time"
      title={t('section.avg_order_lead_time.title')}
      subtitle={t('section.avg_order_lead_time.subtitle')}
      info={
        <Trans
          ns="dashboardColdStorageCapacity"
          i18nKey="section.avg_order_lead_time.info"
          components={{ br: <br /> }}
        />
      }
      isEmpty={!avgDuration && !maxDuration}
      isLoading={overview?.isLoading}
      lastUpdated={overview?.data?.average_order_lead_time?.last_update}
    >
      <div className="ui-w-full ui-h-[170px]">
        <HorizontalGaugeChart
          data={data}
          unit={t('section.avg_order_lead_time.days')}
          scaleMax={Math.max(maxDuration, 5)}
          scaleSteps={4}
          showTooltip={false}
        />
      </div>
    </DashboardColdStorageCapacityBox>
  )
}
