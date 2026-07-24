import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { IdSchema } from "@smile/lib/types/param.js"
import { z } from "zod"

export const GetBmhpMaterialsUnitDetailsQueriesSchema = PaginationQueriesSchema.extend({
  bmhp_material_details_id: IdSchema.optional().or(z.literal("")).transform(Number),
  variant_material_id: IdSchema.optional().or(z.literal("")).transform(Number),
  sort_by: z
    .enum(
      [
        "bmhp_material_details_id",
        "variant_material_id",
        "qty_per_package",
        "created_at",
        "updated_at",
      ],
      {
        message: "INVALID REQUEST SORT_BY",
      }
    )
    .optional(),
  sort_type: z
    .enum(["asc", "desc"], { message: "INVALID REQUEST SORT_TYPE" })
    .optional(),
})

export const CreateBmhpMaterialsUnitDetailRequestSchema = z.object({
  bmhp_material_details_id: z.number().positive().int(),
  variant_material_id: z.number().positive().int(),
  qty_per_package: z.number().positive().int().optional(),
  test_qty_per_package: z.number().positive().int().optional(),
  consumption_per_test: z.number().positive().int().optional(),
})

export const UpdateBmhpMaterialsUnitDetailRequestSchema = z.object({
  bmhp_material_details_id: z.number().positive().int().optional(),
  variant_material_id: z.number().positive().int().optional(),
  qty_per_package: z.number().positive().int().optional().nullable(),
  test_qty_per_package: z.number().positive().int().optional().nullable(),
  consumption_per_test: z.number().positive().int().optional().nullable(),
})

// Schema for calculating lab consumption
export const TargetItemSchema = z.object({
  id: z.number().positive().int(),
  sample_qty: z.number().positive().int(),
  test_qty: z.number().positive().int(),
})

export const CalculateLabConsumptionRequestSchema = z.object({
  examination_id: z.number().positive().int(),
  target: z.array(TargetItemSchema).min(1),
  program_plan_id: z.number().positive().int().optional(),
})

// Query schemas for by-material and by-variant
export const ByMaterialQuerySchema = z.object({
  template_id: IdSchema,
})

export const ByVariantQuerySchema = z.object({
  variant_id: IdSchema,
})

export type GetBmhpMaterialsUnitDetailsQueries = z.infer<
  typeof GetBmhpMaterialsUnitDetailsQueriesSchema
>
export type CreateBmhpMaterialsUnitDetailRequest = z.infer<
  typeof CreateBmhpMaterialsUnitDetailRequestSchema
>
export type UpdateBmhpMaterialsUnitDetailRequest = z.infer<
  typeof UpdateBmhpMaterialsUnitDetailRequestSchema
>
export type TargetItem = z.infer<typeof TargetItemSchema>
export const GetVariantDetailsQueriesSchema = PaginationQueriesSchema.extend({})

export type GetVariantDetailsQueries = z.infer<typeof GetVariantDetailsQueriesSchema>
export type CalculateLabConsumptionRequest = z.infer<typeof CalculateLabConsumptionRequestSchema>

