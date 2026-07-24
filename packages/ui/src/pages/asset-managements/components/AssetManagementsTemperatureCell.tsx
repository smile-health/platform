import { useMemo } from 'react'
import { parseDateTime } from '#utils/date'

import { TTemperatureThreshold } from '../asset-managements.types'
import { MetricIndicator } from './MetricIndicator'

type AssetManagementsTemperatureCellProps = {
  threshold?: TTemperatureThreshold
  temperature: number
  updatedAt: string
}

const AssetManagementsTemperatureCell: React.FC<
  AssetManagementsTemperatureCellProps
> = ({ temperature, threshold, updatedAt }) => {
  const date = parseDateTime(updatedAt, 'DD MMM YYYY HH:mm').toLocaleUpperCase()
  const metricData = useMemo(() => {
    return {
      value: temperature,
      threshold: {
        min_value: threshold?.min_temperature ?? 0,
        max_value: threshold?.max_temperature ?? 0,
      },
    }
  }, [temperature, threshold])

  return (
    <div className="ui-flex ui-flex-col">
      <MetricIndicator
        value={metricData?.value}
        threshold={metricData?.threshold}
      />
      <div className="ui-text-sm ui-text-gray-500">{date}</div>
    </div>
  )
}

export default AssetManagementsTemperatureCell
