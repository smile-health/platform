/* eslint-disable @typescript-eslint/no-explicit-any */
import { StackedLineChart } from '#components/chart'
import DashboardCommonChartContainer from '#pages/dashboard/components/DashboardCommonChartContainer'
import { formatNumberShort } from '#utils/formatter'
import dayjs from 'dayjs'
import { LineSeriesOption } from 'echarts/charts'
import { useTranslation } from 'react-i18next'

type Props = {
  isLoading?: boolean
  data: {
    labels: string[]
    series: LineSeriesOption[]
  }
  range?: {
    start?: string | null
    end?: string | null
  }
}

export default function DashboardOrderConsumptionSupplyChart({
  isLoading = false,
  data,
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
      isEmpty={!data?.series?.length}
      subtitle={subtitle}
      fileName="Dashboard Order Consumption Suppy"
    >
      <StackedLineChart
        labels={data?.labels}
        series={data?.series}
        options={{
          tooltip: {
            formatter: (params: any) => {
              const list = Array.isArray(params) ? params : [params]
              const formatted = list.map(
                (item: any) =>
                  `${item.marker} ${item.seriesName}: ${formatNumberShort(Number(item.value ?? 0), language)}`
              )

              return `<b>${list?.[0]?.name}</b><br/>${formatted?.join('<br/>')}`
            },
          },
          legend: {
            bottom: data?.labels?.length > 12 ? 30 : 0,
          },
          grid: {
            bottom: data?.labels?.length > 12 ? 70 : 40,
          },
          yAxis: {
            min: 1,
            splitNumber: 2,
            axisLabel: {
              formatter: (value: number) => formatNumberShort(value, language),
            },
          },
        }}
        className="ui-text-start"
      />
    </DashboardCommonChartContainer>
  )
}
