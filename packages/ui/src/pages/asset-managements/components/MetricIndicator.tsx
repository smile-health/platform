import cx from '#lib/cx'

export type MetricIndicatorProps = {
  value?: number | string
  threshold?: {
    single_value?: number | null
    min_value?: number | null
    max_value?: number | null
  }
  unit?: string
  type?: 'temperature' | 'connection'
  icon?: React.ReactNode
}

const getTemperatureColor = (
  value: number | string,
  threshold?: MetricIndicatorProps['threshold']
) => {
  const numValue = Number(value)
  const { single_value, min_value, max_value } = threshold || {}

  if (single_value !== undefined) {
    return numValue > Number(single_value)
      ? 'ui-text-red-500'
      : 'ui-text-green-500'
  }

  if (min_value !== undefined && max_value !== undefined) {
    const isOutOfRange =
      numValue < Number(min_value) || numValue > Number(max_value)
    return isOutOfRange ? 'ui-text-red-500' : 'ui-text-green-500'
  }

  return undefined
}

const getConnectionColor = (value: number | string) => {
  if (value === 'N/A') {
    return 'ui-text-gray-500'
  }
  return Number(value) <= 20 ? 'ui-text-red-500' : 'ui-text-green-500'
}

export const MetricIndicator: React.FC<MetricIndicatorProps> = ({
  value,
  threshold,
  unit = '°C',
  type = 'temperature',
  icon,
}) => {
  if (value === null || value === undefined) {
    return null
  }

  const isConnection = type === 'connection'
  const color = isConnection
    ? getConnectionColor(value)
    : getTemperatureColor(value, threshold)

  const displayUnit = isConnection && value === 'N/A' ? '' : (unit ?? '')

  return (
    <div
      className={cx(
        'ui-text-sm ui-font-bold ui-flex ui-items-center ui-gap-1',
        color
      )}
    >
      {icon}
      {value}
      {displayUnit}
    </div>
  )
}
