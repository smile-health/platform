/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useMemo, useRef } from 'react'
import { TreemapChart as EChartsTreemap } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import type { EChartsType } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

import { isColorDark } from './chart.helper'

echarts.use([EChartsTreemap, TooltipComponent, CanvasRenderer])

export type TreeMapDataItem = {
  name: string
  value: number
  labelText?: string
  itemStyle?: {
    color?: string
    borderColor?: string
    borderWidth?: number
  }
}

type Props = {
  data: TreeMapDataItem[]
  className?: string
  tooltipFormatter?: (params: any) => string
}

export default function TreeMapChart({
  data,
  className,
  tooltipFormatter,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<EChartsType | null>(null)

  const options = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: tooltipFormatter,
      },
      series: [
        {
          type: 'treemap',
          data,
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          label: {
            show: true,
            formatter: (params: any) => {
              const item = params.data
              const bg = item.itemStyle?.color
              const style = bg && !isColorDark(bg) ? 'dark' : 'light'
              const text =
                item.labelText ?? `${item.name}\n${params.value}`
              return text
                .split('\n')
                .map((line: string) => `{${style}|${line}}`)
                .join('\n')
            },
            rich: {
              light: { color: '#fff', fontSize: 12, lineHeight: 18 },
              dark: { color: '#404040', fontSize: 12, lineHeight: 18 },
            },
          },
          emphasis: {
            label: {
              show: true,
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 3,
            },
          },
          upperLabel: { show: false },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            gapWidth: 2,
          },
          levels: [
            {
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 2,
                gapWidth: 2,
              },
            },
          ],
        },
      ],
    }
  }, [data, tooltipFormatter])

  useEffect(() => {
    if (!containerRef.current) return
    if (!chartRef.current) {
      chartRef.current = echarts.init(containerRef.current, undefined, {
        renderer: 'canvas',
      })
    }
    if (data.length) {
      chartRef.current.setOption(options, { notMerge: true, lazyUpdate: true })
    }

    const handleWinResize = () => chartRef.current?.resize()
    window.addEventListener('resize', handleWinResize)

    const ro = new ResizeObserver(() => chartRef.current?.resize())
    ro.observe(containerRef.current)

    return () => {
      window.removeEventListener('resize', handleWinResize)
      ro.disconnect()
      chartRef.current?.dispose()
      chartRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!chartRef.current || !data.length) return
    chartRef.current.setOption(options, { notMerge: true, lazyUpdate: true })
  }, [options, data.length])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
      aria-label="Tree map chart"
      role="img"
    />
  )
}
