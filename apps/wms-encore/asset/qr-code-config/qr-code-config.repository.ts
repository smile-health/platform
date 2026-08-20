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

import { db } from "../db";
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
  // Joins waste_source (required, matching the original's `required: true`
  // include) and waste_classification -> waste_hierarchy (aliased
  // waste_characteristics via waste_characteristics_id) so search/sourceType
  // filtering and the two relational sortBy values can run against them.
  function withJoins<T extends typeof baseQuery>(q: T) {
    return q
      .innerJoin("waste_source", "waste_source.id", "qr_code_config.waste_source_id")
      .innerJoin("waste_classification", "waste_classification.id", "qr_code_config.waste_classification_id")
      .leftJoin(
        "waste_hierarchy as waste_characteristics",
        "waste_characteristics.id",
        "waste_classification.waste_characteristics_id"
      );
  }

  const baseQuery = db.selectFrom("qr_code_config").where("qr_code_config.deleted_at", "is", null);
  let query = withJoins(baseQuery);

  if (params.healthcareFacilityId !== undefined) {
    query = query.where("qr_code_config.healthcare_facility_id", "=", params.healthcareFacilityId);
  }
  if (params.sourceType) {
    query = query.where(
      "waste_source.source_type",
      "=",
      params.sourceType as "INTERNAL" | "EXTERNAL" | "INTERNAL_TREATMENT"
    );
  }
  if (params.search) {
    const term = `%${params.search}%`;
    query = query.where((eb) =>
      eb.or([
        eb("waste_source.internal_source_name", "ilike", term),
        eb(eb.cast("waste_source.internal_treatment_name", "text"), "ilike", term),
        eb("waste_source.external_healthcare_facility_name", "ilike", term),
        eb("waste_characteristics.name", "ilike", term),
      ])
    );
  }

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  // Original default sort: ['updated_at', 'DESC'], with a fallback re-push
  // of the same order if sortBy differs — net effect for the two relational
  // sortBy values is: primary sort by the joined column, secondary tie-break
  // by updated_at DESC.
  let sorted = query.selectAll("qr_code_config");
  const direction = params.sortOrder === "DESC" ? "desc" : "asc";
  if (params.sortBy === "wasteSourceName") {
    sorted = sorted.orderBy(
      (eb) =>
        eb.fn.coalesce(
          "waste_source.internal_source_name",
          eb.cast("waste_source.internal_treatment_name", "text"),
          "waste_source.external_healthcare_facility_name"
        ),
      direction
    );
  } else if (params.sortBy === "wasteCharacteristicsName") {
    sorted = sorted.orderBy("waste_characteristics.name", direction);
  }
  sorted = sorted.orderBy("qr_code_config.updated_at", "desc");

  const rows = await sorted
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
