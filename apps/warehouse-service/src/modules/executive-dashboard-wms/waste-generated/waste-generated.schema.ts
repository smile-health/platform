import { z } from "zod"
import { IdSchema } from "@smile-health/lib/types/param.js"

export const WasteGeneratedQueryParamsSchema = z.object({
  unit: z.enum(["kg", "ton"]).optional().default("kg"),
  province_id: IdSchema.optional(),
  waste_group_id: z.coerce.number().int().positive().optional(),
  waste_type_id: z.coerce.number().int().positive().optional(),
  waste_characteristics_id: z.coerce.number().int().positive().optional(),
})

export type WasteGeneratedQueryParams = z.infer<
  typeof WasteGeneratedQueryParamsSchema
>

// Schema untuk health facilities
export const HealthFacilityItemSchema = z.object({
  key: z.string(),
  value: z.number(),
})

export type HealthFacilityItem = z.infer<typeof HealthFacilityItemSchema>

// Schema untuk dataset per provinsi di maps
export const MapDatasetItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  health_facilities: z.array(HealthFacilityItemSchema),
  infectious: z.number(),
  non_infectious: z.number(),
  toxic_waste: z.number(),
  inorganic: z.number(),
  organic: z.number(),
  total: z.number(),
})

export type MapDatasetItem = z.infer<typeof MapDatasetItemSchema>

// Schema untuk area di maps
export const MapAreaSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export type MapArea = z.infer<typeof MapAreaSchema>

// Schema untuk maps
export const MapsSchema = z.object({
  area: MapAreaSchema,
  dataset: z.array(MapDatasetItemSchema),
})

export type Maps = z.infer<typeof MapsSchema>

// Schema untuk total overview
export const TotalOverviewSchema = z.object({
  by_bag: z.object({
    value: z.number(),
    from_yesterday: z.number(),
  }),
  by_unit: z.object({
    value: z.number(),
    from_yesterday: z.number(),
  }),
})

export type TotalOverview = z.infer<typeof TotalOverviewSchema>

// Schema untuk overview
export const OverviewSchema = z.object({
  total: TotalOverviewSchema,
  infectious: z.number(),
  non_infectious: z.number(),
  toxic_waste: z.number(),
  inorganic: z.number(),
  organic: z.number(),
})

export type Overview = z.infer<typeof OverviewSchema>

// Schema untuk monthly comparison value
export const MonthlyComparisonValueSchema = z.object({
  infectious: z.number(),
  non_infectious: z.number(),
  toxic_waste: z.number(),
  inorganic: z.number(),
  organic: z.number(),
  total: z.number(),
})

export type MonthlyComparisonValue = z.infer<typeof MonthlyComparisonValueSchema>

// Schema untuk monthly comparison dataset item
export const MonthlyComparisonDatasetItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: MonthlyComparisonValueSchema,
})

export type MonthlyComparisonDatasetItem = z.infer<typeof MonthlyComparisonDatasetItemSchema>

// Schema untuk monthly comparison
export const MonthlyComparisonSchema = z.object({
  last_12_months: z.string(),
  dataset: z.array(MonthlyComparisonDatasetItemSchema),
})

export type MonthlyComparison = z.infer<typeof MonthlyComparisonSchema>

// Schema untuk ranking item (most_waste / lowest_waste)
export const RankingDatasetItemSchema = z.object({
  row: z.number(),
  id: z.string(),
  label: z.string(),
  value: z.number(),
})

export type RankingDatasetItem = z.infer<typeof RankingDatasetItemSchema>

// Schema untuk ranking section
export const RankingSectionSchema = z.object({
  last_month: z.string(),
  dataset: z.array(RankingDatasetItemSchema),
})

export type RankingSection = z.infer<typeof RankingSectionSchema>

// Main response schema
export const WasteGeneratedResponseSchema = z.object({
  last_updated: z.string(),
  data: z.object({
    maps: MapsSchema,
    overview: OverviewSchema,
    monthly_comparison: MonthlyComparisonSchema,
    most_waste: RankingSectionSchema,
    lowest_waste: RankingSectionSchema,
  }),
})

export type WasteGeneratedResponse = z.infer<typeof WasteGeneratedResponseSchema>

// DTO dari database untuk inventory data
export interface WasteInventoryDTO {
  day: string
  month: string
  hf_province_id: string | null
  hf_province_name: string | null
  hf_city_id: string | null
  hf_city_name: string | null
  total_hf_puskesmas: number
  total_hf_rumah_sakit: number
  total_bags: number
  total_weight: number
  clinical_infectious_weight_kg: number | null
  clinical_infectious_bag_count: number
  clinical_non_infectious_weight_kg: number | null
  clinical_non_infectious_bag_count: number
  domestic_anorganik_weight_kg: number | null
  domestic_anorganik_bag_count: number
  domestic_organik_weight_kg: number | null
  domestic_organik_bag_count: number
  hazard_toxic_weight_kg: number | null
  hazard_toxic_bag_count: number
}

// DTO untuk health facility counts
export interface HealthFacilityCountDTO {
  hf_province_name: string
  hf_city_name?: string | null
  total_puskesmas: number
  total_rumah_sakit: number
}

// DTO untuk yesterday comparison
export interface YesterdayComparisonDTO {
  waste_bag_count: number
  total_waste_weight: number | null
}

// DTO untuk monthly data
export interface MonthlyDataDTO {
  month_id: number
  month_label: string
  waste_type_name: string
  waste_bag_count: number
  total_waste_weight: number | null
}

// DTO untuk last available month
export interface LastAvailableMonthDTO {
  last_month: number
  last_month_label: string
}

// DTO untuk ranking data (most_waste / lowest_waste)
export interface RankingDataDTO {
  area_id: string
  area_name: string
  total_waste: number | null
}
