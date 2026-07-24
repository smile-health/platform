import { z } from "zod"

export const GetProcurementRecapitulationQuerySchema = z.object({
  program_plan_id: z.coerce.number().int().positive(),
  regency_id: z.coerce.number().int().positive().optional(),
  keyword: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  paginate: z.coerce.number().int().positive().optional(),
  remaining_stock_date: z.string().optional(),
})

export type GetProcurementRecapitulationQuery = z.infer<
  typeof GetProcurementRecapitulationQuerySchema
>

export const UpdateRemainingStockBodySchema = z.object({
  program_plan_id: z.number().int().positive(),
  items: z
    .array(
      z.object({
        material_id: z.number().int().positive(),
        variant_id: z.number().int().positive().nullable().optional(),
        remaining_stock: z.number().int().nonnegative(),
      })
    )
    .min(1, "At least one item is required"),
})

export type UpdateRemainingStockBody = z.infer<
  typeof UpdateRemainingStockBodySchema
>

export const UpdateDeskResultBodySchema = z.object({
  program_plan_id: z.number().int().positive(),
  entity_id: z.number().int().positive(),
  items: z
    .array(
      z.object({
        material_id: z.number().int().positive(),
        variant_id: z.number().int().positive().nullable().optional(),
        desk_result: z.number().int().nonnegative(),
      })
    )
    .min(1, "At least one item is required"),
})

export type UpdateDeskResultBody = z.infer<typeof UpdateDeskResultBodySchema>

export const CreateDeskResultBodySchema = z.object({
  program_plan_id: z.number().int().positive(),
  entity_id: z.number().int().positive(),
  status_desk: z.number().int().min(0).default(0),
  ba_file_url: z.string().url().optional(),
  signature_link: z.string().url().optional(),
  desk_date: z.string().optional(),
  desk_by: z.number().int().positive().optional(),
})

export type CreateDeskResultBody = z.infer<typeof CreateDeskResultBodySchema>
