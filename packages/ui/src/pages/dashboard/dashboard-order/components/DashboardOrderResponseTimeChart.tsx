import { StackedBarChart } from '#components/chart'
import DashboardCommonChartContainer from '#pages/dashboard/components/DashboardCommonChartContainer'
import { ChartData } from 'chart.js'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

type Props = {
  isLoading?: boolean
  data: ChartData<'bar', number[]>
  type?: 'day' | 'month'
  range?: {
    start?: string | null
    end?: string | null
  }
}

export default function DashboardOrderResponseTimeChart({
  isLoading = false,
  data,
  type,
  range,
}: Props) {
  const { t } = useTranslation('dashboardOrder')

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
      title={t('title.response_time')}
      subtitle={subtitle}
      fileName="Dashboard Order Response Time"
    >
      <StackedBarChart
        data={data}
        options={{
          scales: {
            y: {
              title: {
                display: true,
                text: 'Day',
                color: '#9CA3AF',
                font: {
                  size: 14,
                  weight: 'bold',
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
                return total
              },
            },
          },
        }}
      />
    </DashboardCommonChartContainer>
  )
}
