import { PaginationQueriesSchema } from "@smile/lib/types/paginate.js"
import { IdSchema } from "@smile/lib/types/param.js"
import { z } from "zod"

const preprocessNumberArray = (value: unknown) => {
  if (typeof value === "string") {
    return value.split(",").map((v) => parseInt(v.trim(), 10)).filter((v) => !isNaN(v))
  }
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (typeof v === "string") return parseInt(v, 10)
        if (typeof v === "number") return v
        return undefined
      })
      .filter((v) => v !== undefined)
  }
  return []
}

const PositiveIntSchema = z.number().int().positive()
const PositiveIntArraySchema = z.array(PositiveIntSchema).min(1)

export const GetBmhpPlanningMaterialsQueriesSchema = PaginationQueriesSchema.extend({
  bmhp_material_id: IdSchema.optional().or(z.literal("")).transform(Number),
  is_reagen: z.number().optional(),
  is_active: z.number().optional(),
  program_plan_id: z.coerce.number().positive().int().optional(),
})

const MaterialDetailItemSchema = z.object({
  material_id: z.number().positive().int(),
  // material_level_id: z.number().int().min(2).max(3),
  qty: z.number().int().min(0).default(0),
})

export const CreateBmhpMaterialRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  is_reagen: z.boolean().optional().default(false),
  description: z.string().optional(),
  is_active: z.boolean().optional().default(true),
  program_plan_id: z.number().positive().int(),
  material_details: z.array(MaterialDetailItemSchema).optional().default([]),
  // material_variant_details: z.array(MaterialDetailItemSchema).optional().default([]),
})

export const UpdateBmhpMaterialRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(150).optional(),
  // is_reagen: z.boolean().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  program_plan_id: z.number().positive().int().optional(),
  material_details: z.array(MaterialDetailItemSchema).optional(),
  // material_variant_details: z.array(MaterialDetailItemSchema).optional(),
})

export const UpdateBmhpMaterialStatusRequestSchema = z.object({
  is_active: z.boolean(),
})

export const CreateBmhpMaterialDetailRequestSchema = z.object({
  bmhp_material_id: z.number().positive().int(),
  material_id: z.number().positive().int(),
})

export const UpdateBmhpMaterialDetailRequestSchema = z.object({
  material_id: z.number().positive().int().optional(),
})

export const GetVariantRequestSchema = PaginationQueriesSchema.extend({
  material_ids: z.preprocess(preprocessNumberArray, PositiveIntArraySchema).optional(),
  material_level_id: z.coerce.number().positive().int().optional(),
  type: z.string(),
  is_variant: z.coerce.number().int().optional(),
})

const VariantItemSchema = z.object({
  material_id: z.number().positive().int(),
  name: z.string().min(1).max(150),
  test_qty: z.number().int().min(0),
  unit_id: z.number().int(),
})

export const GetMaterialQueriesSchema = PaginationQueriesSchema.extend({
  program_plan_id: z.coerce.number().positive().int().optional(),
})

export const GetProductVariantQueriesSchema = PaginationQueriesSchema.extend({
  material_id: z.coerce.number().positive().int().optional(),
  is_variant: z.coerce.number().int().optional(),
  program_plan_id: z.coerce.number().positive().int().optional(),
})

export const CreateProductVariantRequestSchema = z.object({
  material_id: z.number().positive().int(),
  is_variant: z.number().int().optional().default(0),
  program_plan_id: z.number().positive().int(),
  variants: z.array(VariantItemSchema).min(1),
})

export const UpdateProductVariantRequestSchema = z.object({
  material_id: z.number().positive().int().optional(),
  is_variant: z.number().int().optional().default(0),
  program_plan_id: z.number().positive().int().optional(),
  variants: z.array(VariantItemSchema).min(1).optional(),
})

export type GetMaterialQueries = z.infer<typeof GetMaterialQueriesSchema>
export type FindVariantsRequest = z.infer<typeof GetVariantRequestSchema>
export type GetVariantRequest = z.infer<typeof GetVariantRequestSchema>
export type GetProductVariantQueries = z.infer<typeof GetProductVariantQueriesSchema>
export type CreateProductVariantRequest = z.infer<typeof CreateProductVariantRequestSchema>
export type UpdateProductVariantRequest = z.infer<typeof UpdateProductVariantRequestSchema>

export type GetBmhpPlanningMaterialsQueries = z.infer<
  typeof GetBmhpPlanningMaterialsQueriesSchema
>
export type CreateBmhpMaterialRequest = z.infer<
  typeof CreateBmhpMaterialRequestSchema
>
export type UpdateBmhpMaterialRequest = z.infer<
  typeof UpdateBmhpMaterialRequestSchema
>
export type UpdateBmhpMaterialStatusRequest = z.infer<
  typeof UpdateBmhpMaterialStatusRequestSchema
>
export type CreateBmhpMaterialDetailRequest = z.infer<
  typeof CreateBmhpMaterialDetailRequestSchema
>
export type UpdateBmhpMaterialDetailRequest = z.infer<
  typeof UpdateBmhpMaterialDetailRequestSchema
>
