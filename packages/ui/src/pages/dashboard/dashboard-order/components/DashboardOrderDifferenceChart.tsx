import { StackedBarChart } from '#components/chart'
import DashboardCommonChartContainer from '#pages/dashboard/components/DashboardCommonChartContainer'
import { formatNumberShort } from '#utils/formatter'
import { ChartData } from 'chart.js'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { secondTopTick } from '../../dashboard.helper'

type Props = {
  isLoading?: boolean
  data: ChartData<'bar', number[]>
  type?: 'day' | 'month'
  range?: {
    start?: string | null
    end?: string | null
  }
}

export default function DashboardOrderDifferenceChart({
  isLoading = false,
  data,
  type,
  range,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardOrder')

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
      title={t('title.order_difference')}
      subtitle={subtitle}
      fileName="Dashboard Order Difference"
    >
      <StackedBarChart
        data={data}
        isStacked={false}
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
              anchor: 'end',
              align: (ctx) => {
                const yScale = ctx.chart.scales.y
                const threshold = secondTopTick(yScale)
                const value = Number(ctx.dataset.data[ctx.dataIndex] as number)
                return value >= threshold ? 'start' : 'end'
              },
              rotation: (ctx) => {
                const index = ctx.dataIndex
                const value = Number(ctx.dataset?.data?.[index] ?? 0)

                return value > 0 ? -90 : 0
              },
            },
          },
        }}
      />
    </DashboardCommonChartContainer>
  )
}
