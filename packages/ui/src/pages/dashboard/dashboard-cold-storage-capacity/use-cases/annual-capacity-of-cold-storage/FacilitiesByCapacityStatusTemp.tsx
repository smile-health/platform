import { useMemo } from 'react'
import { StackedBarChart } from '#components/chart'
import { numberFormatter } from '#utils/formatter'
import { ChartData, ChartOptions } from 'chart.js'
import { useTranslation } from 'react-i18next'

import DashboardColdStorageCapacityBox from '../../components/DashboardColdStorageCapacityBox'
import { useExportCceAnnualFacilityPercentageQuery } from '../../dashboard-cold-storage-capacity.queries'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'
import { DashboardColdStorageCapacityFilterParams } from '../filter/useDashboardColdStorageCapacityFilterSchema.types'

const CATEGORY_COLORS = {
  below_interval: '#22C55E',
  above_interval: '#EAB308',
}

const DOWNLOAD_EXTENSIONS = ['png', 'jpg', 'pdf', 'csv']

export default function FacilitiesByCapacityStatusTemp() {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardColdStorageCapacity')

  const { annual, filter } = useDashboardColdStorageCapacity()
  const filterValues = useMemo(
    () => filter.getValues() as DashboardColdStorageCapacityFilterParams,
    [filter]
  )
  const { refetch: exportCSV } =
    useExportCceAnnualFacilityPercentageQuery(filterValues)

  const data = {
    labels:
      annual?.data?.facility_percentage?.data?.map(
        (item) =>
          `${item.material_temperature_min}°C ${t('section.facilities_by_capacity_status_temp.to')} ${item.material_temperature_max}°C`
      ) ?? [],
    belowInterval: {
      color: CATEGORY_COLORS.below_interval,
      qty:
        annual?.data?.facility_percentage.data?.map(
          (item) => item.below_interval ?? 0
        ) ?? [],
      percentage:
        annual?.data?.facility_percentage.data?.map(
          (item) => item.below_interval_percentage ?? 0
        ) ?? [],
    },
    aboveInterval: {
      color: CATEGORY_COLORS.above_interval,
      qty:
        annual?.data?.facility_percentage.data?.map(
          (item) => item.above_interval ?? 0
        ) ?? [],
      percentage:
        annual?.data?.facility_percentage.data?.map(
          (item) => item.above_interval_percentage ?? 0
        ) ?? [],
    },
  }

  const handleDownloadCSV = () => {
    exportCSV()
  }

  const chartData: ChartData<'bar'> = {
    labels: data.labels,
    datasets: [
      {
        label: t(
          'section.facilities_by_capacity_status_temp.category.below_interval'
        ),
        data: data.belowInterval.percentage,
        backgroundColor: data.belowInterval.color,
      },
      {
        label: t(
          'section.facilities_by_capacity_status_temp.category.above_interval'
        ),
        data: data.aboveInterval.percentage,
        backgroundColor: data.aboveInterval.color,
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
            const qtyByCategory = [
              data.belowInterval.qty,
              data.aboveInterval.qty,
            ]
            const entityCount =
              qtyByCategory[context.datasetIndex][context.dataIndex]
            return `${context.dataset.label}: ${percentage}% (${numberFormatter(entityCount, language)} ${t('section.facilities_by_capacity_status_temp.entities')})`
          },
        },
      },
      datalabels: {
        display: (context) => {
          const value = context.dataset.data[context.dataIndex] as number
          return value >= 10
        },
      },
    },
  }

  return (
    <DashboardColdStorageCapacityBox
      id="facilities-by-capacity-status-temp"
      title={t('section.facilities_by_capacity_status_temp.title')}
      subtitle={t('section.facilities_by_capacity_status_temp.subtitle')}
      info={
        <p
          dangerouslySetInnerHTML={{
            __html: t('section.facilities_by_capacity_status_temp.info'),
          }}
        />
      }
      lastUpdated={annual?.data?.facility_percentage?.last_update}
      downloadExtensions={DOWNLOAD_EXTENSIONS}
      onDownloadCSV={handleDownloadCSV}
      isLoading={annual?.isLoading}
      isEmpty={!data.belowInterval.qty.length && !data.aboveInterval.qty.length}
    >
      <div className="ui-w-full ui-h-[300px]">
        <StackedBarChart
          data={chartData}
          layout="horizontal"
          isPercentage
          isShortedNumber={false}
          enableScroll
          maxHeight={300}
          options={chartOptions}
        />
      </div>
    </DashboardColdStorageCapacityBox>
  )
}
