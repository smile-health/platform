import {
  QueryParamsSchema,
  stringDate,
} from "@/common/schemas/query-param.schema.js"
import { IdSchema } from "@smile/lib/types/param.js"
import { z } from "zod"

// Unified Quality Schemas
export const QualityQueryParamsSchema = QueryParamsSchema.and(
  z.object({
    period: stringDate("YYYY-MM").optional(),
    start_period: stringDate("YYYY-MM").optional(),
    end_period: stringDate("YYYY-MM").optional(),
    asset_classification_id: IdSchema.optional(),
  })
)

export type QualityQueryParams = z.infer<typeof QualityQueryParamsSchema>

export const StockTakingMapItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number(),
  tooltip: z.string(),
})

export type StockTakingMapItemDTO = z.infer<typeof StockTakingMapItemSchema>

export const StockTakingOverviewSchema = z.object({
  stock_taking_accuracy: z.number(),
  stock_differene: z.number(),
})

export type StockTakingOverviewDTO = z.infer<typeof StockTakingOverviewSchema>

export const StockTakingMonthlyComparisonItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
})

export type StockTakingMonthlyComparisonItemDTO = z.infer<
  typeof StockTakingMonthlyComparisonItemSchema
>

export const StockTakingMonthlyComparisonSchema = z.object({
  last_12_months: z.string(),
  dataset: z.array(StockTakingMonthlyComparisonItemSchema),
})

export type StockTakingMonthlyComparisonDTO = z.infer<
  typeof StockTakingMonthlyComparisonSchema
>

export const StockTakingRankingItemSchema = z.object({
  row: z.number(),
  label: z.string(),
  value: z.number(),
})

export type StockTakingRankingItemDTO = z.infer<
  typeof StockTakingRankingItemSchema
>

export const StockTakingRankingSchema = z.object({
  last_month: z.string(),
  dataset: z.array(StockTakingRankingItemSchema),
})

export type StockTakingRankingDTO = z.infer<typeof StockTakingRankingSchema>

export const StockTakingResponseSchema = z.object({
  last_updated: z.string(),
  data: z.object({
    maps: z.object({
      area: z.object({
        id: z.number(),
        name: z.string(),
      }),
      dataset: z.array(StockTakingMapItemSchema),
    }),
    overview: StockTakingOverviewSchema,
    monthly_comparison: StockTakingMonthlyComparisonSchema,
    higest_stock_taking: StockTakingRankingSchema,
    lowest_stock_taking: StockTakingRankingSchema,
  }),
})

export type StockTakingResponse = z.infer<typeof StockTakingResponseSchema>

export const StockDiscardMapItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  discard: z.number(),
  expired: z.number(),
  broken: z.number(),
  other: z.number(),
  pending_discard: z.number(),
})

export type StockDiscardMapItemDTO = z.infer<typeof StockDiscardMapItemSchema>

export const StockDiscardTotalSchema = z.object({
  discard: z.number(),
  pending_discard: z.number(),
})

export type StockDiscardTotalDTO = z.infer<typeof StockDiscardTotalSchema>

export const StockDiscardMonthlyItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  broken: z.number(),
  expired: z.number(),
  others: z.number(),
})

export type StockDiscardMonthlyItemDTO = z.infer<
  typeof StockDiscardMonthlyItemSchema
>

export const StockDiscardMonthlySchema = z.object({
  last_12_months: z.string(),
  dataset: z.array(StockDiscardMonthlyItemSchema),
})

export type StockDiscardMonthlyDTO = z.infer<typeof StockDiscardMonthlySchema>

export const StockDiscardPendingItemSchema = z.object({
  row: z.number(),
  label: z.string(),
  value: z.number(),
})

export type StockDiscardPendingItemDTO = z.infer<
  typeof StockDiscardPendingItemSchema
>

export const StockDiscardPendingSchema = z.object({
  this_month: z.string(),
  dataset: z.array(StockDiscardPendingItemSchema),
})

export type StockDiscardPendingDTO = z.infer<typeof StockDiscardPendingSchema>

export const StockDiscardTop10ItemSchema = z.object({
  row: z.number(),
  label: z.string(),
  value: z.number(),
})

export type StockDiscardTop10ItemDTO = z.infer<
  typeof StockDiscardTop10ItemSchema
>

export const StockDiscardTop10Schema = z.object({
  this_month: z.string(),
  dataset: z.object({
    expired: z.array(StockDiscardTop10ItemSchema),
    broken: z.array(StockDiscardTop10ItemSchema),
    others: z.array(StockDiscardTop10ItemSchema),
  }),
})

export type StockDiscardTop10DTO = z.infer<typeof StockDiscardTop10Schema>

export const StockDiscardResponseSchema = z.object({
  last_updated: z.string(),
  data: z.object({
    maps: z.object({
      area: z.object({
        id: z.number(),
        name: z.string(),
      }),
      dataset: z.array(StockDiscardMapItemSchema),
    }),
    total: StockDiscardTotalSchema,
    discard: StockDiscardMonthlySchema,
    higest_pending_discard: StockDiscardPendingSchema,
    top_10_discard: StockDiscardTop10Schema,
  }),
})

