import { numberFormatter } from '#utils/formatter'
import {
  BarElement,
  CategoryScale,
  ChartDatasetProperties,
  Chart as ChartJS,
  ChartOptions,
  LinearScale,
  Title,
  Tooltip,
  TooltipCallbacks,
} from 'chart.js'
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels'
import { Align, Anchor } from 'chartjs-plugin-datalabels/types/options'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'

import {
  dataReducer,
  getLabelColor,
  handleYLabel,
  MAX_Y_AXIS_LABEL_LENGTH,
} from './chart.helper'
import { OverflowLabelType } from './chart.type'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Title,
  ChartDataLabels
)

type Props<T> = {
  rowHeight?: number
  heightContainer?: number
  layout?: 'horizontal' | 'vertical'
  color?: string | string[]
  labelColor?: string
  title?: string
  titleY?: string
  titleX?: string
  tooltipFormatter?: Partial<TooltipCallbacks<'bar'>>
  anchor?: Anchor
  align?: Align
  formatValue?: (value: T, ctx: Context) => string
  maxYLabelLength?: number
  ylabelOverflow?: OverflowLabelType
  onClick?: (item: T) => void
  isDataFormatted?: boolean
  options?: ChartOptions<'bar'>
  data:
    | {
        labels: string[]
        datasets: ChartDatasetProperties<'bar', T[]>[]
      }
    | ChartDatasetProperties<'bar', T[]>['data']
}

const MIN_HEIGHT = 100

export default function BarChart<T>({
  data,
  rowHeight = 30,
  heightContainer,
  layout = 'vertical',
  color = '#22C55E',
  labelColor,
  title,
  titleY,
  titleX,
  tooltipFormatter,
  anchor = 'end',
  align = 'end',
  formatValue,
  maxYLabelLength = MAX_Y_AXIS_LABEL_LENGTH,
  ylabelOverflow,
  onClick,
  isDataFormatted = true,
  options: optionsProps = {},
}: Readonly<Props<T>>) {
  const { scales: { y = {}, x = {} } = {} } = optionsProps
  const { ticks: ticksY, ...optionsY } = y
  const { ticks: ticksX, ...optionsX } = x

  const {
    i18n: { language },
  } = useTranslation()

  const isHorizontal = layout === 'horizontal'
  const totalItems = (data as T[]).length
  const estimatedBarHeight = (heightContainer ?? 0) / totalItems
  const barThickness =
    estimatedBarHeight > 0 ? Math.max(rowHeight, estimatedBarHeight) : rowHeight

  const heightForHorizontal = (totalItems || 0) * barThickness

  const formatNumber = (value?: number) => {
    if (!value) return '0'
    return numberFormatter(value, language)
  }

  let chartData

  if ('datasets' in data) {
    chartData = data
  } else {
    const dataset = isDataFormatted
      ? dataReducer(data)
      : { labels: [], data: [] }

    chartData = {
      labels: dataset.labels,
      datasets: [
        {
          label: title,
          data: isDataFormatted ? dataset.data : data,
          backgroundColor: color,
          maxBarThickness: 150,
        },
      ],
    }
  }

  const options: ChartOptions<'bar'> = {
    indexAxis: isHorizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: !isHorizontal ? 30 : undefined,
        right: isHorizontal ? 30 : undefined,
      },
    },
    onHover: (event, chartElement) => {
      const canvas = event?.native?.target as HTMLCanvasElement
      if (chartElement?.length && onClick) {
        canvas.style.cursor = 'pointer'
      } else {
        canvas.style.cursor = 'default'
      }
    },
    onClick: (_event, elements, chart) => {
      if (onClick && elements.length && chart) {
        const clickedElement = elements[0]
        const datasetIndex = clickedElement.datasetIndex
        const index = clickedElement.index
        const item = chart.data.datasets[datasetIndex].data?.[index] as T

        onClick(item)
      }
    },
    scales: {
      y: {
        title: {
          display: Boolean(titleY),
          text: titleY,
          font: {
            size: 14,
            weight: 'normal',
          },
        },
        grid: {
          display: !isHorizontal,
        },
        ticks: {
          autoSkip: false,
          font: { size: 12 },
          callback: function (value) {
            return isHorizontal
              ? handleYLabel.call(
                  this,
                  Number(value),
                  maxYLabelLength,
                  ylabelOverflow
                ) // ← untuk horizontal bar (Y axis = kategori)
              : String(value) // ← angka biasa di vertical chart
          },
          ...ticksY,
        },
        border: {
          display: false,
        },
        ...optionsY,
      },
      x: {
        title: {
          display: Boolean(titleX),
          text: titleX,
          padding: {
            top: 10,
          },
          font: {
            size: 14,
            weight: 'normal',
          },
        },
        grid: {
          display: isHorizontal,
        },
        ticks: {
          autoSkip: false,
          font: { size: 12 },
          ...ticksX,
        },
        border: {
          display: false,
        },
        ...optionsX,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        position: 'nearest',
        backgroundColor: '#FFF',
        titleColor: '#0C3045',
        bodyColor: '#0C3045',
        borderColor: Array.isArray(color) ? color?.[0] : color,
        borderWidth: 1,
        callbacks: tooltipFormatter,
      },
      title: {
        display: Boolean(title),
        text: title,
        padding: {
          top: 10,
          bottom: 30,
        },
        font: {
          size: 18,
          weight: 'normal',
        },
      },
      datalabels: {
        ...optionsProps?.plugins?.datalabels,
        anchor,
        align,
        color: labelColor ?? getLabelColor(color),
        font: {
          size: 12,
          ...optionsProps?.plugins?.datalabels?.font,
        },
        formatter: (item, context) => {
          const itemValue = isDataFormatted ? item : item?.x
          return formatValue
            ? formatValue(item, context)
            : formatNumber(itemValue)
        },
      },
    },
  }

  return (
    <div
      style={{
        height:
          isHorizontal && heightForHorizontal > MIN_HEIGHT
            ? heightForHorizontal
            : '100%',
      }}
    >
      <Bar data={chartData} options={options} />
    </div>
  )
}
