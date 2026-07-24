import React from 'react'
import { formatNumberShort, numberFormatter } from '#utils/formatter'
import {
  ActiveElement,
  BarElement,
  CategoryScale,
  ChartData,
  ChartEvent,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LegendItem,
  LinearScale,
  Plugin,
  Title,
  Tooltip,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

import {
  getLabelColor,
  handleYLabel,
  MAX_Y_AXIS_LABEL_LENGTH,
} from './chart.helper'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

type StackedBarProps<T> = {
  data: ChartData<'bar', T>
  options?: ChartOptions<'bar'>
  layout?: 'horizontal' | 'vertical'
  maxYLabelLength?: number
  isPercentage?: boolean
  isShortedNumber?: boolean
  isStacked?: boolean
  height?: number | string
  plugins?: Plugin<'bar', any>[]
  enableScroll?: boolean
  minBarHeight?: number
  maxHeight?: number | string
  onClick?: (
    event: ChartEvent,
    elements: ActiveElement[],
    chart: ChartJS
  ) => void
}

export default function StackedBarChart<T>({
  data,
  options = {},
  layout = 'vertical',
  maxYLabelLength = MAX_Y_AXIS_LABEL_LENGTH,
  isPercentage = false,
  isShortedNumber = true,
  isStacked = true,
  height = '100%',
  plugins,
  enableScroll = false,
  minBarHeight = 40,
  maxHeight = 600,
  onClick,
}: StackedBarProps<T>) {
  const {
    i18n: { language },
  } = useTranslation()

  const isHorizontal = layout === 'horizontal'

  // Calculate dynamic height based on number of data items
  const dataLength = data.labels?.length || 0
  const calculatedHeight =
    enableScroll && isHorizontal ? dataLength * minBarHeight + 100 : height

  // Determine container styles for scroll
  const containerHeight = enableScroll && isHorizontal ? maxHeight : height

  const formatNumber = (value?: number) => {
    if (!value) return '0'
    return numberFormatter(value, language)
  }

  const { scales: { y = {}, x = {} } = {} } = options
  const { ticks: ticksY, ...optionsY } = y
  const { ticks: ticksX, ...optionsX } = x

  const defaultOptions: ChartOptions<'bar'> = {
    indexAxis: isHorizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        stacked: isStacked,
        grace: '10%',
        grid: {
          display: !isHorizontal,
        },
        ticks: {
          autoSkip: false,
          font: { size: 12 },
          callback: function (value) {
            return isHorizontal
              ? handleYLabel.call(this, Number(value), maxYLabelLength)
              : String(value)
          },
          ...ticksY,
        },
        border: {
          display: false,
        },
        ...optionsY,
      },
      x: {
        stacked: isStacked,
        grid: {
          display: isHorizontal,
        },
        ticks: {
          autoSkip: false,
          font: { size: 12 },
          maxTicksLimit: 10,
          callback: function (value) {
            if (isHorizontal) {
              const itemValue = Number(value)
              if (itemValue >= 1000 && isShortedNumber) {
                const shortedNumber = formatNumberShort(itemValue, language)
                return isPercentage ? `${shortedNumber}%` : shortedNumber
              }
              return isPercentage ? `${itemValue}%` : itemValue
            }

            return this.getLabelForValue(value as number)
          },
          ...ticksX,
        },
        border: {
          display: false,
        },
        ...optionsX,
      },
    },
    plugins: {
      tooltip: {
        position: 'nearest',
        backgroundColor: '#FFF',
        titleColor: '#0C3045',
        bodyColor: '#0C3045',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        ...options?.plugins?.tooltip,
      },
      legend: {
        display: false,
        position: 'bottom',
        fullSize: false,
        align: 'center',
        ...options?.plugins?.legend,
        labels: {
          usePointStyle: true,
          ...options?.plugins?.legend?.labels,
          generateLabels(chart) {
            const datasets = chart.data.datasets
            const pointStyle = options?.plugins?.legend?.labels
              ?.pointStyle as LegendItem['pointStyle']

            return datasets.map((dataset, i) => {
              const isHidden = !chart.isDatasetVisible(i)

              return {
                text: dataset.label || `Dataset ${i + 1}`,
                datasetIndex: i,
                fillStyle: isHidden
                  ? '#D1D5DB'
                  : (dataset.backgroundColor as string),
                hidden: false,
                lineWidth: 0,
                fontColor: isHidden ? '#6B7280' : '#000',
                pointStyle: pointStyle ?? 'circle',
              }
            })
          },
        },
      },
      datalabels: {
        display: (context) => {
          const value = context.dataset.data[context.dataIndex] as number
          if (isPercentage && value < 10) return false
          return true
        },
        color: (context) => {
          const { dataset, dataIndex } = context
          const bg = dataset.backgroundColor
          const bgColor = Array.isArray(bg) ? bg[dataIndex] : bg
          return getLabelColor(bgColor as string) as string
        },
        font: {
          size: 12,
        },
        formatter: (item) => {
          const objectItemValue = isHorizontal ? item?.x : item?.y
          const itemValue = typeof item === 'number' ? item : objectItemValue
          if (itemValue > 1000 && isShortedNumber) {
            const shortedNumber = formatNumberShort(itemValue, language)
            return isPercentage ? `${shortedNumber}%` : shortedNumber
          }
          return isPercentage ? `${itemValue}%` : formatNumber(itemValue)
        },
        ...options?.plugins?.datalabels,
      },
      title: {
        display: false,
      },
    },
    layout: {
      ...options.layout,
    },
    onHover: (event, chartElement) => {
      const canvas = event?.native?.target as HTMLCanvasElement
      if (chartElement?.length && onClick) {
        canvas.style.cursor = 'pointer'
      } else {
        canvas.style.cursor = 'default'
      }
    },
    onClick,
  }

  return (
    <div
      style={{
        height: containerHeight,
        overflowY: enableScroll && isHorizontal ? 'auto' : 'visible',
        overflowX: enableScroll ? 'visible' : 'hidden',
      }}
    >
      <div style={{ height: calculatedHeight }}>
        <Bar data={data} options={defaultOptions} plugins={plugins} />
      </div>
    </div>
  )
}
