// Postgres columns for table `waste_source` (mirrors
// infrastructure/database/models/WasteSourceModel.ts field-for-field):
//
//   id                                  integer, unsigned, auto-increment, primary key
//   created_by                         varchar(36), not null
//   updated_by                         varchar(36), not null
//   healthcare_facility_id             integer, unsigned, not null (FK -> entities.id — entities module already ported, see entity/entities/)
//   source_type                        enum('INTERNAL','EXTERNAL','INTERNAL_TREATMENT'), not null, default 'INTERNAL'
//   internal_source_name               varchar(64), nullable
//   internal_treatment_name            enum('PYROLYSIS','DISINFECTION'), nullable
//   external_healthcare_facility_id    integer, unsigned, nullable (also conceptually -> entities.id, no FK constraint in the original model)
//   external_healthcare_facility_name  varchar(64), nullable
//   is_active                          boolean, not null, default true
//   is_residue                         boolean, not null, default true
//   created_at                         timestamp, not null
//   updated_at                         timestamp, not null
//   deleted_at                         timestamp, nullable (paranoid soft-delete)
//   deleted_by                        bigint, nullable
//
// Referenced tables (existence-guards on delete only, mirrors
// DeleteWasteSource.ts's use-case, which checks these via
// WasteBagRepository.getWasteBagByWasteSourceId /
// WasteBagQrCodeRepository.getOneByWasteSourceId /
// QrCodeConfigRepository.getOneByWasteSourceId — all three are paranoid
// Sequelize models, so the checks implicitly filter deleted_at IS NULL):
//
//   waste_bag table:          id, waste_source_id, deleted_at (nullable)
//   waste_bag_qr_code table:  id, waste_source_id, deleted_at (nullable)
//   qr_code_config table:     id, waste_source_id, deleted_at (nullable) — already ported, see asset/qr-code-config/
//
// None of waste_bag / waste_bag_qr_code is ported yet, so the guard queries
// below reference tables that don't exist in the Kysely schema either —
// expect tsc errors there too, same as the waste_source table itself.

import { db } from "../db";
import { sql } from "kysely";
import type { WasteSource, PaginationMeta } from "./waste-source.types";

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string;
  healthcare_facility_id: number;
  source_type: string;
  internal_source_name: string | null;
  internal_treatment_name: string | null;
  external_healthcare_facility_id: number | null;
  external_healthcare_facility_name: string | null;
  is_active: boolean;
  is_residue: boolean;
  created_at: Date;
  updated_at: Date;
}): WasteSource {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    healthcareFacilityId: row.healthcare_facility_id,
    sourceType: row.source_type,
    internalSourceName: row.internal_source_name ?? undefined,
    internalTreatmentName: row.internal_treatment_name ?? undefined,
    externalHealthcareFacilityId: row.external_healthcare_facility_id ?? undefined,
    externalHealthcareFacilityName: row.external_healthcare_facility_name ?? undefined,
    isActive: row.is_active,
    isResidue: row.is_residue,
  };
}

// Zod already validates sourceType/internalTreatmentName against their enums
// before these are called (see waste-source.schema.ts) — these casts just
// tell Kysely the wire string is one of the enum's members, same pattern as
// asset-model.repository.ts's toAssetType helper.
function toSourceType(value: string): "INTERNAL" | "EXTERNAL" | "INTERNAL_TREATMENT" {
  return value as "INTERNAL" | "EXTERNAL" | "INTERNAL_TREATMENT";
}
function toInternalTreatmentName(value: string | undefined): "PYROLYSIS" | "DISINFECTION" | null {
  return (value ?? null) as "PYROLYSIS" | "DISINFECTION" | null;
}

