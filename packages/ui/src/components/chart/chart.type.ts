// types.ts
import type {
  LineSeriesOption,
  MapSeriesOption,
  PieSeriesOption,
  ScatterSeriesOption,
} from 'echarts/charts'
import type {
  DatasetComponentOption,
  DataZoomComponentOption,
  GeoComponentOption,
  GridComponentOption,
  LegendComponentOption,
  MarkPointComponentOption,
  TitleComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
} from 'echarts/components'
import type { ComposeOption } from 'echarts/core'

import 'chart.js'

declare module 'chart.js' {
  interface CartesianScaleOptions {
    /**
     * Extra space before/after scale range
     * number (px) or string (percentage, ex: '10%')
     */
    grace?: number | string
  }
}

export type PieOptions = ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | PieSeriesOption
>

export type LineOptions = ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | GridComponentOption
  | DataZoomComponentOption
  | DatasetComponentOption
  | MarkPointComponentOption
  | LineSeriesOption
>

export type MapOptions = ComposeOption<
  | TooltipComponentOption
  | VisualMapComponentOption
  | GeoComponentOption
  | MapSeriesOption
>

export type MapScatterOptions = ComposeOption<
  | TooltipComponentOption
  | VisualMapComponentOption
  | GeoComponentOption
  | MapSeriesOption
  | ScatterSeriesOption
>

export type OverflowLabelType = 'ellipsis' | 'break' | 'combine'

export type MapName =
  | 'indonesia'
  | 'aceh'
  | 'bali'
  | 'bangka-belitung-island'
  | 'banten'
  | 'bengkulu'
  | 'central-java'
  | 'central-kalimantan'
  | 'central-papua'
  | 'central-sulawesi'
  | 'east-java'
  | 'east-kalimantan'
  | 'east-nusa-tenggara'
  | 'gorontalo'
  | 'highland-papua'
  | 'jakarta'
  | 'jambi'
  | 'lampung'
  | 'maluku'
  | 'north-kalimantan'
  | 'north-maluku'
  | 'north-sulawesi'
  | 'north-sumatera'
  | 'papua'
  | 'riau-island'
  | 'riau'
  | 'south-kalimantan'
  | 'south-papua'
  | 'south-sulawesi'
  | 'south-sumatera'
  | 'southeast-sulawesi'
  | 'southwest-papua'
  | 'west-java'
  | 'west-kalimantan'
  | 'west-nusa-tenggara'
  | 'west-papua'
  | 'west-sulawesi'
  | 'west-sumatera'
  | 'yogyakarta'
