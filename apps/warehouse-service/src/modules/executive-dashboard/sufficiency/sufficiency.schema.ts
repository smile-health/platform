import {
  QueryParamsSchema,
  stringDate,
} from "@/common/schemas/query-param.schema.js"
import { z } from "zod"

export const SufficiencyQueryParamsSchema = QueryParamsSchema.and(
  z.object({
    period: stringDate("YYYY-MM").optional(),
    start_period: stringDate("YYYY-MM").optional(),
    end_period: stringDate("YYYY-MM").optional(),
  })
)

// Base Schemas
export const SufficiencyBaseItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number(),
})

export const SufficiencyLastUpdateResultSchema = z.array(
  z.object({
    last_update: z.string(),
  })
)

// Maps Data Schemas
export const SufficiencyMapResultItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  total: z.number(),
  insufficient: z.number(),
  at_risk: z.number(),
  sufficient: z.number(),
})

export const SufficiencyMapsResultSchema = z.array(
  SufficiencyMapResultItemSchema
)

export const SufficiencyMapItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  total: z.number(),
  insufficient: z.number(),
  at_risk: z.number(),
  sufficient: z.number(),
})

export const SufficiencyMapsDatasetSchema = z.object({
  not_available: z.array(SufficiencyMapItemSchema),
  insufficient: z.array(SufficiencyMapItemSchema),
  at_risk: z.array(SufficiencyMapItemSchema),
  sufficient: z.array(SufficiencyMapItemSchema),
})

export const SufficiencyAreaSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export const SufficiencyMapsSchema = z.object({
  area: SufficiencyAreaSchema,
  dataset: SufficiencyMapsDatasetSchema,
})

// Overview Schema
export const SufficiencyOverviewResultItemSchema = z.object({
  stock_critical_materials: z.number().optional(),
  medicine_sufficient: z.number().optional(),
  medicine_total: z.number().optional(),
  vaccine_sufficient: z.number().optional(),
  vaccine_total: z.number().optional(),
  consumable_sufficient: z.number().optional(),
  consumable_total: z.number().optional(),
  medical_consumable_sufficient: z.number().optional(),
  medical_consumable_total: z.number().optional(),
})

export const SufficiencyOverviewResultSchema = z.array(
  SufficiencyOverviewResultItemSchema
)

export const SufficiencyCriticalOverviewResultItemSchema = z.object({
  stock_critical_materials: z.number().optional(),
})

export const SufficiencyCriticalOverviewResultSchema = z.array(
  SufficiencyCriticalOverviewResultItemSchema
)

export const SufficiencyOverviewSchema = z.object({
  stock_critical_materials: z.number(),
  consumable: z.number(),
  vaccine: z.number(),
  medicine: z.number(),
  medical_consumable: z.number(),
})

// Monthly Comparison Schema
export const SufficiencyMonthlyComparisonResultItemSchema = z.object({
  period: z.string(),
  value: z.number(),
})

export const SufficiencyMonthlyComparisonResultSchema = z.array(
  SufficiencyMonthlyComparisonResultItemSchema
)

export const SufficiencyMonthlyComparisonItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
})

export const SufficiencyMonthlyComparisonSchema = z.object({
  last_12_months: z.string(),
  dataset: z.array(SufficiencyMonthlyComparisonItemSchema),
})

// Top 10 Materials Schema
export const SufficiencySufficiencyTop10MaterialsResultItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  consumption_value_agg: z.number(),
  status: z.string(),
})

export const SufficiencyTop10MaterialsResultSchema = z.array(
  SufficiencySufficiencyTop10MaterialsResultItemSchema
)

export const SufficiencyTop10MaterialItemSchema = z.object({
  row: z.number(),
  label: z.string(),
  value: z.number().optional(),
})

export const SufficiencyTop10MaterialsDatasetSchema = z.object({
  insufficent: z.array(SufficiencyTop10MaterialItemSchema), // Note: keeping typo as in API spec
  risk: z.array(SufficiencyTop10MaterialItemSchema),
  sufficient: z.array(SufficiencyTop10MaterialItemSchema),
})

export const SufficiencyTop10MaterialsSchema = z.object({
  last_month: z.string(),
  dataset: SufficiencyTop10MaterialsDatasetSchema,
})

// Stock Out/Stock Max Schema
export const SufficiencyStockResultItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number(),
})

export const SufficiencyStockResultSchema = z.array(
  SufficiencyStockResultItemSchema
)

export const SufficiencyStockItemSchema = SufficiencyBaseItemSchema

export const SufficiencyStockDataSchema = z.object({
  this_month: z.string(),
  dataset: z.array(SufficiencyStockItemSchema),
})

