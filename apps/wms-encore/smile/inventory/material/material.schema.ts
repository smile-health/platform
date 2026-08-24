// Ported from apps/core/src/modules/material/material.schema.ts — same
// field constraints (positive numbers, string lengths, 0/1 flags), minus
// is_kfa (dropped, see db.types.ts) and the integration_client_id fields
// (integration association isn't ported in this scaffold).
import { z } from "zod";

export const MATERIAL_LEVEL = {
  INGREDIENT: 1,
  TEMPLATE: 2,
  VARIANT: 3,
  PACKAGING: 4,
} as const;

const preprocessToString = (value: unknown) => (typeof value === "number" ? String(value) : value);

export const MaterialSchema = z.object({
  id: z.number().positive(),
  name: z.preprocess(preprocessToString, z.string().min(1).max(255)),
  description: z.preprocess(preprocessToString, z.string().max(255).nullish()),
  material_level_id: z.number().positive(),
  code: z.preprocess(preprocessToString, z.string().min(1).max(255)),
  hierarchy_code: z.preprocess(preprocessToString, z.string().min(1).max(255).nullish()),
  unit_of_consumption_id: z.number().positive(),
  unit_of_distribution_id: z.number().positive(),
  consumption_unit_per_distribution_unit: z.number().positive(),
  min_retail_price: z.number().nonnegative(),
  max_retail_price: z.number().nonnegative(),
  is_temperature_sensitive: z.number().min(0).max(1),
  min_temperature: z.number().int().nullish(),
  max_temperature: z.number().int().nullish(),
  material_type_id: z.number().positive(),
  material_subtype_id: z.number().positive().optional().nullish(),
  is_managed_in_batch: z.number().min(0).max(1),
  is_stock_opname_mandatory: z.number().min(0).max(1).default(0),
  status: z.number().min(0).max(1),
});

// Request schema (create/update) — same shape as the original's
// CreateMaterialRequestSchema/UpdateMaterialRequestSchema: base fields plus
// is_hierarchy + material_parent_ids + program_ids, minus server-managed
// fields (id/status/timestamps/audit).
export const MaterialRequestSchema = MaterialSchema.omit({ id: true, status: true }).extend({
  material_parent_ids: z.array(z.number().positive()).nullish(),
  program_ids: z.array(z.number().positive()).nullish(),
  is_hierarchy: z.number().min(0).max(1),
});

export const UpdateStatusRequestSchema = z.object({
  status: z.number().min(0).max(1),
});

export type MaterialRequest = z.infer<typeof MaterialRequestSchema>;
export type UpdateStatusRequest = z.infer<typeof UpdateStatusRequestSchema>;
