/* eslint-disable @typescript-eslint/no-explicit-any */
import { StackedLineChart } from '#components/chart'
import DashboardCommonChartContainer from '#pages/dashboard/components/DashboardCommonChartContainer'
import { formatNumberShort } from '#utils/formatter'
import dayjs from 'dayjs'
import { LineSeriesOption } from 'echarts/charts'
import { useTranslation } from 'react-i18next'

type Props = {
  isLoading?: boolean
  title?: string
  data: {
    labels: string[]
    series: LineSeriesOption[]
  }
  range?: {
    start?: string | null
    end?: string | null
  }
}

export default function DashboardStockAvailabilityChart({
  isLoading = false,
  title,
  data,
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

  const isUseSlider = data?.labels?.length > 12

  return (
    <DashboardCommonChartContainer
      isLoading={isLoading}
      isEmpty={!data?.series?.length}
      title={title}
      subtitle={subtitle}
      fileName="Dashboard Inventory Stock Availability"
    >
      <StackedLineChart
        labels={data?.labels}
        series={data?.series}
        options={{
          title: {
            subtext: '% Durasi Ketersediaan',
            bottom: isUseSlider ? 50 : 25,
            subtextStyle: {
              fontSize: 13,
            },
          },
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
            bottom: isUseSlider ? 25 : 0,
          },
          grid: {
            bottom: isUseSlider ? 75 : 60,
          },
          yAxis: {
            min: 1,
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
