import { useMemo } from 'react'
import { MetricIndicator } from '#pages/asset-managements/components/MetricIndicator'
import { formatDateWithoutTimezone } from '#utils/date'
import { useTranslation } from 'react-i18next'

import {
  THumidityThreshold,
  TRelationData,
  TTemperatureThreshold,
} from '../../../../asset-managements.types'

type TemperatureCellProps = {
  log: TRelationData['latest_log']
  threshold?: TTemperatureThreshold
  isWarehouse?: boolean
  description?: string | null
  humidityThreshold?: THumidityThreshold
  isList?: boolean
}

export const TemperatureCell: React.FC<TemperatureCellProps> = ({
  log,
  threshold,
  isWarehouse,
  description,
  humidityThreshold,
  isList = true,
}) => {
  const { t } = useTranslation(['storageTemperatureMonitoringDetail'])
  const date = log?.actual_time
    ? formatDateWithoutTimezone(
        log.actual_time,
        'DD MMM YYYY HH:mm'
      ).toUpperCase()
    : '-'

  const temperatureThreshold = useMemo(() => {
    if (!threshold) return undefined
    return {
      min_value: threshold.min_temperature,
      max_value: threshold.max_temperature,
    }
  }, [threshold])

  const thresholdHumidity = useMemo(() => {
    if (!humidityThreshold) return undefined
    return {
      min_value: humidityThreshold.min_humidity,
      max_value: humidityThreshold.max_humidity,
    }
  }, [humidityThreshold])

  if (!log) {
    return '-'
  }

  return (
    <div className="ui-flex ui-flex-col">
      {isList && isWarehouse && (
        <p className="ui-text-sm ui-font-semibold ui-text-gray-500">
          {t(
            'storageTemperatureMonitoringDetail:relation_table.columns.asset_temperature.description'
          )}
          : <span className="ui-text-sm">{description}</span>
        </p>
      )}
      <div className="ui-flex ui-items-center ui-gap-1">
        <span className="ui-text-sm">
          {t(
            'storageTemperatureMonitoringDetail:relation_table.columns.asset_temperature.temperature'
          )}
        </span>
        <MetricIndicator
          value={log.temperature}
          threshold={temperatureThreshold}
          unit="°C"
        />
      </div>
      {isWarehouse && log.humidity != null && (
        <div className="ui-flex ui-items-center ui-gap-1">
          <span className="ui-text-sm">
            {t(
              'storageTemperatureMonitoringDetail:relation_table.columns.asset_temperature.humidity'
            )}
          </span>
          <MetricIndicator
            value={log.humidity}
            threshold={thresholdHumidity}
            unit="%"
          />
        </div>
      )}
      <div className="ui-text-sm ui-text-gray-500">{date}</div>
    </div>
  )
}
