import { QueryParamsSchema } from "@/common/schemas/query-param.schema.js"
import { DateSchema, IdSchema } from "@smile-health/lib/types/param.js"
import { z } from "zod"

/* Schemas */
export const MaterialSchema = z.object({
  id: IdSchema,
  name: z.string(),
  global_id: IdSchema,
  parent_global_id: IdSchema.nullish(),
  parent_id: IdSchema.nullish(),
  program_id: IdSchema,
  status: z.number().int().nullish(),
  is_open_vial: z.number().int().nullish(),
  is_addremove: z.number().int().nullish(),
  description: z.string().nullish(),
  material_level_id: IdSchema,
  code: z.string(),
  hierarchy_code: z.string().nullish(),
  unit_of_consumption_id: IdSchema,
  unit_of_consumption: z.string(),
  unit_of_distribution: z.string(),
  unit_of_distribution_id: IdSchema,
  consumption_unit_per_distribution_unit: z.number().int(),
  is_temperature_sensitive: z.number().int(),
  min_retail_price: z.number(),
  max_retail_price: z.number(),
  min_temperature: z.number().nullish(),
  max_temperature: z.number().nullish(),
  material_type_id: IdSchema,
  material_type: IdSchema,
  is_stock_opname_mandatory: z.number().int().nullish(),
  is_managed_in_batch: z.number().int(),
  created_by: IdSchema,
  updated_by: IdSchema,
  deleted_by: IdSchema.nullish(),
  created_at: DateSchema,
  updated_at: DateSchema,
  deleted_at: DateSchema.nullish(),
})

export const MaterialQueryParamsSchema = z.intersection(
  QueryParamsSchema,
  z.object({
    material_is_stock_opname_mandatory: z.number().optional(),
  })
)

export const MaterialItemDTOSchema = MaterialSchema.pick({
  id: true,
  name: true,
  code: true,
  material_type_id: true,
  is_stock_opname_mandatory: true,
})

export const MaterialDTOSchema = z.array(MaterialItemDTOSchema)

export const SoMaterialDenomItemDTOSchema = z.object({
  entity_id: IdSchema,
  total_material_denom: z.number(),
})

export const SoMaterialDenomDTOSchema = z.array(SoMaterialDenomItemDTOSchema)

export const SoMaterialDenomListItemDTOSchema = z.object({
  entity_id: IdSchema,
  material_id: IdSchema,
})

export const SoMaterialDenomListDTOSchema = z.array(
  SoMaterialDenomListItemDTOSchema
)

/* Types */
export type Material = z.infer<typeof MaterialSchema>

export type MaterialQueryParams = z.infer<typeof MaterialQueryParamsSchema>

export type MaterialItemDTO = z.infer<typeof MaterialItemDTOSchema>
export type MaterialDTO = z.infer<typeof MaterialDTOSchema>

export type SoMaterialDenomItemDTO = z.infer<
  typeof SoMaterialDenomItemDTOSchema
>
export type SoMaterialDenomDTO = z.infer<typeof SoMaterialDenomDTOSchema>

export type SoMaterialDenomListItemDTO = z.infer<
  typeof SoMaterialDenomListItemDTOSchema
>
export type SoMaterialDenomListDTO = z.infer<
  typeof SoMaterialDenomListDTOSchema
>
