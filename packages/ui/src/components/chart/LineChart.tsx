import { useEffect, useRef } from 'react'
import { numberFormatter } from '#utils/formatter'
import { LineChart as ELineChart } from 'echarts/charts'
import {
  DatasetComponent,
  DataZoomComponent,
  GridComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useTranslation } from 'react-i18next'

import { dataReducer } from './chart.helper'
import { LineOptions } from './chart.type'

type Props = {
  data: { label: string; value: number }[]
  color?: string
  maxVisible?: number
  showSymbol?: boolean
  isPercentage?: boolean
  options?: LineOptions
}

const MAX_VISIBLE = 12

// Register only used components (modular)
echarts.use([
  ELineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  DatasetComponent,
  TitleComponent,
  MarkPointComponent,
  CanvasRenderer,
])

export default function LineChart({
  data,
  color = '#22C55E',
  maxVisible = MAX_VISIBLE,
  showSymbol = true,
  isPercentage,
  options = {},
}: Readonly<Props>) {
  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<echarts.ECharts | null>(null)

  const {
    i18n: { language },
  } = useTranslation()

  const formatNumber = (value?: number) => {
    if (!value) return '0'
    return numberFormatter(value, language)
  }

  const dataset = dataReducer(data)

  const totalData = data?.length
  const isUseSlider = totalData > maxVisible
  const end = isUseSlider ? (maxVisible / totalData) * 100 : 100

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current, undefined, {
      renderer: 'canvas',
    })
    instanceRef.current = chart

    const { xAxis, yAxis, ...restOptions } = options

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = params?.[0]
          const formattedValue = formatNumber(item?.value)
          const finalValue = isPercentage
            ? `${formattedValue}%`
            : formattedValue
          return `${item?.name}, ${finalValue}`
        },
      },
      grid: {
        left: 0,
        right: 0,
        top: '7%',
        bottom: 30,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dataset.labels,
        axisLabel: {
          interval: 0,
        },
        ...(xAxis ?? {}),
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '10%'],
        minInterval: 1,

        ...(yAxis ?? {}),
      },
      series: [
        {
          type: 'line',
          data: dataset.data,
          showSymbol,
          itemStyle: {
            color,
          },
          label: {
            show: true,
            position: 'top',
            formatter: (v: any) => {
              return isPercentage
                ? `${formatNumber(v?.value)}%`
                : formatNumber(v?.value)
            },
          },
        },
      ],
      dataZoom: isUseSlider
        ? [
            {
              type: 'slider',
              start: 0,
              end,
              bottom: 10,
              height: 10,
              zoomLock: true,
              backgroundColor: '#ebebeb',
              fillerColor: '#8d8d8d',
              borderColor: '#b0b0b0',
              handleStyle: {
                color: '#ffffff',
                borderColor: '#b0b0b0',
              },
            },
          ]
        : undefined,
      ...restOptions,
    }

    chart.setOption(option)

    const resize = () => chart.resize()
    window.addEventListener('resize', resize)

    return () => {
      chart.dispose()
      window.removeEventListener('resize', resize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dataset,
    language,
    color,
    maxVisible,
    isUseSlider,
    end,
    isPercentage,
    showSymbol,
    options,
  ])

  return <div ref={chartRef} style={{ width: '100%', height: 300 }} />
}
