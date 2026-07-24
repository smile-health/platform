import { GaugeChart } from '#components/chart'
import { useTranslation } from 'react-i18next'

import DashboardColdStorageCapacityBox from '../../components/DashboardColdStorageCapacityBox'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'

const GAUGE_COLORS = ['#22C55E', '#EC4899']

export default function ColdStorageCapacityStatus() {
  const { t } = useTranslation('dashboardColdStorageCapacity')
  const { overview } = useDashboardColdStorageCapacity()

  const total = overview?.data?.capacity_status?.volume_total
  const value = overview?.data?.capacity_status?.volume_material
  const max = overview?.data?.capacity_status?.volume_max
  const percentage =
    overview?.data?.capacity_status?.volume_material_percentage
  const thresholdValue = (total ?? 0) - (max ?? 0)
  const threshold = 85 / 100

  return (
    <DashboardColdStorageCapacityBox
      id="cold-storage-capacity-status"
      title={t('section.capacity_status.title')}
      info={<p>{t('section.capacity_status.info')}</p>}
      lastUpdated={overview?.data?.capacity_status?.last_update}
      isLoading={overview?.isLoading}
      isEmpty={!value}
    >
      <div className="ui-w-full ui-h-[300px]">
        <GaugeChart
          total={total || 0}
          value={value || 0}
          max={max || 0}
          label={t('section.capacity_status.legend_label')}
          color={GAUGE_COLORS}
          threshold={threshold}
          thresholdValue={thresholdValue}
          percentage={percentage}
        />
      </div>
    </DashboardColdStorageCapacityBox>
  )
}
