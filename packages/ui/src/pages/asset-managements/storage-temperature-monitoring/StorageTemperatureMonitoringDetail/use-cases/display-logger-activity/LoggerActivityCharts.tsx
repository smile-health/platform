import { useMemo } from 'react'
import { StackedLineChart } from '#components/chart'
import { EmptyState } from '#components/empty-state'
import { OptionType } from '#components/react-select'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { formatDateWithoutTimezone } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { LineSeriesOption } from 'echarts/charts'
import { useTranslation } from 'react-i18next'

import { LoggerActivityTab } from '../../storage-temperature-monitoring-detail.constants'
import { useStorageTemperatureMonitoringDetail } from '../../StorageTemperatureMonitoringDetailContext'

export const LoggerActivityCharts = ({
  selectedLogger,
}: {
  selectedLogger?: OptionType | null
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['storageTemperatureMonitoringDetail', 'common'])
  const {
    data,
    activeTab,
    sortedChartData,
    isLoadingChartData,
    historyFilter,
  } = useStorageTemperatureMonitoringDetail()

  const isEmpty = sortedChartData?.length === 0

  const labels = useMemo(() => {
    const items = sortedChartData ?? []
    const isSingleDayRange =
      historyFilter?.date_range?.from_date &&
      historyFilter?.date_range?.to_date &&
      historyFilter?.date_range?.from_date.toString() ===
        historyFilter?.date_range?.to_date.toString()

    return items.map((item) =>
      formatDateWithoutTimezone(
        item.actual_time,
        isSingleDayRange ? 'HH:mm' : 'DD MMM YYYY HH:mm'
      ).toLocaleUpperCase()
    )
  }, [sortedChartData, historyFilter])

  const activeThreshold: any = useMemo(() => {
    if (activeTab === LoggerActivityTab.Humidity) {
      return {
        min: data?.asset_type?.humidity_thresholds?.[0]?.min_humidity ?? 0,
        max: data?.asset_type?.humidity_thresholds?.[0]?.max_humidity ?? 0,
        is_active: 1,
      }
    }

    const threshold = data?.asset_type?.temperature_thresholds?.find((t) => {
      if (t.is_active) {
        return {
          min: t?.min_temperature ?? 0,
          max: t?.max_temperature ?? 0,
          is_active: t?.is_active ?? 0,
        }
      }
    })

    return (
      threshold ?? {
        min: data?.other_min_temperature ?? 0,
        max: data?.other_max_temperature ?? 0,
        is_active: 1,
      }
    )
  }, [data, activeTab])

  const series: LineSeriesOption[] = useMemo(() => {
    const items = sortedChartData ?? []
    const measuredSeries: LineSeriesOption = {
      name:
        activeTab === LoggerActivityTab.Temperature
          ? t(
              'storageTemperatureMonitoringDetail:logger_activity.activity_table.columns.temperature'
            )
          : t(
              'storageTemperatureMonitoringDetail:logger_activity.activity_table.columns.humidity'
            ),
      data:
        activeTab === LoggerActivityTab.Temperature
          ? items.map((item) => Number(item?.temperature ?? 0))
          : items.map((item) => Number(item?.humidity ?? 0)),
      label: {
        show: true,
        formatter: (params: any) =>
          numberFormatter(Number(params?.value), language),
      },
      color:
        activeTab === LoggerActivityTab.Temperature ? '#7C3AED' : '#14B8A6',
    }

    const minValue = Number(
      activeThreshold?.min ?? activeThreshold?.min_temperature ?? 0
    )
    const maxValue = Number(
      activeThreshold?.max ?? activeThreshold?.max_temperature ?? 0
    )

    const upperThresholdSeries: LineSeriesOption = {
      name: t(
        'storageTemperatureMonitoringDetail:logger_activity.chart.threshold',
        {
          metric: activeTab === LoggerActivityTab.Temperature ? '°C' : '%',
          type:
            activeTab === LoggerActivityTab.Temperature
              ? t(
                  'storageTemperatureMonitoringDetail:logger_activity.chart.temperature'
                )
              : t(
                  'storageTemperatureMonitoringDetail:logger_activity.chart.humidity'
                ),
        }
      ),
      data: labels.map(() => maxValue),
      lineStyle: { type: 'dashed' },
      label: { show: false },
      color:
        activeTab === LoggerActivityTab.Temperature ? '#fb2c36' : '#EF4444',
      symbol: 'none',
      showSymbol: false,
    }

    const lowerThresholdSeries: LineSeriesOption = {
      ...upperThresholdSeries,
      data: labels.map(() => minValue),
    }

    return [measuredSeries, lowerThresholdSeries, upperThresholdSeries]
  }, [sortedChartData, activeThreshold, labels, language, t, activeTab])

  const isUseSlider = labels?.length > 8

  return (
    <DashboardBox.Root
      id={`${activeTab === LoggerActivityTab.Temperature ? 'temperature' : 'humidity'}-logger-activity-charts`}
    >
      <DashboardBox.Body>
        <DashboardBox.Config
          download={{
            targetElementId: `${activeTab === LoggerActivityTab.Temperature ? 'temperature' : 'humidity'}-logger-activity-charts`,
            fileName: t(
              'storageTemperatureMonitoringDetail:logger_activity.export.title',
              {
                type:
                  activeTab === LoggerActivityTab.Temperature
                    ? t(
                        'storageTemperatureMonitoringDetail:logger_activity.export.type.temperature'
                      )
                    : t(
                        'storageTemperatureMonitoringDetail:logger_activity.export.type.humidity'
                      ),
                device_information: selectedLogger?.label,
              }
            ),
          }}
          withDownloadAction={true}
          withRegionSection={false}
        />
        <DashboardBox.Content
          isLoading={isLoadingChartData}
          isEmpty={!series?.length}
        >
          <div className="ui-h-96">
            {isEmpty ? (
              <EmptyState
                title={t('common:message.empty.title')}
                description={t('common:message.empty.description')}
                withIcon
              />
            ) : (
              <StackedLineChart
                isLabelRotated={(sortedChartData?.length ?? 0) > 10}
                labels={labels}
                series={series}
                maxVisible={31}
                options={{
                  tooltip: {
                    trigger: 'axis',
                    formatter: (params: any) => {
                      if (!Array.isArray(params) || params.length === 0) {
                        return ''
                      }

                      const minValue = Number(
                        activeThreshold?.min ??
                          activeThreshold?.min_temperature ??
                          0
                      )

                      const date = params[0].axisValueLabel

                      const seriesContent = [...params]
                        .sort((a, b) => {
                          if (a.seriesIndex === 0) return -1
                          if (b.seriesIndex === 0) return 1
                          return a.value - b.value
                        })
                        .map((param) => {
                          const {
                            marker,
                            value,
                            seriesIndex,
                            seriesName: originalName,
                          } = param
                          let seriesName = originalName

                          if (seriesIndex === 1 || seriesIndex === 2) {
                            const isMin = value === minValue
                            const thresholdType = isMin
                              ? 'lower_threshold'
                              : 'upper_threshold'
                            seriesName = t(
                              `storageTemperatureMonitoringDetail:logger_activity.chart.${thresholdType}`,
                              {
                                metric:
                                  activeTab === LoggerActivityTab.Temperature
                                    ? '°C'
                                    : '%',
                              }
                            )
                          }

                          const formattedValue = numberFormatter(
                            Number(value),
                            language
                          )
                          return `${marker} ${seriesName}: <strong>${formattedValue}</strong>`
                        })
                        .join('<br/>')

                      return `${date}<br/>${seriesContent}`
                    },
                  },
                  legend: {
                    bottom: isUseSlider ? 60 : 20,
                    icon: 'circle',
                    textStyle: {
                      fontSize: 14,
                    },
                  },
                  grid: {
                    bottom: isUseSlider ? 100 : 60,
                  },
                  yAxis: {
                    axisLabel: {
                      formatter: (value: number) =>
                        numberFormatter(value, language),
                    },
                  },
                }}
                className="ui-text-start"
              />
            )}
          </div>
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
