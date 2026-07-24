import { useMemo } from 'react'
import { PieChart } from '#components/chart'
import { useTranslation } from 'react-i18next'

import DashboardColdStorageCapacityBox from '../../components/DashboardColdStorageCapacityBox'
import { useExportCceEntityByCapacityStatusQuery } from '../../dashboard-cold-storage-capacity.queries'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'
import { DashboardColdStorageCapacityFilterParams } from '../filter/useDashboardColdStorageCapacityFilterSchema.types'

const DOWNLOAD_EXTENSIONS = ['png', 'jpg', 'pdf', 'csv']

export default function NumberOfEntity() {
  const { t } = useTranslation('dashboardColdStorageCapacity')
  const { overview, filter } = useDashboardColdStorageCapacity()
  const filterValues = useMemo(
    () => filter.getValues() as DashboardColdStorageCapacityFilterParams,
    [filter]
  )
  const { refetch: exportCSV } =
    useExportCceEntityByCapacityStatusQuery(filterValues)

  const buffer =
    overview?.data?.entity_by_coldstorage_status_capacity?.count_buffer || 0
  const ideal =
    overview?.data?.entity_by_coldstorage_status_capacity?.count_ideal || 0
  const max =
    overview?.data?.entity_by_coldstorage_status_capacity?.count_max || 0

  const data = [
    {
      name: t('section.number_of_entity.category.low'),
      value: buffer,
      itemStyle: { color: '#FFC002' },
    },
    {
      name: t('section.number_of_entity.category.medium'),
      value: ideal,
      itemStyle: { color: '#4FC44D' },
    },
    {
      name: t('section.number_of_entity.category.high'),
      value: max,
      itemStyle: { color: '#EF476F' },
    },
  ]

  return (
    <DashboardColdStorageCapacityBox
      id="number-of-entity"
      title={t('section.number_of_entity.title')}
      subtitle={t('section.number_of_entity.title_by')}
      info={<p>{t('section.number_of_entity.info')}</p>}
      lastUpdated={
        overview?.data?.entity_by_coldstorage_status_capacity?.last_update
      }
      downloadExtensions={DOWNLOAD_EXTENSIONS}
      onDownloadCSV={() => exportCSV()}
      isLoading={overview?.isLoading}
      isEmpty={!buffer && !ideal && !max}
    >
      <div className="ui-w-full ui-h-[350px]">
        <PieChart
          data={data.filter((d) => d.value > 0)}
          radius="60%"
          center={['50%', '45%']}
          labelFormatter={`{b}, {c} ${t('section.number_of_entity.entities')}`}
          tooltipFormatter={`{b}<br/><b>{d}%</b> ({c} ${t('section.number_of_entity.entities')})`}
        />
      </div>
    </DashboardColdStorageCapacityBox>
  )
}
