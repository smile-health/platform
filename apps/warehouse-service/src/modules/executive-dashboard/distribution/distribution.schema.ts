import {
  QueryParamsSchema,
  stringDate,
} from "@/common/schemas/query-param.schema.js"
import { z } from "zod"

export const HealthFacilityImplementorQueryParamsSchema = QueryParamsSchema.and(
  z.object({
    year: z.coerce.number().int(),
  })
)

export type HealthFacilityImplementorQueryParams = z.infer<
  typeof HealthFacilityImplementorQueryParamsSchema
>

export const MapItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number().optional(),
  total: z.number().optional(),
  percent: z.number().optional(),
  tooltip: z.string().optional(),
  distribution: z.number().optional(),
  receive: z.number().optional(),
})

export type MapItemDTO = z.infer<typeof MapItemSchema>

export const OverviewItemSchema = z.object({
  id: z.number(),
  label: z.string(),
  value: z.number(),
  total: z.number(),
})

export type OverviewItemDTO = z.infer<typeof OverviewItemSchema>

export const AreaSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export type AreaDTO = z.infer<typeof AreaSchema>

export const MapsDataSchema = z.object({
  area: AreaSchema,
  dataset: z.array(MapItemSchema),
})

export type MapsDataDTO = z.infer<typeof MapsDataSchema>

export const YearlyComparisonItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
})

export type YearlyComparisonItemDTO = z.infer<typeof YearlyComparisonItemSchema>

export const YearlyComparisonSchema = z.object({
  last_5_years: z.string(),
  dataset: z.array(YearlyComparisonItemSchema),
})

export type YearlyComparisonDTO = z.infer<typeof YearlyComparisonSchema>

export const HealthFacilityImplementorResponseSchema = z.object({
  last_updated: z.string(),
  data: z.object({
    maps: MapsDataSchema,
    overview: z.array(OverviewItemSchema),
    yearly_comparison: YearlyComparisonSchema,
  }),
})

export type HealthFacilityImplementorResponse = z.infer<
  typeof HealthFacilityImplementorResponseSchema
>

export const FacilityDistributionDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
  total: z.number(),
})

export type FacilityDistributionDataDTO = z.infer<
  typeof FacilityDistributionDataSchema
>

export const FacilityOverviewDataSchema = z.object({
  total_province_implementor: z.number(),
  total_province: z.number(),
  total_regency_implementor: z.number(),
  total_regency: z.number(),
  total_facility_implementor: z.number(),
  total_facility: z.number(),
})

export type FacilityOverviewDataDTO = z.infer<typeof FacilityOverviewDataSchema>

// Active Rate Schemas
export const ActiveRateQueryParamsSchema = QueryParamsSchema.and(
  z.object({
    period: stringDate("YYYY-MM").optional(),
    start_period: stringDate("YYYY-MM").optional(),
    end_period: stringDate("YYYY-MM").optional(),
  })
)

export type ActiveRateQueryParams = z.infer<typeof ActiveRateQueryParamsSchema>

export const MonthlyComparisonItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
})

export type MonthlyComparisonItemDTO = z.infer<
  typeof MonthlyComparisonItemSchema
>

export const MonthlyComparisonSchema = z.object({
  last_12_months: z.string(),
  dataset: z.array(MonthlyComparisonItemSchema),
})

export type MonthlyComparisonDTO = z.infer<typeof MonthlyComparisonSchema>

export const RankingItemSchema = z.object({
  row: z.number(),
  label: z.string(),
  value: z.number(),
})

export type RankingItemDTO = z.infer<typeof RankingItemSchema>

export const RankingSchema = z.object({
  last_month: z.string(),
  dataset: z.array(RankingItemSchema),
})

export type RankingDTO = z.infer<typeof RankingSchema>

export const ActiveRateResponseSchema = z.object({
  last_updated: z.string(),
  data: z.object({
    maps: MapsDataSchema,
    avg: z.number(),
    monthly_comparison: MonthlyComparisonSchema,
    highest: RankingSchema,
    lowest: RankingSchema,
  }),
})

