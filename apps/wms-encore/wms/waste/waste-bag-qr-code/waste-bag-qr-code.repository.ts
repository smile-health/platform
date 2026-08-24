// Postgres columns for table `waste_bag_qr_code` (mirrors
// infrastructure/database/models/WasteBagQrCodeModel.ts field-for-field):
//
//   id                        bigint, unsigned, auto-increment, primary key
//   created_by                varchar(36), not null
//   healthcare_facility_id    bigint, unsigned, nullable
//   waste_classification_id   bigint, unsigned, nullable
//   waste_source_id           bigint, unsigned, nullable
//   qr_code                   bigint, unsigned, not null  <- yes, the Sequelize
//                              model types this column BIGINT.UNSIGNED even
//                              though every real value written to it
//                              (`${newIdDigit}${formattedDate}`, e.g.
//                              "0001" + "10082026") is a zero-padded numeric
//                              STRING. Preserved verbatim; treat as text at
//                              the Kysely layer (the DB column itself may
//                              actually be numeric/bigint — reconcile against
//                              the live schema at integration time).
//   created_at                timestamp, not null, default now()
//   deleted_at                timestamp, nullable (paranoid soft-delete)
//   deleted_by                bigint, nullable
//   -- no updated_at column (timestamps: true but updatedAt: false in the model)
//
// Joined tables referenced by the original (owned by other modules, not this
// one — documented here only for integration):
//   waste_source            (FK waste_bag_qr_code.waste_source_id -> id)
//     id, healthcare_facility_id, source_type ('INTERNAL'|'EXTERNAL'|
//     'INTERNAL_TREATMENT'), internal_source_name, internal_treatment_name,
//     external_healthcare_facility_id, external_healthcare_facility_name,
//     is_active, is_residue, created_by, updated_by, deleted_at, deleted_by
//   waste_classification     (FK waste_bag_qr_code.waste_classification_id -> id)
//     id, region_id, effective_from, effective_to, waste_type_id,
//     waste_group_id, waste_characteristics_id, waste_code,
//     waste_bag_color_code, storage_rule_type, use_cold_storage,
//     cold_storage_min_hours, cold_storage_max_hours, temp_storage_min_hours,
//     temp_storage_max_hours, minimun_decay_day [sic], storage_rule,
//     allow_healthcare_facility_treatment, is_active, has_multiple_transporters,
//     treatment_method, disposal_method, allowed_vehicle_types, updated_at,
//     deleted_at, deleted_by
//   waste_bag                (looked up by waste_bag.waste_bag_qr_code_id,
//                              which stores the *qr_code string value*, not a
//                              numeric FK to waste_bag_qr_code.id)
//     id, waste_bag_qr_code_id, scheduled_storage_end_datetime,
//     waste_classification_id (joined again here for minimun_decay_day)
//
// getWasteBagQrCodeById's business rule (ported into the service layer):
// look up waste_bag by waste_bag_qr_code_id = qrCode; if found and its waste
// classification's minimun_decay_day is falsy -> 'ALREADY_REGISTERED'; else if
// today (Asia/Jakarta) < that waste_bag's scheduled_storage_end_datetime (also
// Asia/Jakarta) -> 'RADIOACTIVE_STILL_IN_STORAGE'.

import { db } from "../db";
import type { PaginationMeta, WasteBagQrCode } from "./waste-bag-qr-code.types";

interface WasteBagQrCodeRow {
  id: number;
  created_by: string;
  healthcare_facility_id: number | null;
  waste_classification_id: number | null;
  waste_source_id: number | null;
  qr_code: string;
  created_at: Date;
}

function toEntity(row: WasteBagQrCodeRow): WasteBagQrCode {
  return {
    id: row.id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    healthcareFacilityId: row.healthcare_facility_id ?? 0,
    wasteSourceId: row.waste_source_id ?? undefined,
    wasteClassificationId: row.waste_classification_id ?? undefined,
    qrCode: row.qr_code,
  };
}

