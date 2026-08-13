// Postgres columns for table `qr_code_config` (mirrors
// infrastructure/database/models/QrCodeConfigModel.ts field-for-field):
//
//   id                        bigint, unsigned, auto-increment, primary key
//   created_by                varchar(36), not null
//   updated_by                varchar(36), not null
//   healthcare_facility_id    bigint, unsigned, not null
//   waste_source_id           bigint, unsigned, not null
//   waste_classification_id   bigint, unsigned, not null
//   label_count                integer, unsigned, not null
//   created_at                timestamp, not null
//   updated_at                timestamp, not null
//   deleted_at                timestamp, nullable (paranoid soft-delete)
//   deleted_by                bigint, nullable
//
// The original repository (QrCodeConfigRepoitoryImpl.ts) also joins two
// sibling not-yet-ported tables for read/list, for integration reference:
//
//   waste_source table (WasteSourceModel): id, healthcare_facility_id,
//   source_type, internal_source_name, internal_treatment_name,
//   external_healthcare_facility_id, external_healthcare_facility_name,
//   is_active, is_residue.
//
//   waste_classification table (WasteClassificationModel): id, region_id,
//   effective_from, effective_to, waste_type_id, waste_group_id,
//   waste_characteristics_id, waste_code, waste_bag_color_code,
//   storage_rule_type, use_cold_storage, cold_storage_min_hours,
//   cold_storage_max_hours, temp_storage_min_hours, temp_storage_max_hours,
//   storage_rule, allow_healthcare_facility_treatment,
//   has_multiple_transporters, treatment_method, disposal_method,
//   allowed_vehicle_types — further joined to waste_hierarchy (id, name,
//   description, name_en, description_en, parent_hierarchy_id) three times,
//   aliased wasteType/wasteGroup/wasteCharacteristics via
//   waste_type_id/waste_group_id/waste_characteristics_id.
//
// waste_source/waste_classification/waste_hierarchy have since been ported
// (see apps/wms-encore/waste/) — the joins above are stale relative to that,
// not re-verified as part of this pass. The original also enriches list rows
// with getUsersDetail(updatedBy, token) to populate `userName` — see
// qr-code-config.service.ts, which now does this via getLocalUserName
// (shared/core/entity-user-lookup.ts) rather than in this repository layer.

import { db } from "../../db/db";
import type { PaginationMeta, QrCodeConfig } from "./qr-code-config.types";

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string;
  healthcare_facility_id: number;
  waste_source_id: number;
  waste_classification_id: number;
  label_count: number;
  created_at: Date;
  updated_at: Date;
}): QrCodeConfig {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    healthcareFacilityId: row.healthcare_facility_id,
    wasteSourceId: row.waste_source_id,
    wasteClassificationId: row.waste_classification_id,
    labelCount: row.label_count,
  };
}

export async function findById(id: number): Promise<QrCodeConfig | null> {
  const row = await db
    .selectFrom("qr_code_config")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  healthcareFacilityId?: number;
  search?: string;
  sourceType?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<{ data: QrCodeConfig[]; pagination: PaginationMeta }> {
  let query = db.selectFrom("qr_code_config").where("deleted_at", "is", null);

  if (params.healthcareFacilityId !== undefined) {
    query = query.where("healthcare_facility_id", "=", params.healthcareFacilityId);
  }

  // Original filters/searches across the joined waste_source /
  // waste_classification->wasteCharacteristics tables (sourceType,
  // internal_source_name, internal_treatment_name,
  // external_healthcare_facility_name, wasteCharacteristics.name) via
  // Op.like. Those joins aren't wired up yet (see header comment) — search
  // and sourceType filtering on this table's own columns is a no-op today,
  // left here as the integration point for when those joins land. Using
  // ILIKE (not LIKE) per convention once the join column is available.
  // e.g.: query = query.where("waste_source.internal_source_name", "ilike", `%${params.search}%`)

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  // Original default sort: ['updated_at', 'DESC'], with a fallback re-push
  // of the same order if sortBy differs — net effect for the two relational
  // sortBy values (wasteSourceName / wasteCharacteristicsName) is: primary
  // sort by the joined column, secondary tie-break by updated_at DESC. Those
  // joins aren't wired up (see header comment), so only the updated_at
  // fallback is actually implementable against this table alone right now.
  const rows = await query
    .selectAll()
    .orderBy("updated_at", "desc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  return {
    data: rows.map(toEntity),
    pagination: {
      total,
      pages: Math.ceil(total / params.limit),
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}

export async function create(payload: {
  createdBy: string;
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  labelCount: number;
}): Promise<QrCodeConfig> {
  // Mirrors the original: updated_by set to createdBy on create, not a
  // separately-supplied value (there isn't one at creation time).
  const row = await db
    .insertInto("qr_code_config")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      healthcare_facility_id: payload.healthcareFacilityId,
      waste_source_id: payload.wasteSourceId,
      waste_classification_id: payload.wasteClassificationId,
      label_count: payload.labelCount,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

export async function update(
  id: number,
  payload: {
    updatedBy: string;
    healthcareFacilityId: number;
    wasteSourceId: number;
    wasteClassificationId: number;
    labelCount: number;
  }
): Promise<QrCodeConfig | null> {
  const existing = await findById(id);
  if (!existing) return null;

  const row = await db
    .updateTable("qr_code_config")
    .set({
      updated_at: new Date(),
      updated_by: payload.updatedBy,
      healthcare_facility_id: payload.healthcareFacilityId,
      waste_source_id: payload.wasteSourceId,
      waste_classification_id: payload.wasteClassificationId,
      label_count: payload.labelCount,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function softDelete(id: number, deletedBy?: number): Promise<boolean> {
  const existing = await findById(id);
  if (!existing) return false;

  if (deletedBy) {
    await db.updateTable("qr_code_config").set({ deleted_by: deletedBy }).where("id", "=", id).execute();
  }
  await db
    .updateTable("qr_code_config")
    .set({ deleted_at: new Date() })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return true;
}