export type ActiveRateResponse = z.infer<typeof ActiveRateResponseSchema>

export const ActiveRateDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
  total: z.number(),
  percent: z.number(),
})

export type ActiveRateDataDTO = z.infer<typeof ActiveRateDataSchema>

export const ActiveRateMonthlyDataSchema = z.object({
  period: z.string(),
  active_rate: z.number(),
})

export type ActiveRateMonthlyDataDTO = z.infer<
  typeof ActiveRateMonthlyDataSchema
>

export const ActiveRateRankingDataSchema = z.object({
  name: z.string(),
  active_rate: z.number(),
})

export type ActiveRateRankingDataDTO = z.infer<
  typeof ActiveRateRankingDataSchema
>

// Lead Time Schemas
export const LeadTimeQueryParamsSchema = QueryParamsSchema.and(
  z.object({
    period: z.string().optional(),
    start_period: z.string().optional(),
    end_period: z.string().optional(),
  })
)

export type LeadTimeQueryParams = z.infer<typeof LeadTimeQueryParamsSchema>

export const LeadTimeMapItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number(),
  tooltip: z.string(),
})

export type LeadTimeMapItemDTO = z.infer<typeof LeadTimeMapItemSchema>

export const LeadTimeMonthlyComparisonItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
})

export type LeadTimeMonthlyComparisonItemDTO = z.infer<
  typeof LeadTimeMonthlyComparisonItemSchema
>

export const LeadTimeMonthlyComparisonSchema = z.object({
  last_12_months: z.string(),
  dataset: z.array(LeadTimeMonthlyComparisonItemSchema),
})

export type LeadTimeMonthlyComparisonDTO = z.infer<
  typeof LeadTimeMonthlyComparisonSchema
>

export const LeadTimeMostDeliveryItemSchema = z.object({
  id: z.number(),
  label: z.string(),
  value: z.number(),
})

export type LeadTimeMostDeliveryItemDTO = z.infer<
  typeof LeadTimeMostDeliveryItemSchema
>

export const LeadTimeMostDeliverySchema = z.object({
  last_month: z.string(),
  dataset: z.array(LeadTimeMostDeliveryItemSchema),
})

export type LeadTimeMostDeliveryDTO = z.infer<typeof LeadTimeMostDeliverySchema>

export const LeadTimeResponseSchema = z.object({
  last_updated: z.string(),
  data: z.object({
    maps: MapsDataSchema,
    avg: z.number(),
    monthly_comparison: LeadTimeMonthlyComparisonSchema,
    most_10_delivery: LeadTimeMostDeliverySchema,
  }),
})

export type LeadTimeResponse = z.infer<typeof LeadTimeResponseSchema>

export const LeadTimeMapsDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  avg_duration: z.number(),
})

export type LeadTimeMapsDataDTO = z.infer<typeof LeadTimeMapsDataSchema>

export const LeadTimeMonthlyDataSchema = z.object({
  period: z.string(),
  avg_duration: z.number(),
})

export type LeadTimeMonthlyDataDTO = z.infer<typeof LeadTimeMonthlyDataSchema>

export const LeadTimeMostDeliveryDataSchema = z.object({
  name: z.string(),
  customer_regency_name: z.string(),
  count: z.number(),
  avg_duration: z.number(),
})

export type LeadTimeMostDeliveryDataDTO = z.infer<
  typeof LeadTimeMostDeliveryDataSchema
>

// Last Mile Schemas
export const LastMileQueryParamsSchema = QueryParamsSchema.and(
  z.object({
    period: z.string().optional(),
    start_period: z.string().optional(),
    end_period: z.string().optional(),
  })
)

export type LastMileQueryParams = z.infer<typeof LastMileQueryParamsSchema>

export const LastMileMapItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  distribution: z.number(),
  receive: z.number(),
})

export type LastMileMapItemDTO = z.infer<typeof LastMileMapItemSchema>

export const LastMileTotalSchema = z.object({
  distribution: z.number(),
  received: z.number(),
})

