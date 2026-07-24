import { StackedBarChart } from '#components/chart'
import { numberFormatter } from '#utils/formatter'
import { ChartData } from 'chart.js'
import { useTranslation } from 'react-i18next'

import { RtmdStatus } from '../dashboard-temperature-monitoring.types'
import DashboardTemperatureMonitoringBox from './DashboardTemperatureMonitoringBox'

type RtmdStatusSectionProps = Readonly<{
  data?: {
    items?: RtmdStatus[]
    lastUpdated?: string
  }
  isLoading?: boolean
}>

const COLORS = {
  online: '#0D85BC',
  offline: '#9CA3AF',
}

export default function RtmdStatusSection({
  data,
  isLoading,
}: RtmdStatusSectionProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardAssetTemperatureMonitoring')

  const items = data?.items ?? []

  const chartData: ChartData<'bar', number[]> = {
    labels: items.map((item) => [
      item.asset_type,
      `(${item.min_temp}°C to ${item.max_temp}°C)`,
    ]),
    datasets: [
      {
        label: t('rtmd_status.online'),
        data: items.map((item) => item.online),
        backgroundColor: COLORS.online,
      },
      {
        label: t('rtmd_status.offline'),
        data: items.map((item) => item.offline),
        backgroundColor: COLORS.offline,
      },
    ],
  }

  const MIN_CHART_HEIGHT = 450
  const chartHeight = Math.max(items.length * 45, MIN_CHART_HEIGHT)

  return (
    <DashboardTemperatureMonitoringBox
      id="rtmd-status-chart"
      title={t('rtmd_status.title')}
      info={<p className="ui-text-gray-500">{t('rtmd_status.info')}</p>}
      isLoading={isLoading}
      isEmpty={!items.length}
    >
      <div
        className="ui-overflow-y-auto ui-w-full"
        style={{ maxHeight: MIN_CHART_HEIGHT }}
      >
        <div
          className="ui-w-full"
          style={{ height: chartHeight, minHeight: chartHeight }}
        >
          <StackedBarChart
            data={chartData}
            layout="horizontal"
            isPercentage
            options={{
              scales: {
                x: {
                  max: 100,
                  ticks: {
                    stepSize: 25,
                  },
                },
              },
              plugins: {
                legend: {
                  display: false,
                  position: 'top',
                },
                tooltip: {
                  callbacks: {
                    title: () => '',
                    label: (context) => {
                      const index = context.dataIndex
                      const item = items[index]
                      const value = context.raw as number
                      const isOnline = context.datasetIndex === 0
                      const count = isOnline
                        ? item.total_online
                        : item.total_offline
                      const tempRange = `${item.min_temp}°C to ${item.max_temp}°C`
                      return `${item.asset_type} (${tempRange}): ${value}% (${numberFormatter(count, language)} ${isOnline ? 'Online' : 'Offline'})`
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>
      <div className="ui-flex ui-items-center ui-justify-center ui-gap-4 ui-mt-4 ui-relative ui-left-24">
        <div className="ui-flex ui-items-center ui-gap-2">
          <div
            className="ui-w-4 ui-h-4 ui-rounded-full"
            style={{ backgroundColor: COLORS.online }}
          />
          <p className="ui-text-sm ui-text-gray-500">Online</p>
        </div>
        <div className="ui-flex ui-items-center ui-gap-2">
          <div
            className="ui-w-4 ui-h-4 ui-rounded-full"
            style={{ backgroundColor: COLORS.offline }}
          />
          <p className="ui-text-sm ui-text-gray-500">Offline</p>
        </div>
      </div>
      {data?.lastUpdated && (
        <p className="ui-text-xs ui-text-gray-500 ui-text-center ui-mt-4 ui-pb-2">
          {t('summary.last_updated_at', { time: data.lastUpdated })}
        </p>
      )}
    </DashboardTemperatureMonitoringBox>
  )
}