// Main Response Schema
export const SufficiencyStockResponseSchema = z.object({
  last_updated: z.string(),
  data: z.object({
    maps: SufficiencyMapsSchema,
    overview: SufficiencyOverviewSchema,
    monthly_comparison: SufficiencyMonthlyComparisonSchema,
    top_10_materials: SufficiencyTop10MaterialsSchema,
    stock_out: SufficiencyStockDataSchema,
    stock_max: SufficiencyStockDataSchema,
  }),
})

// Stock Sufficiency Export Schema
export const SufficiencyExportDataItemSchema = z.object({
  entities_province_name: z.string().nullable(),
  entities_regency_name: z.string().nullable(),
  entities_id: z.number().nullable(),
  entities_name: z.string().nullable(),
  parent_material_name: z.string(),
  material_type_name: z.string(),
  balance_per_entity_parent_materials: z.number(),
  kebutuhan_1_tahun: z.number(),
  nilai_minimum: z.number().nullable(),
  avg_12_month: z.number(),
  sum_12_month: z.number(),
  consumption_value: z.number(),
  status: z.string(),
})

export const SufficiencyExportDataResultSchema = z.array(
  SufficiencyExportDataItemSchema
)

// Type definitions (inferred from schemas)
export type SufficiencyQueryParams = z.infer<
  typeof SufficiencyQueryParamsSchema
>
export type SufficiencyBaseItem = z.infer<typeof SufficiencyBaseItemSchema>
export type SufficiencyMapResultItemSchema = z.infer<
  typeof SufficiencyMapResultItemSchema
>
export type SufficiencyMapsResult = z.infer<typeof SufficiencyMapsResultSchema>
export type SufficiencyOverviewResultItem = z.infer<
  typeof SufficiencyOverviewResultItemSchema
>
export type SufficiencyOverviewResult = z.infer<
  typeof SufficiencyOverviewResultSchema
>
export type SufficiencyCriticalOverviewResultItem = z.infer<
  typeof SufficiencyCriticalOverviewResultItemSchema
>
export type SufficiencyCriticalOverviewResult = z.infer<
  typeof SufficiencyCriticalOverviewResultSchema
>
export type SufficiencyMonthlyComparisonResult = z.infer<
  typeof SufficiencyMonthlyComparisonResultSchema
>
export type SufficiencyTop10MaterialsResult = z.infer<
  typeof SufficiencyTop10MaterialsResultSchema
>
export type SufficiencyStockResult = z.infer<
  typeof SufficiencyStockResultSchema
>
export type SufficiencyLastUpdateResult = z.infer<
  typeof SufficiencyLastUpdateResultSchema
>
export type SufficiencyMonthlyComparisonDataItem = z.infer<
  typeof SufficiencyMonthlyComparisonResultItemSchema
>
export type SufficiencyTop10MaterialsResultItem = z.infer<
  typeof SufficiencySufficiencyTop10MaterialsResultItemSchema
>
export type SufficiencyStockResultItem = z.infer<
  typeof SufficiencyStockResultItemSchema
>
export type SufficiencyMapItem = z.infer<typeof SufficiencyMapItemSchema>
export type SufficiencyArea = z.infer<typeof SufficiencyAreaSchema>
export type SufficiencyMapsDataset = z.infer<
  typeof SufficiencyMapsDatasetSchema
>
export type SufficiencyMaps = z.infer<typeof SufficiencyMapsSchema>
export type SufficiencyOverview = z.infer<typeof SufficiencyOverviewSchema>
export type SufficiencyMonthlyComparisonItem = z.infer<
  typeof SufficiencyMonthlyComparisonItemSchema
>
export type SufficiencyMonthlyComparison = z.infer<
  typeof SufficiencyMonthlyComparisonSchema
>
export type SufficiencyTop10MaterialItem = z.infer<
  typeof SufficiencyTop10MaterialItemSchema
>
export type SufficiencyTop10MaterialsDataset = z.infer<
  typeof SufficiencyTop10MaterialsDatasetSchema
>
export type SufficiencyTop10Materials = z.infer<
  typeof SufficiencyTop10MaterialsSchema
>
export type SufficiencyStockItem = z.infer<typeof SufficiencyStockItemSchema>
export type SufficiencyStockData = z.infer<typeof SufficiencyStockDataSchema>
export type SufficiencyStockResponse = z.infer<
  typeof SufficiencyStockResponseSchema
>

export type SufficiencyExportDataItem = z.infer<
  typeof SufficiencyExportDataItemSchema
>
export type SufficiencyExportDataResult = z.infer<
  typeof SufficiencyExportDataResultSchema
>
