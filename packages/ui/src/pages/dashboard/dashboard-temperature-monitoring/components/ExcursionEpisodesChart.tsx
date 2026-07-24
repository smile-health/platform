import { StackedLineChart } from '#components/chart'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import DashboardBox from '../../components/DashboardBox'
import { TotalEventsByCategory } from '../dashboard-temperature-monitoring.types'

type ExcursionEpisodesChartProps = Readonly<{
  data?: TotalEventsByCategory[]
  isLoading?: boolean
  lastUpdated?: string
}>

const COLORS = {
  below: '#3B82F6',
  between: '#10B981',
  above: '#EF4444',
}

export default function ExcursionEpisodesChart({
  data,
  isLoading,
  lastUpdated,
}: ExcursionEpisodesChartProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardAssetTemperatureMonitoring')

  const items = data?.length ? data : []
  const labels = items.map((item) => item.week.toString())

  const series = [
    {
      name: t('temperature_excursion.charts.legend.below'),
      data: items.map((item) => item.less_than_temp),
      itemStyle: { color: COLORS.below },
      lineStyle: { color: COLORS.below },
    },
    {
      name: t('temperature_excursion.charts.legend.between'),
      data: items.map((item) => item.between_temp),
      itemStyle: { color: COLORS.between },
      lineStyle: { color: COLORS.between },
    },
    {
      name: t('temperature_excursion.charts.legend.above'),
      data: items.map((item) => item.more_than_temp),
      itemStyle: { color: COLORS.above },
      lineStyle: { color: COLORS.above },
    },
  ]

  return (
    <DashboardBox.Root
      id="excursion-episodes-chart"
      className="ui-flex ui-flex-col ui-flex-1"
    >
      <DashboardBox.Header className="ui-bg-white ui-border-b ui-border-gray-200">
        <div className="ui-flex ui-flex-col ui-items-center ui-justify-center">
          <div className="ui-flex ui-items-center ui-gap-1">
            <h3 className="ui-font-semibold ui-text-sm">
              {t('temperature_excursion.charts.excursion_episodes.title')}
            </h3>
            <DashboardBox.InfoModal
              title={
                <p>
                  {t('temperature_excursion.charts.excursion_episodes.title')}
                  <br />
                  {t(
                    'temperature_excursion.charts.excursion_episodes.subtitle'
                  )}
                </p>
              }
            >
              <p className="ui-text-gray-500">
                {t('temperature_excursion.charts.excursion_episodes.info')}
              </p>
            </DashboardBox.InfoModal>
          </div>
          <p className="ui-text-xs ui-text-gray-500">
            {t('temperature_excursion.charts.excursion_episodes.subtitle')}
          </p>
        </div>
      </DashboardBox.Header>
      <DashboardBox.Body className="ui-flex ui-flex-col ui-flex-1">
        <DashboardBox.Config
          download={{
            targetElementId: 'excursion-episodes-chart',
            fileName: t(
              'temperature_excursion.charts.excursion_episodes.title'
            ),
          }}
          withRegionSection={false}
        />
        <DashboardBox.Content
          isLoading={isLoading}
          isEmpty={!items.length}
          className="ui-flex-1"
        >
          <div className="ui-h-[300px] ui-flex-1">
            <StackedLineChart
              labels={labels}
              series={series}
              options={{
                tooltip: {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter: (params: any) => {
                    const list = Array.isArray(params) ? params : [params]
                    const weekLabel = `Week ${list[0]?.axisValue}`
                    const seriesLines = list
                      .map(
                        (item: {
                          marker: string
                          seriesName: string
                          value: number
                        }) =>
                          `${item.marker} ${item.seriesName}: ${numberFormatter(Number(item.value), language)}`
                      )
                      .join('<br/>')
                    return `${weekLabel}<br/>${seriesLines}`
                  },
                },
                xAxis: {
                  axisLabel: {
                    formatter: (value: string) => `Week ${value}`,
                  },
                },
                yAxis: {
                  name: t(
                    'temperature_excursion.charts.excursion_episodes.y_axis'
                  ),
                  nameLocation: 'middle',
                  nameGap: 50,
                },
                grid: {
                  bottom: 60,
                  left: 70,
                },
              }}
            />
          </div>
          <p className="ui-text-xs ui-text-gray-500 ui-text-center ui-mt-2 ui-pb-2">
            {t('summary.last_updated_at', { time: lastUpdated })}
          </p>
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
