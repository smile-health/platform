import { TFunction } from 'i18next'

export const humidityThreshold = {
  max: process.env.MAX_HUMIDITY_THRESHOLD
    ? Number(process.env.MAX_HUMIDITY_THRESHOLD)
    : 60,
  min: process.env.MIN_HUMIDITY_THRESHOLD
    ? Number(process.env.MIN_HUMIDITY_THRESHOLD)
    : 30,
}

export enum LoggerActivityTab {
  Temperature = 'temperature',
  Humidity = 'humidity',
}

export const tabList = (
  t: TFunction<['storageTemperatureMonitoringDetail']>
) => [
  {
    label: t(
      'storageTemperatureMonitoringDetail:logger_activity.tabs.temperature'
    ),
    value: LoggerActivityTab.Temperature,
  },
  {
    label: t(
      'storageTemperatureMonitoringDetail:logger_activity.tabs.humidity'
    ),
    value: LoggerActivityTab.Humidity,
  },
]

export const loggerActivitySeriesBase = [
  {
    nameKey:
      'storageTemperatureMonitoringDetail:logger_activity.chart.temperature',
    label: { show: true },
    color: '#7C3AED',
  },
  {
    nameKey:
      'storageTemperatureMonitoringDetail:logger_activity.chart.lower_threshold',
    lineStyle: { type: 'dashed' },
    label: { show: false },
    color: '#51a2ff',
    symbol: 'none',
    showSymbol: false,
  },
  {
    nameKey:
      'storageTemperatureMonitoringDetail:logger_activity.chart.upper_threshold',
    lineStyle: { type: 'dashed' },
    label: { show: false },
    color: '#fb2c36',
    symbol: 'none',
    showSymbol: false,
  },
]

export const loggerActivitySeriesBaseCopy = [
  {
    nameKey:
      'storageTemperatureMonitoringDetail:logger_activity.chart.temperature',
    label: { show: true },
    color: '#7C3AED',
  },
  {
    nameKey:
      'storageTemperatureMonitoringDetail:logger_activity.chart.lower_threshold',
    lineStyle: { type: 'dashed' },
    label: { show: false },
    color: '#51a2ff',
    symbol: 'none',
    showSymbol: false,
  },
  {
    nameKey:
      'storageTemperatureMonitoringDetail:logger_activity.chart.upper_threshold',
    lineStyle: { type: 'dashed' },
    label: { show: false },
    color: '#fb2c36',
    symbol: 'none',
    showSymbol: false,
  },
]