// Scoped by qrCode + healthcareFacilityId, matching the original's
// `WHERE qr_code = :id AND healthcare_facility_id = :entityId` (see
// waste-bag-qr-code.types.ts's GetWasteBagQrCodeByIdRequest note — `qrCode`
// here is what the route calls `id`).
export async function findByQrCode(
  qrCode: string,
  healthcareFacilityId: number
): Promise<WasteBagQrCode | null> {
  const row = await db
    .selectFrom("waste_bag_qr_code")
    .selectAll()
    .where("qr_code", "=", qrCode)
    .where("healthcare_facility_id", "=", healthcareFacilityId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Used by the not-found/already-registered/radioactive checks — looks up the
// waste_bag row (owned by the waste-bag module) by its waste_bag_qr_code_id
// text column, joined to waste_classification for minimun_decay_day.
export async function findWasteBagByQrCode(qrCode: string): Promise<{
  scheduledStorageEndDatetime: Date | null;
  minimunDecayDay: number | null;
} | null> {
  const row = await db
    .selectFrom("waste_bag")
    .leftJoin("waste_classification", "waste_classification.id", "waste_bag.waste_classification_id")
    .select([
      "waste_bag.scheduled_storage_end_datetime as scheduled_storage_end_datetime",
      "waste_classification.minimun_decay_day as minimun_decay_day",
    ])
    .where("waste_bag.waste_bag_qr_code_id", "=", qrCode)
    .executeTakeFirst();
  if (!row) return null;
  return {
    scheduledStorageEndDatetime: row.scheduled_storage_end_datetime ?? null,
    minimunDecayDay: row.minimun_decay_day ?? null,
  };
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  healthcareFacilityId: number;
}): Promise<{ data: WasteBagQrCode[]; pagination: PaginationMeta }> {
  const query = db
    .selectFrom("waste_bag_qr_code")
    .where("healthcare_facility_id", "=", params.healthcareFacilityId)
    .where("deleted_at", "is", null);

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .selectAll()
    .orderBy("created_at", "desc")
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
  wasteSourceId?: number;
  wasteClassificationId?: number;
  qrCode: string;
}): Promise<WasteBagQrCode> {
  const row = await db
    .insertInto("waste_bag_qr_code")
    .values({
      created_by: payload.createdBy,
      healthcare_facility_id: payload.healthcareFacilityId,
      waste_source_id: payload.wasteSourceId ?? null,
      waste_classification_id: payload.wasteClassificationId ?? null,
      qr_code: payload.qrCode,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

// Mirrors getWasteBagQrCodeAfterCreateByIds — only id/qrCode (+ joined
// wasteSource/wasteClassification summaries, out of scope here) are selected
// in the original.
export async function findByIds(ids: number[]): Promise<WasteBagQrCode[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .selectFrom("waste_bag_qr_code")
    .select(["id", "qr_code"])
    .where("id", "in", ids)
    .execute();
  return rows.map((row) => ({
    id: row.id,
    qrCode: row.qr_code,
    healthcareFacilityId: 0,
  }));
}

// Mirrors updateWasteBagQrCode — the caller resolves the numeric `id` (the
// existing row found via findByQrCode) before calling this; there's no
// updated_at column to bump (see column notes above).
export async function updateById(
  id: number,
  payload: {
    healthcareFacilityId: number;
    wasteSourceId?: number;
    wasteClassificationId?: number;
    qrCode: string;
  }
): Promise<void> {
  await db
    .updateTable("waste_bag_qr_code")
    .set({
      healthcare_facility_id: payload.healthcareFacilityId,
      waste_source_id: payload.wasteSourceId ?? null,
      waste_classification_id: payload.wasteClassificationId ?? null,
      qr_code: payload.qrCode,
    })
    .where("id", "=", id)
    .execute();
}

// Mirrors deleteWasteBagQrCode — findByPk(id) by the numeric PK (NOT qrCode,
// see waste-bag-qr-code.types.ts's DeleteWasteBagQrCodeRequest note).
export async function findById(id: number): Promise<WasteBagQrCode | null> {
  const row = await db
    .selectFrom("waste_bag_qr_code")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Cross-module existence checks (waste_source / waste_classification are
// owned by other modules — these mirror the original's
// wasteSourceRepository.getWasteSourceById() / getExistingIds() /
// wasteClassificationRepository.getWasteClassificationById() calls without
// depending on those modules' service code).
export async function existingWasteSourceIds(ids: number[]): Promise<Set<number>> {
  if (ids.length === 0) return new Set();
  const rows = await db.selectFrom("waste_source").select(["id"]).where("id", "in", ids).execute();
  return new Set(rows.map((row) => row.id));
}

export async function existingWasteClassificationIds(ids: number[]): Promise<Set<number>> {
  if (ids.length === 0) return new Set();
  const rows = await db
    .selectFrom("waste_classification")
    .select(["id"])
    .where("id", "in", ids)
    .execute();
  return new Set(rows.map((row) => row.id));
}

export async function softDeleteById(id: number, deletedBy?: number): Promise<boolean> {
  const existing = await findById(id);
  if (!existing) return false;

  await db
    .updateTable("waste_bag_qr_code")
    .set({ deleted_at: new Date(), deleted_by: deletedBy ?? null })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return true;
}
