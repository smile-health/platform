import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import FullScreen from '#components/icons/FullScreen'
import Minus from '#components/icons/Minus'
import Plus from '#components/icons/Plus'
import {
  MapChart as EMapChart,
  MapSeriesOption,
  ScatterChart,
} from 'echarts/charts'
import {
  GeoComponent,
  GeoComponentOption,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

import { isColorDark } from './chart.helper'
import { MapName, MapScatterOptions } from './chart.type'

echarts.use([
  EMapChart,
  TooltipComponent,
  VisualMapComponent,
  GeoComponent,
  ScatterChart,
  CanvasRenderer,
])

type Datum<T> = T & { value: number; name: string }

type Props<T> = Readonly<{
  data?: MapSeriesOption['data']
  markers: MapSeriesOption['data']
  location?: MapName
  onClick?: (item: Datum<T>) => void
  color?: string
  showToolbox?: boolean
  tooltipMarkers: ((name: string, item: T) => string) | string
}>

async function getGeoMaps(map: string) {
  const res = await fetch(`/api/geomaps/${map}`)
  return await res.json()
}

export default function MapScatterChart<T>({
  data,
  markers,
  location = 'indonesia',
  onClick,
  color,
  showToolbox,
  tooltipMarkers,
}: Props<T>) {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const chartInstance = useRef<echarts.EChartsType | null>(null)
  const resizeObserver = useRef<ResizeObserver | null>(null)

  const { data: geoData } = useQuery({
    queryKey: ['geomaps', location],
    queryFn: () => getGeoMaps(location),
    enabled: !!location,
  })

  // 🔧 Chart option generator
  const getChartOption = (geoName: string): MapScatterOptions => ({
    tooltip: {
      trigger: 'item',
      textStyle: {
        color: '#0C3045',
      },
    },
    geo: {
      map: geoName,
      aspectScale: Math.cos(0),
      roam: 'pan',
      left: 0,
      right: 0,
      center: ['50%', '35%'],
      label: {
        show: false,
      },
      emphasis: {
        disabled: true,
      },
      itemStyle: {
        areaColor: '#0D85BC',
        borderColor: color && isColorDark(color) ? '#f8fafc' : '#EFEFEF',
      },
    },
    series: [
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        geoIndex: 0,
        large: true,
        progressive: 500,
        progressiveThreshold: 3000,
        largeThreshold: 2000,
        encode: {
          tooltip: 2,
          label: 2,
        },
        symbol: 'image:///images/ic-map-pin-red',
        symbolSize: 20,
        data: markers,
        itemStyle: {
          color: '#DC2626',
        },
        tooltip: {
          formatter:
            typeof tooltipMarkers === 'function'
              ? (params: any) => tooltipMarkers(params?.name, params?.data)
              : tooltipMarkers,
        },
      },
      {
        type: 'map',
        geoIndex: 0,
        map: '',
        data,
        tooltip: {
          show: false,
        },
        silent: true,
      },
    ],
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
    chartInstance.current.setOption(getChartOption(location), true)
    chartInstance.current.resize()
  }, [geoData, location, data, color])

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
        center: ['50%', '35%'],
      },
    })
  }

  return (
    <div className="ui-relative ui-size-full">
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
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
