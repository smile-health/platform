import { PieChart } from '#components/chart'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import DashboardColdStorageCapacityBox from '../../components/DashboardColdStorageCapacityBox'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'
import { useExportCceAnnualFacilityTotalQuery } from '../../dashboard-cold-storage-capacity.queries'
import { DashboardColdStorageCapacityFilterParams } from '../filter/useDashboardColdStorageCapacityFilterSchema.types'

const DOWNLOAD_EXTENSIONS = ['png', 'jpg', 'pdf', 'csv']

const PIE_COLORS = ['#22C55E', '#EAB308']

export default function FacilitiesByCapacityStatusDistInterval() {
  const { t } = useTranslation('dashboardColdStorageCapacity')

  const { annual, filter } = useDashboardColdStorageCapacity()
  const filterValues = useMemo(
    () => filter.getValues() as DashboardColdStorageCapacityFilterParams,
    [filter]
  )
  const { refetch: exportCSV } =
    useExportCceAnnualFacilityTotalQuery(filterValues)

  const belowInterval = annual?.data?.facility_total?.below_interval ?? 0
  const aboveInterval = annual?.data?.facility_total?.above_interval ?? 0

  const data = annual?.data?.facility_total
    ? [
        {
          name: t(
            'section.facilities_by_capacity_status_dist_interval.category.below_interval'
          ),
          value: belowInterval,
        },
        {
          name: t(
            'section.facilities_by_capacity_status_dist_interval.category.above_interval'
          ),
          value: aboveInterval,
        },
      ]
    : []

  const handleDownloadCSV = () => {
    exportCSV()
  }

  return (
    <DashboardColdStorageCapacityBox
      id="facilities-by-capacity-status-dist-interval"
      title={t('section.facilities_by_capacity_status_dist_interval.title')}
      subtitle={t(
        'section.facilities_by_capacity_status_dist_interval.subtitle'
      )}
      info={
        <p
          dangerouslySetInnerHTML={{
            __html: t(
              'section.facilities_by_capacity_status_dist_interval.info'
            ),
          }}
        />
      }
      lastUpdated={annual?.data?.facility_total?.last_update}
      downloadExtensions={DOWNLOAD_EXTENSIONS}
      onDownloadCSV={handleDownloadCSV}
      isLoading={annual?.isLoading}
      isEmpty={!belowInterval && !aboveInterval}
    >
      <div className="ui-w-full ui-h-[350px]">
        <PieChart
          data={data.filter((d) => d.value > 0)}
          color={PIE_COLORS}
          radius="60%"
          center={['50%', '45%']}
          labelFormatter={`{b} ({d}%, {c} ${t('section.facilities_by_capacity_status_dist_interval.entities')})`}
          tooltipFormatter={`{b}<br/><b>{d}%</b> ({c} ${t('section.facilities_by_capacity_status_dist_interval.entities')})`}
        />
      </div>
    </DashboardColdStorageCapacityBox>
  )
}
