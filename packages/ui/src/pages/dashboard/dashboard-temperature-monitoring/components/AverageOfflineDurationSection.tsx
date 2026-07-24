import { StackedLineChart } from '#components/chart'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { AvgOfflineDurationDaily } from '../dashboard-temperature-monitoring.types'
import DashboardTemperatureMonitoringBox from './DashboardTemperatureMonitoringBox'

type AverageOfflineDurationSectionProps = Readonly<{
  data?: {
    items?: AvgOfflineDurationDaily[]
    lastUpdated?: string
  }
  isLoading?: boolean
}>

const COLORS = {
  lessThanOneHour: '#F59E0B',
  oneToTenHours: '#EF4444',
  moreThanTenHours: '#7C3AED',
}

export default function AverageOfflineDurationSection({
  data,
  isLoading,
}: AverageOfflineDurationSectionProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardAssetTemperatureMonitoring')

  const items = data?.items ?? []

  const labels = items.map((item) => {
    const date = new Date(item.logger_date)
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'long',
    })
  })

  const series = [
    {
      name: t('offline_duration.less_than_one_hour'),
      data: items.map((item) => ({
        value: item.less_than_one_hour,
        rtmdCount: item.total_less_than_one_hour,
        originalDate: item.logger_date,
      })),
      itemStyle: { color: COLORS.lessThanOneHour },
      lineStyle: { color: COLORS.lessThanOneHour },
    },
    {
      name: t('offline_duration.one_to_ten_hours'),
      data: items.map((item) => ({
        value: item.between_one_ten_hour,
        rtmdCount: item.total_between_one_ten_hour,
        originalDate: item.logger_date,
      })),
      itemStyle: { color: COLORS.oneToTenHours },
      lineStyle: { color: COLORS.oneToTenHours },
    },
    {
      name: t('offline_duration.more_than_ten_hours'),
      data: items.map((item) => ({
        value: item.more_than_ten_hour,
        rtmdCount: item.total_more_than_ten_hour,
        originalDate: item.logger_date,
      })),
      itemStyle: { color: COLORS.moreThanTenHours },
      lineStyle: { color: COLORS.moreThanTenHours },
    },
  ]

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <DashboardTemperatureMonitoringBox
      id="average-offline-duration-chart"
      title={t('offline_duration.title')}
      info={<p className="ui-text-gray-500">{t('offline_duration.info')}</p>}
      isLoading={isLoading}
      isEmpty={!items.length}
    >
      <div className="ui-h-[450px] ui-w-full">
        <StackedLineChart
          labels={labels}
          series={series}
          options={{
            xAxis: {
              name: t('offline_duration.x_axis'),
              nameLocation: 'middle',
              nameGap: 30,
            },
            yAxis: {
              name: t('offline_duration.y_axis'),
              nameLocation: 'middle',
              nameGap: 60,
            },
            grid: {
              left: 80,
              bottom: 60,
            },
            tooltip: {
              trigger: 'axis',
              formatter: (params: unknown) => {
                const list = Array.isArray(params) ? params : [params]
                if (!list.length) return ''

                const firstItem = list[0]?.data
                const dateHeader = firstItem?.originalDate
                  ? `<div style="font-weight: bold; margin-bottom: 8px;">${formatFullDate(firstItem.originalDate)}</div>`
                  : ''

                const rows = list
                  .map(
                    (item: {
                      data: { value: number; rtmdCount: number }
                      marker: string
                      seriesName: string
                    }) => {
                      const value = numberFormatter(
                        Number(item.data?.value ?? 0),
                        language
                      )
                      const rtmdCount = numberFormatter(
                        Number(item.data?.rtmdCount ?? 0),
                        language
                      )
                      const hourUnit = t('offline_duration.hours_unit')

                      return `
                      <div style="margin-bottom: 4px;">
                        ${item.marker} ${item.seriesName}: ${value} ${hourUnit}
                      </div>
                      <div style="margin-bottom: 8px; padding-left: 14px; color: #666;">
                        ${t('offline_duration.number_of_rtmd')}: ${rtmdCount}
                      </div>
                    `
                    }
                  )
                  .join('')

                return `${dateHeader}${rows}`
              },
            },
          }}
        />
      </div>
      {data?.lastUpdated && (
        <p className="ui-text-xs ui-text-gray-500 ui-text-center ui-mt-4 py-2">
          {t('summary.last_updated_at', { time: data.lastUpdated })}
        </p>
      )}
    </DashboardTemperatureMonitoringBox>
  )
}