export type LastMileTotalDTO = z.infer<typeof LastMileTotalSchema>

export const LastMileMonthlyComparisonItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  receive: z.number(),
  distribution: z.number(),
  last_mile: z.number(),
})

export type LastMileMonthlyComparisonItemDTO = z.infer<
  typeof LastMileMonthlyComparisonItemSchema
>

export const LastMileMonthlyComparisonSchema = z.object({
  last_12_months: z.string(),
  dataset: z.array(LastMileMonthlyComparisonItemSchema),
})

export type LastMileMonthlyComparisonDTO = z.infer<
  typeof LastMileMonthlyComparisonSchema
>

export const LastMileDistributionItemSchema = z.object({
  id: z.number(),
  label: z.string(),
  last_mile: z.number(),
})

export type LastMileDistributionItemDTO = z.infer<
  typeof LastMileDistributionItemSchema
>

export const LastMileMonthlyLastMileItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  vaccine: z.number(),
  medicine: z.number(),
  consumable: z.number(),
  medical_consumable: z.number(),
})

export type LastMileMonthlyLastMileItemDTO = z.infer<
  typeof LastMileMonthlyLastMileItemSchema
>

export const LastMileMonthlyLastMileSchema = z.object({
  last_12_months: z.string(),
  dataset: z.array(LastMileMonthlyLastMileItemSchema),
})

export type LastMileMonthlyLastMileDTO = z.infer<
  typeof LastMileMonthlyLastMileSchema
>

export const LastMileResponseSchema = z.object({
  last_updated: z.string(),
  data: z.object({
    maps: MapsDataSchema,
    total: LastMileTotalSchema,
    monthly_comparison: LastMileMonthlyComparisonSchema,
    distribution: z.array(LastMileDistributionItemSchema),
    monthly_last_mile: LastMileMonthlyLastMileSchema,
  }),
})

export type LastMileResponse = z.infer<typeof LastMileResponseSchema>

// Data DTOs for database results
export const LastMileMapsDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  distribution: z.number(),
  receive: z.number(),
})

export type LastMileMapsDataDTO = z.infer<typeof LastMileMapsDataSchema>

export const LastMileMonthlyDataSchema = z.object({
  period: z.string(),
  distribution: z.number(),
  receive: z.number(),
})

export type LastMileMonthlyDataDTO = z.infer<typeof LastMileMonthlyDataSchema>

export const LastMileDistributionDataSchema = z.object({
  material_type_name: z.string(),
  distribution: z.number(),
})

export type LastMileDistributionDataDTO = z.infer<
  typeof LastMileDistributionDataSchema
>

export const LastMileMonthlyLastMileDataSchema = z.object({
  period: z.string(),
  vaccine: z.number(),
  medicine: z.number(),
  consumable: z.number(),
  medical_consumable: z.number(),
})

export type LastMileMonthlyLastMileDataDTO = z.infer<
  typeof LastMileMonthlyLastMileDataSchema
>

// Last Mile Material Schemas
export const LastMileMaterialQueryParamsSchema = QueryParamsSchema.and(
  z.object({
    period: z.string(),
    material_type: z.string(),
  })
)

export type LastMileMaterialQueryParams = z.infer<
  typeof LastMileMaterialQueryParamsSchema
>

export const LastMileMaterialItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number(),
})

export type LastMileMaterialItemDTO = z.infer<typeof LastMileMaterialItemSchema>

export const LastMileMaterialDataSchema = z.object({
  selected_date: z.string(),
  material_type: z.string(),
  dataset: z.array(LastMileMaterialItemSchema),
})

export type LastMileMaterialDataDTO = z.infer<typeof LastMileMaterialDataSchema>

export const LastMileMaterialResponseSchema = z.object({
  last_updated: z.string(),
  data: LastMileMaterialDataSchema,
})

export type LastMileMaterialResponse = z.infer<
  typeof LastMileMaterialResponseSchema
>

export const LastMileMaterialDataItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number(),
})

export type LastMileMaterialDataItemDTO = z.infer<
  typeof LastMileMaterialDataItemSchema
>
