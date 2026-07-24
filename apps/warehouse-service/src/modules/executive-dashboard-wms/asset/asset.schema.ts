import { z } from "zod"
import { IdSchema } from "@smile-health/lib/types/param.js"

export const AssetQueryParamsSchema = z.object({
  province_id: IdSchema.optional(),
})

export type AssetQueryParams = z.infer<typeof AssetQueryParamsSchema>

// Schema untuk dataset per provinsi di maps
export const MapDatasetItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  coldstorage: z.number(),
  autoclave: z.number(),
  incinerator: z.number(),
  scale: z.object({
    unit: z.number(),
    borrowed: z.number(),
  }),
  overdue_calbration: z.number(),
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

// Schema untuk overview
export const OverviewSchema = z.object({
  ownership: z.object({
    total: z.number(),
    loaned: z.number(),
    self_owned: z.number(),
  }),
  scale: z.object({
    shared: z.object({
      total: z.number(),
      from_third_party: z.number(),
    }),
    provided: z.object({
      third_party: z.number(),
      health_facilitator: z.number(),
    }),
  }),
  cold_storage: z.object({
    total: z.number(),
    borrowed: z.number(),
  }),
  autoclave: z.number(),
  incinerator: z.number(),
})

export type Overview = z.infer<typeof OverviewSchema>

// Schema untuk response
export const AssetResponseSchema = z.object({
  last_updated: z.string(),
  data: z.object({
    maps: MapsSchema,
    total: z.number(),
    overview: OverviewSchema,
  }),
})

export type AssetResponse = z.infer<typeof AssetResponseSchema>

// DTOs for database queries
export const AssetDataDTOSchema = z.object({
  province_id: z.string(),
  province_name: z.string(),
  area_name: z.string().nullable().optional(),
  coldstorage: z.number(),
  autoclave: z.number(),
  incinerator: z.number(),
  scale_unit: z.number(),
  scale_borrowed: z.number(),
  overdue_calibration: z.number(),
})

export type AssetDataDTO = z.infer<typeof AssetDataDTOSchema>

export const NationalDataDTOSchema = z.object({
  coldstorage: z.number(),
  coldstorage_borrowed: z.number(),
  autoclave: z.number(),
  incinerator: z.number(),
  scale_unit: z.number(),
  scale_borrowed: z.number(),
  scale_third_party: z.number(),
  ownership_total_scale: z.number(),
  ownership_scale_borrowed: z.number(),
  scale_shared_total: z.number(),
  scale_shared_from_third_party: z.number(),
  scale_provided_third_party: z.number(),
  scale_provided_health_facilitator: z.number(),
  overview_cold_storage_total: z.number(),
  overview_cold_storage_borrowed: z.number(),
  overview_autoclave: z.number(),
  overview_incinerator: z.number(),
  scale_health_facilitator: z.number(),
  total_all: z.number(),
})

export type NationalDataDTO = z.infer<typeof NationalDataDTOSchema>
