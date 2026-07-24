import { useMemo } from 'react'
import { StackedBarChart } from '#components/chart'
import cx from '#lib/cx'
import { numberFormatter } from '#utils/formatter'
import { ChartData, ChartOptions } from 'chart.js'
import { useTranslation } from 'react-i18next'

import DashboardColdStorageCapacityBox from '../../components/DashboardColdStorageCapacityBox'
import { useExportCceCapacityRemainingQuery } from '../../dashboard-cold-storage-capacity.queries'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'
import { DashboardColdStorageCapacityFilterParams } from '../filter/useDashboardColdStorageCapacityFilterSchema.types'

const REMAINING_CAPACITY_COLORS = {
  volume_used: '#22C55E',
  remaining_volume: '#9CA3AF',
}

const DOWNLOAD_EXTENSIONS = ['png', 'jpg', 'pdf', 'csv']

export default function RemainingCapacity() {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardColdStorageCapacity')

  const { detail, filter } = useDashboardColdStorageCapacity()
  const sortedCapacityRemainingData = detail.data?.capacity_remaining.data
    ?.sort((a, b) => b.min_temperature - a.min_temperature)
    .filter(
      (item) =>
        item.usage_percentage !== null && item.remaining_percentage !== null
    )

  const filterValues = useMemo(
    () => filter.getValues() as DashboardColdStorageCapacityFilterParams,
    [filter]
  )
  const { refetch: exportCSV } = useExportCceCapacityRemainingQuery(
    filterValues,
    detail.isPqs
  )

  const data = {
    labels:
      sortedCapacityRemainingData?.map((item) => [
        `${item.min_temperature ?? '-'}°C ${t('section.remaining_capacity.to')} ${item.max_temperature ?? '-'}°C`,
      ]) || [],
    volumeUsagePercentage:
      sortedCapacityRemainingData?.map((item) => item.usage_percentage ?? 0) ||
      [],
    remainingPercentage:
      sortedCapacityRemainingData?.map(
        (item) => item.remaining_percentage ?? 0
      ) || [],
    entities: {
      volumeUsed:
        sortedCapacityRemainingData?.map((item) => item.volume_material ?? 0) ||
        [],
      remainingVolume:
        sortedCapacityRemainingData?.map(
          (item) => item.remaining_volume ?? 0
        ) || [],
    },
  }

  const handleDownloadCSV = () => {
    exportCSV()
  }

  const chartData: ChartData<'bar'> = {
    labels: data.labels,
    datasets: [
      {
        label: t('section.remaining_capacity.category.volume_used'),
        data: data.volumeUsagePercentage,
        backgroundColor: REMAINING_CAPACITY_COLORS.volume_used,
      },
      {
        label: t('section.remaining_capacity.category.remaining_volume'),
        data: data.remainingPercentage,
        backgroundColor: REMAINING_CAPACITY_COLORS.remaining_volume,
      },
    ],
  }

  const chartOptions: ChartOptions<'bar'> = {
    scales: {
      x: {
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const percentage = context.raw as number
            const entityKeys = ['volumeUsed', 'remainingVolume'] as const
            const key = entityKeys[context.datasetIndex]
            const volume = data.entities[key]?.[context.dataIndex] ?? 0
            return `${context.dataset.label}: ${percentage}% (${numberFormatter(volume, language)} L)`
          },
        },
      },
      datalabels: {
        display: (context) => {
          const value = context.dataset.data[context.dataIndex] as number
          return value >= 3
        },
      },
    },
  }

  return (
    <DashboardColdStorageCapacityBox
      id="remaining-capacity"
      title={t('section.remaining_capacity.title')}
      subtitle={t('section.remaining_capacity.subtitle')}
      info={<p>{t('section.remaining_capacity.info')}</p>}
      lastUpdated={detail?.data?.capacity_remaining?.last_updated}
      downloadExtensions={DOWNLOAD_EXTENSIONS}
      onDownloadCSV={handleDownloadCSV}
      isLoading={detail.isLoading}
      isEmpty={!detail.data?.capacity_remaining?.data?.length}
      contentClassName={cx('ui-justify-start')}
    >
      <div className="ui-w-full">
        <StackedBarChart
          data={chartData}
          layout="horizontal"
          isPercentage
          isShortedNumber={false}
          height={(data.labels.length || 1) * 60 + 80}
          options={chartOptions}
        />
      </div>
    </DashboardColdStorageCapacityBox>
  )
}
