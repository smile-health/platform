import { z } from "zod"
import { IdSchema } from "@smile-health/lib/types/param.js"

export const LeadTimeStageSchema = z.enum([
  "avg_pickup",
  "avg_process",
  "avg_landfill",
  "avg_recycle",
])

export type LeadTimeStage = z.infer<typeof LeadTimeStageSchema>

export const LeadTimeQueryParamsSchema = z.object({
  province_id: IdSchema.optional(),
  stages: LeadTimeStageSchema.optional(),
  entity_tag_id: IdSchema.optional(),
})

export type LeadTimeQueryParams = z.infer<typeof LeadTimeQueryParamsSchema>

export const MapAreaSchema = z.object({
  id: z.number(),
  name: z.string(),
})
export type MapArea = z.infer<typeof MapAreaSchema>

export const MapDatasetItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number(),
  tooltip: z.string(),
})
export type MapDatasetItem = z.infer<typeof MapDatasetItemSchema>

export const MapsSchema = z.object({
  area: MapAreaSchema,
  dataset: z.array(MapDatasetItemSchema),
})
export type Maps = z.infer<typeof MapsSchema>

export const MonthlyDatasetItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
})
export type MonthlyDatasetItem = z.infer<typeof MonthlyDatasetItemSchema>

export const MonthlyComparisonSchema = z.object({
  last_12_months: z.string(),
  dataset: z.array(MonthlyDatasetItemSchema),
})
export type MonthlyComparison = z.infer<typeof MonthlyComparisonSchema>

export const Most10DeliveryDatasetItemSchema = z.object({
  id: z.number(),
  label: z.string(),
  value: z.number(),
})
export type Most10DeliveryDatasetItem = z.infer<typeof Most10DeliveryDatasetItemSchema>

export const Most10DeliverySchema = z.object({
  last_month: z.string(),
  dataset: z.array(Most10DeliveryDatasetItemSchema),
})
export type Most10Delivery = z.infer<typeof Most10DeliverySchema>

export const LeadTimeResponseSchema = z.object({
  last_updated: z.string(),
  data: z.object({
    maps: MapsSchema,
    avg: z.number(),
    monthly_comparison: MonthlyComparisonSchema,
    most_10_delivery: Most10DeliverySchema,
  }),
})
export type LeadTimeResponse = z.infer<typeof LeadTimeResponseSchema>

// DTOs
export const LeadTimeMapDTOSchema = z.object({
  province_id: z.string().nullable(),
  province_name: z.string().nullable(),
  area_name: z.string().nullable().optional(),
  avg_lead_time_days: z.number(),
})
export type LeadTimeMapDTO = z.infer<typeof LeadTimeMapDTOSchema>

export const LeadTimeAvgDTOSchema = z.object({
  avg_lead_time_days: z.number(),
})
export type LeadTimeAvgDTO = z.infer<typeof LeadTimeAvgDTOSchema>

export const LeadTimeMonthlyDTOSchema = z.object({
  month_key: z.string(),
  avg_lead_time_days: z.number(),
})
export type LeadTimeMonthlyDTO = z.infer<typeof LeadTimeMonthlyDTOSchema>

export const LeadTimeTop10DTOSchema = z.object({
  location_name: z.string().nullable(),
  avg_lead_time_days: z.number(),
})
export type LeadTimeTop10DTO = z.infer<typeof LeadTimeTop10DTOSchema>

export const LastUpdatedDTOSchema = z.object({
  last_updated: z.string(),
})
export type LastUpdatedDTO = z.infer<typeof LastUpdatedDTOSchema>
