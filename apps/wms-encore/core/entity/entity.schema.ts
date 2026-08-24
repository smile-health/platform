// Ported from apps/core/src/modules/entity/entity.schema.ts's EntityDto /
// CreateEntityRequest. Fields removed (Indonesia-specific, same reasoning
// as core/db.types.ts's EntitiesTable note):
//   province_id, regency_id, sub_district_id, village_id -> replaced by a
//     single `location_id` against the generic `locations` table.
//   id_satu_sehat, is_puskesmas -> dropped entirely (SATUSEHAT/puskesmas
//     are Indonesia MoH-specific concepts).
//   is_sentinel_lab, sentinel_lab_start_date, sentinel_lab_end_date ->
//     dropped. This is Indonesia's sentinel-lab surveillance program
//     (hardcoded to a specific entity_tag_id=29 in the original) — a
//     national-program-specific feature, not generic entity data.
import { z } from "zod";

export const EntitySchema = z.object({
  code: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  type: z.number().positive(),
  status: z.number().min(0).max(1).default(1),
  address: z.string().max(255),
  country: z.string().max(255).nullish(),
  location_id: z.number().positive().nullish(),
  postal_code: z.string().max(255).nullish(),
  lat: z.string().max(255).nullish(),
  lng: z.string().max(255).nullish(),
  entity_tag_id: z.number().positive(),
  is_vendor: z.number().min(0).max(1).default(0),
  integration_type: z.number().nullish(),
  external_properties: z.record(z.any()).nullish(),
});

export const EntityRequestSchema = EntitySchema.extend({
  program_ids: z.array(z.number().positive()).nullish(),
});

export type EntityRequest = z.infer<typeof EntityRequestSchema>;
