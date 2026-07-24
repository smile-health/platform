import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import FullScreen from '#components/icons/FullScreen'
import Minus from '#components/icons/Minus'
import Plus from '#components/icons/Plus'
import { Spinner } from '#components/spinner'
import { MapChart as EMapChart } from 'echarts/charts'
import {
  GeoComponent,
  GeoComponentOption,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useTranslation } from 'react-i18next'

import { MapName, MapOptions } from './chart.type'

echarts.use([
  EMapChart,
  TooltipComponent,
  VisualMapComponent,
  GeoComponent,
  CanvasRenderer,
])

type Datum<T> = T & { value: number; name: string }

type Props<T> = Readonly<{
  data?: Datum<T>[]
  location?: MapName
  onClick?: (item: Datum<T>) => void
  color?: string[]
  showToolbox?: boolean
  geomapsUrl?: string
  edge?: number | string
  center?: string[] | number[]
  emptyColor?: string
  emptyMessage?: string
  options?: MapOptions
}>

async function getGeoMaps(map: string, geomapsUrl: string) {
  const res = await fetch(`${geomapsUrl}/${map}`)
  return await res.json()
}

export default function MapChart<T>({
  data,
  location = 'indonesia',
  onClick,
  color,
  showToolbox,
  geomapsUrl = '/api/geomaps',
  edge,
  center,
  emptyColor,
  emptyMessage: emptyMessageProps,
  options: optionsProps,
}: Props<T>) {
  const { t } = useTranslation()
  const chartRef = useRef<HTMLDivElement | null>(null)
  const chartInstance = useRef<echarts.EChartsType | null>(null)
  const resizeObserver = useRef<ResizeObserver | null>(null)

  const { data: geoData, isPending } = useQuery({
    queryKey: ['geomaps', location],
    queryFn: () => getGeoMaps(location, geomapsUrl),
    enabled: !!location,
  })

  const emptyMessage = t('message.empty.title')
  const emptyAreaColor = emptyColor ?? 'transparent'

  // 🔧 Chart option generator
  const getChartOption = (geoName: string): MapOptions => ({
    tooltip: {
      trigger: 'item',
      textStyle: {
        color: '#0C3045',
      },
      formatter: (params: any) => {
        const name = params.name ?? ''
        const value = params.value

        // kalau value null / undefined / NaN
        if (value == null || Number.isNaN(value)) {
          return `<strong>${name}</strong> <p>${emptyMessageProps ?? emptyMessage}</p>`
        }

        return `${name}: ${value}`
      },
      ...optionsProps?.tooltip,
    },
    geo: {
      map: geoName,
      roam: 'pan',
      aspectScale: Math.cos(0),
      ...(edge && {
        left: edge,
        right: edge,
      }),
      ...(center && {
        center: center,
      }),
      itemStyle: {
        areaColor: emptyAreaColor,
        borderColor: emptyAreaColor === 'transparent' ? '#94a3b8' : '#F8FAFC',
      },
      regions: data?.map((item) => ({
        name: item?.name,
        label: {
          show: false,
        },
        ...(item?.value >= 0 && {
          itemStyle: {
            borderColor: '#F8FAFC',
          },
        }),
      })),
    },
    visualMap: {
      type: 'piecewise',
      splitNumber: 5,
      pieces: [
        { min: 90, label: '90-100%' },
        { min: 50, max: 89.99, label: '50-90%' },
        { min: 25, max: 49.99, label: '25-50%' },
        { min: 10, max: 24.99, label: '10-25%' },
        { min: 0.01, max: 9.99, label: '0-10%' },
      ],
      orient: 'horizontal',
      left: 'center',
      itemSymbol: 'circle',
      top: 0,
      itemWidth: 20,
      itemHeight: 14,
      itemGap: 16,
      textGap: 2,
      inRange: { color },
      outOfRange: { color: '#F3F4F6' },
      textStyle: {
        fontSize: 12,
      },
      ...optionsProps?.visualMap,
    } as any,
    series: [
      {
        name: 'Location',
        type: 'map',
        map: '',
        geoIndex: 0,
        selectedMode: false,
        label: {
          fontSize: 10,
          color: '#404040',
        },
        emphasis: {
          label: { show: false },
        },
        data,
      },
    ],
    ...optionsProps,
  })

  // 🔁 Init chart once
  useEffect(() => {
    if (!chartRef.current || chartInstance.current) return

    const chart = echarts.init(chartRef.current)
    chartInstance.current = chart

    // Auto resize
    resizeObserver.current = new ResizeObserver(() => chart.resize())
    resizeObserver.current.observe(chartRef.current)

    return () => {
      chart.dispose()
      chartInstance.current = null
      resizeObserver.current?.disconnect()
    }
  }, [])

  const options = getChartOption(location)

  // 🧠 Rebind onClick listener when it changes
  useEffect(() => {
    const chart = chartInstance.current
    if (!chart || !onClick) return

    const handler = (params: any) => {
      const item = params?.data
      if (item?.id) onClick(item)
    }

    chart.on('click', handler)
    return () => {
      chart.off('click', handler)
    }
  }, [onClick])

  // ⚙️ Apply geo map and option when data changes

  useEffect(() => {
    if (!geoData || !chartInstance.current) return
    echarts.registerMap(location, geoData)
    chartInstance.current.setOption(options, true)
    chartInstance.current.resize()
  }, [geoData, location, data, color, options])

  const zoomMap = (direction: 'in' | 'out') => {
    const chart = chartInstance.current
    if (!chart) return

    const option = chart.getOption()
    const geo = (option?.geo as GeoComponentOption[])?.[0]
    if (!geo) return

    const currentZoom = geo.zoom ?? 1
    const zoomFactor = 1.5

    const newZoom =
      direction === 'in' ? currentZoom * zoomFactor : currentZoom / zoomFactor

    chart.setOption({
      geo: {
        zoom: Math.max(0.5, Math.min(newZoom, 20)), // kasih batas biar aman
      },
    })
  }

  const resetMap = () => {
    chartInstance.current?.setOption({
      geo: {
        zoom: 1,
        center: center ?? undefined,
      },
    })
  }

  return (
    <div className="ui-relative ui-size-full">
      {isPending && (
        <div className="ui-size-full ui-grid ui-place-items-center">
          <Spinner className="size-10" />
        </div>
      )}
      <div
        ref={chartRef}
        style={{ width: '100%', height: isPending ? '0%' : '100%' }}
      />

      {showToolbox && (
        <div
          className="ui-absolute ui-right-0 ui-bottom-10 ui-flex ui-flex-col ui-rounded-md ui-bg-white ui-divide-y ui-divide-[#EAEAEA] ui-shadow-sm ui-border ui-border-[#EAEAEA]/80
  "
        >
          <button
            onClick={() => zoomMap('in')}
            className="ui-p-[5px] focus:ui-outline-none"
          >
            <Plus className="ui-size-3.5" />
          </button>
          <button
            onClick={resetMap}
            className="ui-p-[5px] focus:ui-outline-none"
          >
            <FullScreen className="ui-size-3.5" />
          </button>
          <button
            onClick={() => zoomMap('out')}
            className="ui-p-[5px] focus:ui-outline-none"
          >
            <Minus className="ui-size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