export async function findById(id: number): Promise<WasteSource | null> {
  const row = await db
    .selectFrom("waste_source")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors WasteSourceRepositoryImpl.checkDuplication: only meaningful for
// sourceType === 'INTERNAL_TREATMENT' — checked at the call site
// (waste-source.service.ts), same as the original use-case.
export async function checkDuplication(params: {
  healthcareFacilityId: number;
  internalTreatmentName?: string;
}): Promise<boolean> {
  const row = await db
    .selectFrom("waste_source")
    .select("id")
    .where("source_type", "=", "INTERNAL_TREATMENT")
    .where("healthcare_facility_id", "=", params.healthcareFacilityId)
    .where("internal_treatment_name", "=", toInternalTreatmentName(params.internalTreatmentName))
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  // Original returns `false` (i.e. "duplicate found") when a row exists,
  // `true` ("no duplicate") otherwise — preserved verbatim (inverted-sounding
  // name notwithstanding).
  return !row;
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  healthcareFacilityId: number;
  search?: string;
  sourceType?: string;
}): Promise<{ data: WasteSource[]; pagination: PaginationMeta }> {
  let query = db
    .selectFrom("waste_source")
    .where("deleted_at", "is", null)
    .where("healthcare_facility_id", "=", params.healthcareFacilityId);

  if (params.search) {
    // Original uses Op.or across internalTreatmentName /
    // externalHealthcareFacilityName / internalSourceName with Op.like
    // (MySQL, case-insensitive by default there); ported to Postgres ILIKE
    // per convention for equivalent case-insensitive search.
    const term = `%${params.search}%`;
    query = query.where((eb) =>
      eb.or([
        sql<boolean>`internal_treatment_name::text ilike ${term}`,
        eb("external_healthcare_facility_name", "ilike", term),
        eb("internal_source_name", "ilike", term),
      ])
    );
  }

  if (params.sourceType) {
    // Original builds this filter as a raw `source_type: sourceType` key
    // inside the Sequelize `where` object (not `Op`-namespaced, unlike the
    // camelCase attribute filters above) — Sequelize still maps it to the
    // `source_type` column correctly since it matches the underlying field
    // name. Equivalent here as a plain equality filter.
    query = query.where("source_type", "=", toSourceType(params.sourceType));
  }

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

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
  sourceType: string;
  internalSourceName?: string;
  internalTreatmentName?: string;
  externalHealthcareFacilityId?: number;
  externalHealthcareFacilityName?: string;
  isActive: boolean;
  isResidue: boolean;
}): Promise<WasteSource> {
  // Mirrors the original: updated_by set to createdBy on create, not a
  // separately-supplied value (there isn't one at creation time).
  const row = await db
    .insertInto("waste_source")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      healthcare_facility_id: payload.healthcareFacilityId,
      source_type: toSourceType(payload.sourceType),
      internal_source_name: payload.internalSourceName ?? null,
      internal_treatment_name: toInternalTreatmentName(payload.internalTreatmentName),
      external_healthcare_facility_id: payload.externalHealthcareFacilityId ?? null,
      external_healthcare_facility_name: payload.externalHealthcareFacilityName ?? null,
      is_active: payload.isActive,
      is_residue: payload.isResidue,
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
    sourceType: string;
    internalSourceName?: string;
    internalTreatmentName?: string;
    externalHealthcareFacilityId?: number;
    externalHealthcareFacilityName?: string;
    isActive: boolean;
  }
): Promise<WasteSource | null> {
  const existing = await findById(id);
  if (!existing) return null;

  const row = await db
    .updateTable("waste_source")
    .set({
      updated_at: new Date(),
      updated_by: payload.updatedBy,
      healthcare_facility_id: payload.healthcareFacilityId,
      source_type: toSourceType(payload.sourceType),
      internal_source_name: payload.internalSourceName ?? null,
      internal_treatment_name: toInternalTreatmentName(payload.internalTreatmentName),
      external_healthcare_facility_id: payload.externalHealthcareFacilityId ?? null,
      external_healthcare_facility_name: payload.externalHealthcareFacilityName ?? null,
      is_active: payload.isActive,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function updateIsActive(id: number, isActive: boolean): Promise<WasteSource | null> {
  const existing = await findById(id);
  if (!existing) return null;

  const row = await db
    .updateTable("waste_source")
    .set({ updated_at: new Date(), is_active: isActive })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Existence guards mirroring DeleteWasteSource.ts's three checks, in order.
export async function existsWasteBagByWasteSourceId(id: number): Promise<boolean> {
  const row = await db
    .selectFrom("waste_bag")
    .select("id")
    .where("waste_source_id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return !!row;
}

export async function existsWasteBagQrCodeByWasteSourceId(id: number): Promise<boolean> {
  const row = await db
    .selectFrom("waste_bag_qr_code")
    .select("id")
    .where("waste_source_id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return !!row;
}

export async function existsQrCodeConfigByWasteSourceId(id: number): Promise<boolean> {
  const row = await db
    .selectFrom("qr_code_config")
    .select("id")
    .where("waste_source_id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return !!row;
}

export async function softDelete(id: number, deletedBy?: number): Promise<boolean> {
  const existing = await findById(id);
  if (!existing) return false;

  await db
    .updateTable("waste_source")
    .set({ deleted_at: new Date(), deleted_by: deletedBy ?? null })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return true;
}
