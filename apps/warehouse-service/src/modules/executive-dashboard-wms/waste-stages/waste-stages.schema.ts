import { z } from "zod"

// DTOs from database
export interface WasteStagesDTO {
  day: string
  month: string
  hf_province_id: string
  hf_province_name: string
  hf_city_id: string
  hf_city_name: string
  total_hf_puskesmas: number
  total_hf_rumah_sakit: number
  waste_bag_count: number
  total_waste_weight: number
  temporary_stored_weight: number | null
  temporary_stored_bag_count: number
  cold_storage_weight: number | null
  cold_storage_bag_count: number
  pickup_weight: number | null
  pickup_bag_count: number
  process_weight: number | null
  process_bag_count: number
  recycle_weight: number | null
  recycle_bag_count: number
  landfilled_weight: number | null
  landfilled_bag_count: number
  last_updated: string
}

export interface ProvinceAggregateDTO {
  id: number
  name: string
  province_id?: number
  province_name?: string
  total_hospitals: number
  total_puskesmas: number
  temp_storage: number
  cold_storage: number
  pickup: number
  process: number
  landfill: number
  recycle: number
  total: number
}

export interface OverviewBagDTO {
  today_bag_count: number // Note: contains total from ALL data, not just today
  yesterday_bag_count: number
}

export interface OverviewKgDTO {
  today_kg: number // Note: contains total from ALL data, not just today
  yesterday_kg: number
}

// Response types
export interface HealthFacilityItem {
  key: string
  value: number
}

export interface ProvinceMapData {
  id: number
  name: string
  health_facilities: HealthFacilityItem[]
  temp_storage: number
  cold_storage: number
  pickup: number
  process: number
  landfill: number
  recycle: number
  total: number
}

export interface MapsResponse {
  area: {
    id: number
    name: string
  }
  dataset: ProvinceMapData[]
}

export interface OverviewResponse {
  total: {
    by_bag: {
      value: number
      from_yesterday: number
    }
    by_unit: {
      value: number
      from_yesterday: number
    }
  }
  temp_storage: number
  cold_storage: number
  pickup: number
  process: number
  landfill: number
  recycle: number
}

export interface WasteStagesResponse {
  last_updated: string
  data: {
    maps: MapsResponse
    overview: OverviewResponse
  }
}

// Query params schema
export const WasteStagesQueryParamsSchema = z.object({
  unit: z.enum(["kg", "ton"]).optional().default("kg"),
  province_id: z.string().optional(),
})

export type WasteStagesQueryParams = z.infer<typeof WasteStagesQueryParamsSchema>
