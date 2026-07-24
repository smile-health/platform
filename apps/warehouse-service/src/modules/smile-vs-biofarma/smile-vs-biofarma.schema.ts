import { FLAG } from "@/common/constants/common.js"
import { ORDER_STATUS } from "@/common/constants/order.js"
import { QueryParamsSchema } from "@/common/schemas/query-param.schema.js"
import { z } from "zod"

export const SmileVsBiofarmaQueryParamsSchema = z.intersection(
  QueryParamsSchema,
  z.object({
    reverse: z.preprocess(Number, z.nativeEnum(FLAG)).default(FLAG.FALSE),
    order_status: z.preprocess(Number, z.nativeEnum(ORDER_STATUS)).optional(),
    biofarma_material_name: z.string().optional(),
    keyword: z.string().optional(),
  })
)

export type SmileVsBiofarmaQueryParams = z.infer<
  typeof SmileVsBiofarmaQueryParamsSchema
>

export const SummaryDataSchema = z.object({
  smdv_total: z.number().nullable(),
  smile_total: z.number().nullable(),
})

export type SummaryDataDTO = z.infer<typeof SummaryDataSchema>

export const SummaryResponseSchema = z.object({
  smdv_qty: z.number(),
  smile_qty: z.number(),
  deviation_qty: z.number(),
  deviation_percentage: z.number(),
})

export type SummaryResponse = z.infer<typeof SummaryResponseSchema>

export const MaterialDataSchema = SummaryResponseSchema.extend({
  master_material_id: z.number().nullable(),
  master_material_name: z.string().nullable(),
  material_biofarma: z.string().nullable(),
  name: z.string().nullable(),
})

export type MaterialDataDTO = z.infer<typeof MaterialDataSchema>

export const EntityDataSchema = SummaryResponseSchema.extend({
  entity_id: z.number().nullable(),
  entity_name: z.string().nullable(),
  entity_type: z.string().nullable(),
  name: z.string().nullable(),
  province_id: z.number().nullable(),
})

export type EntityDataDTO = z.infer<typeof EntityDataSchema>

export const LastUpdatedSchema = z.object({
  last_update: z.string(),
})

export type LastUpdatedDTO = z.infer<typeof LastUpdatedSchema>

export const TableDataItemSchema = z.object({
  row: z.number(),
  material: z
    .object({
      id: z.number().nullable(),
      name: z.string().nullable(),
    })
    .optional(),
  entity: z
    .object({
      id: z.number().nullable(),
      name: z.string().nullable(),
    })
    .nullable(),
  material_name: z.string().optional(),
  entity_name: z.string().nullish(),
  smile_qty: z.number(),
  smdv_qty: z.number(),
  deviation_qty: z.number(),
  deviation_percentage: z.number(),
})

export const TableResponseSchema = z.object({
  date: z.string(),
  page: z.number(),
  item_per_page: z.number(),
  total_item: z.number(),
  total_page: z.number(),
  list_pagination: z.array(z.number()),
  last_updated: z.string().optional(),
  data: z.array(TableDataItemSchema),
})

export type TableResponse = z.infer<typeof TableResponseSchema>

export const BiofarmaOrderSchema = z.object({
  smile_order_created_at: z.string().nullable(),
  smile_order_id: z.string().nullable(),
  smile_order_status_label: z.string().nullable(),
  province_name: z.string().nullable(),
  regency_name: z.string().nullable(),
  entity_name: z.string().nullable(),
  smile_order_stock_allocated_qty: z.number().nullable(),
  smile_order_stock_received_qty: z.number().nullable(),
  biofarma_nama_produk: z.string().nullable(),
  biofarma_nomor_do: z.string().nullable(),
  smile_batch_code: z.string().nullable(),
  smile_order_fulfilled_at: z.string().nullable(),
})

export type BiofarmaOrderDTO = z.infer<typeof BiofarmaOrderSchema>

export type SummaryByEntityDTO = {
  row: number
  entity: {
    id: number | null
    name: string | null
  }
  entity_name: string | null
  smile_qty: number
  smdv_qty: number
  deviation_qty: number
  deviation_percentage: number
}

export type SummaryByMaterialDTO = {
  row: number
  material: {
    id: number | null
    name: string | null
  }
  material_name: string | null
  biofarma_material_name: string | null
  smile_material_name: string | null
  smile_qty: number
  smdv_qty: number
  deviation_qty: number
  deviation_percentage: number
}
