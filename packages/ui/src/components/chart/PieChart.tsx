import { useEffect, useRef } from 'react'
import { PieChart as PieChartComponent } from 'echarts/charts'
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

import type { PieOptions } from './chart.type'

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChartComponent,
  CanvasRenderer,
])

type Datum<T> = T & { value: number; name: string }

type Props<T> = {
  title?: string
  data: Datum<T>[]
  color?: string[]
  tooltipFormatter?: string
  labelFormatter?: string
  onClick?: (item: Datum<T>) => void
  startAngle?: number
  radius?: string
  center?: Array<string | number>
  legendOptions?: PieOptions['legend']
}

export default function PurePieChart<T>({
  title,
  data,
  color,
  onClick,
  startAngle = 90,
  tooltipFormatter,
  labelFormatter,
  radius = '50%',
  center,
  legendOptions,
}: Readonly<Props<T>>) {
  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<echarts.ECharts>()

  useEffect(() => {
    if (chartRef.current && !instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current)
    }

    const chart = instanceRef.current
    if (!chart) return

    const defaultCenter = title ? ['50%', '50%'] : ['50%', '30%']

    const options: PieOptions = {
      ...(color && { color }),
      title: {
        text: title,
        textStyle: {
          color: '#6b7280',
          fontWeight: 500,
        },
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        ...(tooltipFormatter && { formatter: tooltipFormatter }),
      },
      legend: {
        orient: 'horizontal',
        bottom: 'bottom',
        icon: 'circle',
        itemGap: 10,
        itemWidth: 15,
        itemHeight: 15,
        ...legendOptions,
      },
      series: [
        {
          type: 'pie',
          radius,
          selectedMode: onClick ? 'single' : false,
          showEmptyCircle: false,
          center: center ?? defaultCenter,
          startAngle,
          data,
          label: {
            color: 'inherit',
            formatter: labelFormatter ?? '{b}, {d}%',
            fontSize: 15,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 3,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    }

    chart.setOption(options)

    // only bind once
    const handleClick = (params: any) => {
      const item = params?.data
      if (onClick && item) onClick(item)
    }

    chart.off('click') // ensure no duplicate
    chart.on('click', handleClick)

    const resizeObserver = new ResizeObserver(() => chart.resize())
    if (chartRef.current) resizeObserver.observe(chartRef.current)

    return () => {
      chart.off('click', handleClick)
      resizeObserver?.disconnect()
      chart.dispose()
      instanceRef.current = undefined
    }
  }, [
    data,
    title,
    color,
    legendOptions,
    tooltipFormatter,
    labelFormatter,
    onClick,
    center,
    radius,
    startAngle,
  ])

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
}
