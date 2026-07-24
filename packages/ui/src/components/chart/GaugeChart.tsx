'use client'

import { useEffect, useRef } from 'react'
import { numberFormatter } from '#utils/formatter'
import { GaugeChart } from 'echarts/charts'
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useTranslation } from 'react-i18next'

echarts.use([
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
])

type GaugeChartProps = Readonly<{
  total: number
  max: number
  value: number
  label: string
  color?: Array<string>
  threshold?: number
  maxPosition?: Array<string | number>
  thresholdValue?: number
  percentage?: number
}>

export default function GaugeChartComponent({
  total,
  max,
  value,
  label,
  color,
  threshold = 0.85,
  maxPosition = ['0%', '-95%'],
  thresholdValue,
  percentage,
}: GaugeChartProps) {
  const {
    i18n: { language },
  } = useTranslation()
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.EChartsType | null>(null)
  const percent =
    percentage != null
      ? percentage.toFixed(0)
      : total > 0
        ? ((value / total) * 100).toFixed(0)
        : '0'
  const percentMax = (threshold * 100).toFixed(0)

  const isEmpty = total === 0
  const defaultThresholdValue = thresholdValue ?? threshold * max

  const formatNumber = (value: number) => {
    return numberFormatter(value, language)
  }

  const getThresholdSplitNumber = (t: number): number => {
    for (let n = 1; n <= 100; n++) {
      if (Math.abs(t * n - Math.round(t * n)) < 0.001) return n
    }
    return 20
  }

  const legendItems = color?.map((c, i) => ({
    background: c,
    text: i === 0 ? `0% - ${percentMax}%` : `>${percentMax}% - 100%`,
  }))

  useEffect(() => {
    if (!chartRef.current) return

    // Init
    const chart = echarts.init(chartRef.current)
    chartInstance.current = chart

    // SetOption
    chart.setOption({
      tooltip: {
        show: true,
      },
      grid: {
        top: 0,
        bottom: 0,
      },
      series: [
        {
          name: 'gauge0',
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: total,
          splitNumber: getThresholdSplitNumber(threshold),
          radius: '125%',
          center: ['50%', '63%'],
          axisLine: {
            lineStyle: {
              width: 45,
              color: [
                [threshold, color?.[0]],
                [1, color?.[1]],
              ],
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: !isEmpty,
            distance: -65,
            fontSize: 12,
            color: '#404040',
            formatter: (value: number) => {
              if (value === 0) return '0.00 L'
              return ''
            },
          },
          pointer: {
            length: '90%',
            width: 5,
            itemStyle: {
              color: '#fff',
              borderWidth: 1,
              borderColor: '#000',
            },
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 20,
            itemStyle: {
              color: '#000',
            },
          },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '30%'],
            formatter: (value: number) => {
              const pct =
                percentage != null
                  ? percentage
                  : total > 0
                    ? (value / total) * 100
                    : 0
              return `{value|${formatNumber(value)} L}\n{percent|${pct.toFixed(2)}%}`
            },
            rich: {
              value: {
                fontSize: 18,
                fontWeight: 'bold',
                color: '#404040',
                lineHeight: 8,
              },
              percent: {
                fontSize: 12,
                fontWeight: 'normal',
                color: '#6B7280',
              },
            },
          },
          data: [
            {
              value,
              tooltip: {
                formatter: (params: any) => {
                  return `${formatNumber(params?.value)} L (${percent}%)`
                },
              },
            },
          ],
        },
        {
          name: 'gaugeLabels',
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: total,
          splitNumber: getThresholdSplitNumber(threshold),
          radius: '125%',
          center: ['68%', '63%'],
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          pointer: { show: false },
          anchor: { show: false },
          detail: { show: false },
          data: [{ value: 0 }],
          axisLabel: {
            show: !isEmpty,
            distance: 15,
            fontSize: 12,
            color: '#404040',
            formatter: (value: number) => {
              if (value === total) return `${formatNumber(value)} L`
              return ''
            },
          },
        },
        {
          name: 'gauge1',
          type: 'gauge',
          startAngle: 27,
          endAngle: 0,
          min: max,
          max: total,
          splitNumber: 3,
          radius: '125%',
          center: ['50%', '63%'],
          axisLine: {
            lineStyle: {
              width: 45,
              color: [[1, 'transparent']],
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          pointer: {
            show: !isEmpty,
            icon: 'path://M12.8,40.8l12,-40.1H0.7L12.8,40.8z',
            length: '9%',
            width: 18,
            offsetCenter: maxPosition,
            itemStyle: {
              color: '#fff',
              borderWidth: 1,
              borderColor: '#000',
            },
          },
          anchor: { show: false },
          detail: {
            show: !isEmpty,
            offsetCenter: ['135%', '-45%'],
            fontSize: 12,
            color: '#404040',
            formatter: () =>
              `${formatNumber(defaultThresholdValue)} L (${percentMax}%)`,
          },
          data: [
            {
              value: max,
              tooltip: {
                formatter: (params: any) => {
                  return `<b>${label}</b><br/>0 L - ${formatNumber(params?.value)} L`
                },
              },
            },
          ],
        },
      ],
    })

    const observer = new ResizeObserver(() => {
      chart.resize()
    })
    observer.observe(chartRef.current)

    return () => {
      observer.disconnect()
      chart.dispose()
    }
  }, [value])

  return (
    <div className="ui-relative ui-w-full ui-h-full">
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
      <div className="ui-absolute ui-bottom-0 ui-w-full ui-flex ui-items-center ui-justify-center ui-gap-4">
        {legendItems?.map(({ background, text }, i) => (
          <div key={i} className="ui-flex ui-items-center ui-gap-1">
            <div
              className="ui-size-3.5 ui-rounded-full"
              style={{ background: background }}
            />
            <span className="ui-text-sm ui-font-sans">
              {label} {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
