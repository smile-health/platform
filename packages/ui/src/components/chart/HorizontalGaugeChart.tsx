'use client'

import { useEffect, useRef } from 'react'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  MarkPointComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  CanvasRenderer,
])

type Datum = {
  name: string
  value: number
  color: string
  pointerValue?: number
}

type Props = {
  data: Datum[]
  unit?: string
  scaleMax?: number
  scaleSteps?: number
  showTooltip?: boolean
}

export default function HorizontalGaugeChart({
  data,
  unit = '',
  scaleMax,
  scaleSteps = 4,
  showTooltip = true,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<echarts.ECharts>()

  useEffect(() => {
    if (chartRef.current && !instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current)
    }

    const chart = instanceRef.current
    if (!chart) return

    const total = data.reduce((sum, d) => sum + d.value, 0)
    const hasScale = scaleMax !== undefined && scaleMax > 0
    const axisMax = hasScale ? scaleMax : total
    const scaleInterval = hasScale ? scaleMax / scaleSteps : undefined

    const series = data.map((item, index) => {
      let cumulative = 0
      for (let i = 0; i <= index; i++) {
        cumulative += data[i].value
      }

      const pointerPos = item.pointerValue ?? cumulative

      const seriesItem: Record<string, any> = {
        name: item.name,
        type: 'bar' as const,
        stack: 'total',
        barWidth: 20,
        itemStyle: {
          color: item.color,
          borderRadius:
            index === 0
              ? [3, 0, 0, 3]
              : index === data.length - 1
                ? [0, 3, 3, 0]
                : 0,
        },
        label: {
          show: item.pointerValue === undefined,
          position:
            index === data.length - 1
              ? ('insideRight' as const)
              : ('right' as const),
          offset: [-5, -20],
          formatter: `${cumulative} ${unit}`,
          color: '#404040',
          fontSize: 12,
          fontWeight: 'bold' as const,
        },
        data: [item.value],
      }

      if (index === 0) {
        seriesItem.markPoint = {
          symbol: 'triangle',
          symbolSize: 12,
          symbolRotate: 180,
          symbolOffset: [5, -22],
          data: [
            {
              coord: [pointerPos, 0],
              itemStyle: { color: item.color },
            },
          ],
          label: {
            show: true,
            position: 'top' as const,
            formatter: `${pointerPos} ${unit}`,
            color: '#404040',
            fontSize: 12,
            fontWeight: 'bold' as const,
          },
        }
      }

      return seriesItem
    })

    const options = {
      tooltip: {
        show: showTooltip,
        trigger: 'item' as const,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          const val = params.value ?? params.data?.coord?.[0] ?? 0
          return `${params.seriesName}: ${val} ${unit}`
        },
      },
      legend: {
        bottom: 0,
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 20,
        textStyle: {
          fontSize: 12,
          color: '#404040',
        },
        data: data.map((d) => d.name),
      },
      grid: {
        left: 10,
        right: 10,
        top: 30,
        bottom: hasScale ? 60 : 40,
        containLabel: hasScale,
      },
      xAxis: {
        type: 'value' as const,
        max: axisMax,
        show: hasScale,
        interval: scaleInterval,
        axisLine: {
          show: hasScale,
          lineStyle: { color: '#D1D5DB' },
        },
        axisTick: {
          show: hasScale,
          lineStyle: { color: '#D1D5DB' },
        },
        axisLabel: {
          show: hasScale,
          fontSize: 11,
          color: '#6B7280',
          formatter: (value: number) =>
            Number.isInteger(value) ? `${value}` : `${value.toFixed(1)}`,
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'category' as const,
        data: [''],
        show: false,
      },
      series,
    }

    chart.setOption(options)

    const resizeObserver = new ResizeObserver(() => chart.resize())
    if (chartRef.current) resizeObserver.observe(chartRef.current)

    return () => {
      resizeObserver?.disconnect()
      chart.dispose()
      instanceRef.current = undefined
    }
  }, [data, unit, scaleMax, scaleSteps])

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
}
