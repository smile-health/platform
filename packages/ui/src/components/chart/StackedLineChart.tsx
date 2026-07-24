/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useMemo, useRef } from 'react'
import { numberFormatter } from '#utils/formatter'
import { LineChart, LineSeriesOption } from 'echarts/charts'
import {
  DatasetComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import type { EChartsType } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useTranslation } from 'react-i18next'

import { LineOptions } from './chart.type'

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  DatasetComponent,
  TitleComponent,
  MarkPointComponent,
  LegendComponent,
  CanvasRenderer,
])

const MAX_VISIBLE = 12

type Props = {
  labels: string[]
  series: LineSeriesOption[]
  /** className opsional untuk styling */
  className?: string
  options?: LineOptions
  maxVisible?: number
  isLabelRotated?: boolean
}

export default function StackedLineChart({
  labels,
  series,
  className,
  maxVisible = MAX_VISIBLE,
  options: optionsProps = {},
  isLabelRotated = false,
}: Props) {
  const {
    i18n: { language },
  } = useTranslation()

  const totalData = labels?.length
  const isUseSlider = totalData > maxVisible
  const end = isUseSlider ? (maxVisible / totalData) * 100 : 100

  const options = useMemo(() => {
    const { legend, tooltip, grid, xAxis, yAxis, ...restOptions } = optionsProps

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const list = Array.isArray(params) ? params : [params]
          return list
            .map(
              (item: any) =>
                `${item.marker} ${item.seriesName}: ${numberFormatter(
                  Number(item.value),
                  language
                )}`
            )
            .join('<br/>')
        },
        ...(tooltip ?? {}),
      },
      legend: {
        data: series.map((s) => s.name),
        bottom: isUseSlider ? 15 : 0,
        ...(legend ?? {}),
      },
      grid: {
        left: 0,
        right: 0,
        top: '10%',
        bottom: isUseSlider ? 60 : 30,
        containLabel: true,
        ...(grid ?? {}),
      },
      xAxis: {
        type: 'category',
        data: labels,
        ...(isLabelRotated
          ? {
              axisLabel: {
                rotate: 90,
              },
            }
          : {}),
        ...(xAxis ?? {}),
      },
      yAxis: {
        type: 'value',
        ...(yAxis ?? {}),
      },
      dataZoom: isUseSlider
        ? [
            {
              type: 'slider',
              start: 0,
              end,
              bottom: 0,
              height: 15,
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
      series: series.map((serie) => ({
        type: 'line',
        ...serie,
      })),
      ...restOptions,
    }
  }, [labels, series, optionsProps, isUseSlider, end, language])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<EChartsType | null>(null)

  // Init & dispose
  useEffect(() => {
    if (!containerRef.current) return
    if (!chartRef.current) {
      chartRef.current = echarts.init(containerRef.current, undefined, {
        renderer: 'canvas',
      })
    }
    // Set initial option
    chartRef.current.setOption(options, { notMerge: true, lazyUpdate: true })

    // Resize handlers
    const handleWinResize = () => chartRef.current?.resize()
    window.addEventListener('resize', handleWinResize)

    // ResizeObserver untuk container
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

  // Update option ketika props berubah (tanpa re-init)
  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.setOption(options, { notMerge: true, lazyUpdate: true })
  }, [options])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
      aria-label="Line chart"
      role="img"
    />
  )
}
