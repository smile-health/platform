import { StackedBarChart } from '#components/chart'
import DashboardCommonChartContainer from '#pages/dashboard/components/DashboardCommonChartContainer'
import { formatNumberShort } from '#utils/formatter'
import { ChartData } from 'chart.js'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

type Props = {
  isLoading?: boolean
  data: ChartData<'bar', number[]>
  type?: 'day' | 'month'
  title?: string
  range?: {
    start?: string | null
    end?: string | null
  }
}

export default function DashboardCountStockChart({
  isLoading = false,
  data,
  type,
  title,
  range,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardInventory')

  const subtitle =
    range?.start && range?.end
      ? t('from_to', {
          from: dayjs(range?.start).format('DD-MM-YYYY'),
          to: dayjs(range?.end).format('DD-MM-YYYY'),
        })
      : ''

  return (
    <DashboardCommonChartContainer
      isLoading={isLoading}
      isEmpty={!data?.datasets?.length}
      title={title}
      subtitle={subtitle}
      fileName="Dashboard Inventory Add/Remove Stock"
    >
      <StackedBarChart
        data={data}
        options={{
          scales: {
            y: {
              ticks: {
                callback(tickValue: number) {
                  return formatNumberShort(tickValue, language)
                },
              },
            },
            x: {
              ticks: {
                minRotation: type === 'day' ? 45 : 0,
                maxRotation: 45,
                font: {
                  size: type === 'day' ? 10 : 12,
                },
              },
            },
          },
          plugins: {
            legend: {
              display: true,
            },
            datalabels: {
              display: (context) => {
                const index = context.chart.data.datasets.findLastIndex(
                  (_d, i) => context.chart.isDatasetVisible(i)
                )
                const datasetIndex = context.datasetIndex
                return datasetIndex === index
              },
              anchor: 'end',
              align: 'end',
              color: '#404040',
              formatter: (_, context) => {
                const index = context.dataIndex

                const chartData = context.chart.data.datasets
                const total = chartData?.reduce(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (sum: number, ds: any, i) => {
                    const isActive = context.chart.isDatasetVisible(i)
                    return sum + (isActive ? ds?.data?.[index] : 0)
                  },
                  0
                )
                return formatNumberShort(total, language)
              },
            },
          },
        }}
      />
    </DashboardCommonChartContainer>
  )
}
