import { z } from "zod"
import { IdSchema } from "@smile/lib/types/param.js"

export const HealthFacilityQueryParamsSchema = z.object({
  year: z.coerce.number().int().optional(),
  province_id: IdSchema.optional(),
})

export type HealthFacilityQueryParams = z.infer<
  typeof HealthFacilityQueryParamsSchema
>

// Schema untuk region
export const RegionSchema = z.object({
  id: z.union([z.string(), z.number()]).nullable(),
  name: z.string().nullable(),
})

export type Region = z.infer<typeof RegionSchema>

// Schema untuk transporter
export const TransporterSchema = z.object({
  id: z.union([z.string(), z.number()]).nullable(),
  name: z.string().nullable(),
}).nullable()

export type Transporter = z.infer<typeof TransporterSchema>

// Schema untuk treatment
export const TreatmentSchema = z.object({
  id: z.union([z.string(), z.number()]).nullable(),
  name: z.string().nullable(),
}).nullable()

export type Treatment = z.infer<typeof TreatmentSchema>

// Schema untuk landfill
export const LandfillSchema = z.object({
  id: z.union([z.string(), z.number()]).nullable(),
  name: z.string().nullable(),
}).nullable()

export type Landfill = z.infer<typeof LandfillSchema>

// Schema untuk marker (health facility)
export const MarkerSchema = z.object({
  id: z.union([z.string(), z.number()]),
  is_health_center: z.boolean(),
  region: RegionSchema,
  transporter: TransporterSchema,
  treatment: TreatmentSchema,
  internal_processing_facilities: z.array(z.string()).optional(),
  landfill: LandfillSchema.optional(),
  name: z.string(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  total: z.object({
    waste: z.number(),
    bag: z.number(),
  }),
})

export type Marker = z.infer<typeof MarkerSchema>

// Schema untuk total waste dan bags
export const TotalSchema = z.object({
  waste: z.number(),
  bag: z.number(),
})

export type Total = z.infer<typeof TotalSchema>

// Schema untuk province dataset
export const ProvinceDatasetSchema = z.object({
  id: z.number(),
  name: z.string(),
  markers: z.array(MarkerSchema),
  total: TotalSchema.optional(),
})

export type ProvinceDataset = z.infer<typeof ProvinceDatasetSchema>

// Schema untuk area
export const AreaSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export type Area = z.infer<typeof AreaSchema>

// Schema untuk maps data
export const MapsDataSchema = z.object({
  area: AreaSchema,
  dataset: z.array(ProvinceDatasetSchema),
})

export type MapsData = z.infer<typeof MapsDataSchema>

// Schema untuk overview item
export const OverviewItemSchema = z.object({
  id: z.number(),
  label: z.string(),
  value: z.number(),
  total: z.number(),
})

export type OverviewItem = z.infer<typeof OverviewItemSchema>

// Schema untuk yearly comparison item
export const YearlyComparisonItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
})

export type YearlyComparisonItem = z.infer<typeof YearlyComparisonItemSchema>

// Schema untuk yearly comparison
export const YearlyComparisonSchema = z.object({
  last_5_years: z.string(),
  dataset: z.array(YearlyComparisonItemSchema),
})

export type YearlyComparison = z.infer<typeof YearlyComparisonSchema>

// Response schema
export const HealthFacilityResponseSchema = z.object({
  last_updated: z.string(),
  data: z.object({
    maps: MapsDataSchema,
    overview: z.array(OverviewItemSchema),
    yearly_comparison: YearlyComparisonSchema,
  }),
})

export type HealthFacilityResponse = z.infer<typeof HealthFacilityResponseSchema>

// DTO dari database ClickHouse
export interface HealthFacilityDTO {
  year: number
  hf_province_id: string | number
  hf_province_name: string
  hf_city_id: string | number
  hf_city_name: string
  hf_id: string | number
  hf_name: string
  hf_tag_id: string | number | null
  transporter_id: string | number | null
  transporter_name: string
  treatment_id: string | number | null
  treatment_name: string
  hf_latitude: number | null
  hf_longitude: number | null
  total_entities: number
  total_active_entities: number
  waste_bag_count: string | number
  total_waste_weight: number
  internal_processing_facilities_array: string[]
  landfill_id: string | number | null
  landfill_name: string | null
}

// DTO untuk overview statistics
export interface OverviewStatsDTO {
  total_provinces: number
  active_provinces: number
  total_cities: number
  active_cities: number
  total_health_facilities: number
  active_health_facilities: number
}

// DTO untuk yearly comparison
export interface YearlyComparisonDTO {
  year: number
  total_health_facilities: number
}
