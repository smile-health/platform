import { z } from "zod"
import { IdSchema } from "@smile/lib/types/param.js"

export const ActiveRateQueryParamsSchema = z.object({
  province_id: IdSchema.optional(),
  period: z.string().optional(),
  entity_tag_id: IdSchema.optional(),
})

export type ActiveRateQueryParams = z.infer<typeof ActiveRateQueryParamsSchema>

// DTO raw dari ClickHouse
export type ActiveRateRawDTO = {
  hf_province_id: string | null
  hf_province_name: string | null
  hf_city_id: string | null
  hf_city_name: string | null
  total_active: number
  total_registered: number
  last_updated: string
}

export type ActiveRateMonthlyDTO = {
  period: string
  total_active: number
  total_registered: number
}

export type ActiveRateRankingDTO = {
  hf_province_id: string
  hf_province_name: string
  area_id: string
  area_name: string
  total_active: number
  total_registered: number
}

export type ActiveRateAvgDTO = {
  total_active: number
  total_registered: number
}

export type ActiveRateLastUpdatedDTO = {
  last_updated: string
}

// Response types
export type MapDatasetItem = {
  id: number
  name: string
  value: number
  total: number
  percent: number
  tooltip: string
}

export type MonthlyDatasetItem = {
  id: string
  label: string
  value: number | null
}

export type RankingDatasetItem = {
  row: number
  label: string
  value: number
}

export type ActiveRateResponse = {
  last_updated: string
  data: {
    maps: {
      area: {
        id: number
        name: string
      }
      dataset: MapDatasetItem[]
    }
    avg: number
    monthly_comparison: {
      last_12_months: string
      dataset: MonthlyDatasetItem[]
    }
    highest: {
      last_month: string
      dataset: RankingDatasetItem[]
    }
    lowest: {
      last_month: string
      dataset: RankingDatasetItem[]
    }
  }
}