export type StockDiscardResponse = z.infer<typeof StockDiscardResponseSchema>

// Asset Schemas
export const AssetMetricSchema = z.object({
  value: z.number(),
  percent: z.number(),
  total: z.number(),
})

export type AssetMetricDTO = z.infer<typeof AssetMetricSchema>

export const AssetMapItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  damaged: AssetMetricSchema,
  unrecorded: AssetMetricSchema,
  overdue_calibartion: AssetMetricSchema,
  temp_excursion: AssetMetricSchema,
  avg_temp_excursion: z.string(),
})

export type AssetMapItemDTO = z.infer<typeof AssetMapItemSchema>

export const AssetMapsSchema = z.object({
  area: z.object({
    id: z.number(),
    name: z.string(),
  }),
  dataset: z.array(AssetMapItemSchema),
})

export type AssetMapsDTO = z.infer<typeof AssetMapsSchema>

export const AssetOverviewItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
})

export type AssetOverviewItemDTO = z.infer<typeof AssetOverviewItemSchema>

export const AssetResponseSchema = z.object({
  last_updated: z.string(),
  data: z.object({
    maps: AssetMapsSchema,
    total: z.number(),
    overview: z.array(AssetOverviewItemSchema),
  }),
})

export type AssetResponse = z.infer<typeof AssetResponseSchema>

// Database DTOs - Stock Taking
export const StockTakingMapsDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  avg_accuracy_percentage: z.number(),
})

export type StockTakingMapsDataDTO = z.infer<typeof StockTakingMapsDataSchema>

export const StockTakingOverviewDataSchema = z.object({
  avg_accuracy_percentage: z.number(),
  total_difference: z.number(),
})

export type StockTakingOverviewDataDTO = z.infer<
  typeof StockTakingOverviewDataSchema
>

export const StockTakingMonthlyDataSchema = z.object({
  period: z.string(),
  avg_accuracy_percentage: z.number(),
})

export type StockTakingMonthlyDataDTO = z.infer<
  typeof StockTakingMonthlyDataSchema
>

export const StockTakingRankingDataSchema = z.object({
  name: z.string(),
  avg_accuracy_percentage: z.number(),
})

export type StockTakingRankingDataDTO = z.infer<
  typeof StockTakingRankingDataSchema
>

// Database DTOs - Stock Discard
export const StockDiscardMapsDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  discard: z.number(),
  expired: z.number(),
  broken: z.number(),
  other: z.number(),
  pending_discard: z.number(),
})

export type StockDiscardMapsDataDTO = z.infer<typeof StockDiscardMapsDataSchema>

export const StockDiscardTotalDataSchema = z.object({
  discard: z.number(),
})

export type StockDiscardTotalDataDTO = z.infer<
  typeof StockDiscardTotalDataSchema
>

export const StockDiscardPendingTotalDataSchema = z.object({
  pending_discard: z.number(),
})

export type StockDiscardPendingTotalDataDTO = z.infer<
  typeof StockDiscardPendingTotalDataSchema
>

export const StockDiscardMonthlyDataSchema = z.object({
  period: z.string(),
  expired: z.number(),
  broken: z.number(),
  other: z.number(),
})

export type StockDiscardMonthlyDataDTO = z.infer<
  typeof StockDiscardMonthlyDataSchema
>

export const StockDiscardPendingDataSchema = z.object({
  name: z.string(),
  pending_discard: z.number(),
})

export type StockDiscardPendingDataDTO = z.infer<
  typeof StockDiscardPendingDataSchema
>

export const StockDiscardTop10DataSchema = z.object({
  reason_category: z.string(),
  parent_material_name: z.string(),
  discard_qty: z.number(),
})

export type StockDiscardTop10DataDTO = z.infer<
  typeof StockDiscardTop10DataSchema
>

// Database DTOs - Asset
export const AssetMapsDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  total_asset_recorded: z.number(),
  total_asset_cce_rtmd: z.number(),
  damaged_asset: z.number(),
})

export type AssetMapsDataDTO = z.infer<typeof AssetMapsDataSchema>

// Database DTOs - Asset
export const AssetDistinctMapsDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  entities_with_urecorded_asset: z.number(),
  total_entities: z.number(),
  total_asset_cce_excursion: z.number().nullable(),
  avg_duration_excursion: z.number().nullable(),
})

export type AssetDistinctMapsDataDTO = z.infer<
  typeof AssetDistinctMapsDataSchema
>

export const AssetOverviewDataSchema = z.object({
  asset_type_id: z.number().nullable(),
  asset_type_name: z.string().nullable(),
  total_asset_recorded: z.number(),
})

export type AssetOverviewDataDTO = z.infer<typeof AssetOverviewDataSchema>

export const AssetDamagedDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  damaged_asset: z.number(),
})

export type AssetDamagedDataDTO = z.infer<typeof AssetDamagedDataSchema>

export const AssetOverdueDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  asset_overdue: z.number(),
  overdue_total_asset: z.number(),
})

export type AssetOverdueDataDTO = z.infer<typeof AssetOverdueDataSchema>

export const AssetTotalDataSchema = z.object({
  total_asset_recorded: z.number(),
})

export type AssetTotalDataDTO = z.infer<typeof AssetTotalDataSchema>
