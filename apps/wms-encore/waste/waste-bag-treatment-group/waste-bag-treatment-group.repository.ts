// Postgres columns for table `waste_treatment_group` (mirrors
// infrastructure/database/models/WasteBagTreatmentGroupModel.ts field-for-field
// — note the Sequelize model's exported *symbol* is
// `WasteBagTreatmentGroupModel`/`WasteBagTreatmentGroupModelAttributes` but its
// `tableName` option is `waste_treatment_group`, not `waste_bag_treatment_group`;
// this module's own folder name follows the route mount
// (`/waste-bag-treatment-group`) rather than the physical table name):
//
//   id                     bigint unsigned, auto-increment, primary key
//   created_by             varchar(36), not null
//   updated_by             varchar(36), not null
//   total_bags_count       integer, not null, default 1
//   total_weight_in_kgs    integer, not null
//   treatment_asset_id     integer, nullable
//   treatment_operator_id  integer, nullable
//   handover_lattitude     float(10,6), nullable  (sic — original model's spelling, not "latitude")
//   handover_longitude     float(10,6), nullable
//   treatment_status       enum('IN_TEMPORARY_STORAGE','IN_COLD_STORAGE',
//                          'INTERNAL_LANDFILL_IN_PROCESS','INTERNAL_LANDFILLED',
//                          'INCINERATION_IN_PROCESS','STERILIZATION_IN_PROCESS',
//                          'INCINERATED','STERILISED'), not null,
//                          default 'IN_TEMPORARY_STORAGE'
//   handover_timestamp     timestamp(3), nullable, default null
//   is_read_only           boolean, not null, default false
//   group_id               varchar(36), not null
//                          NOTE: the original model declares
//                          `defaultValue: false` for this STRING(36) column —
//                          a copy-paste bug from is_read_only's definition
//                          right above it in the same DataTypes.init() block.
//                          Documented, not reproduced (no default written here).
//   created_at             timestamp, not null
//   updated_at             timestamp, not null
//   deleted_at             timestamp, nullable (paranoid soft-delete)
//   deleted_by             bigint, nullable
//
// Joins against `waste_bag` (see WasteBagModel's hasMany/belongsTo pairing,
// association alias "wasteBags" on this model / "treatmentGroup" on
// waste_bag — waste-bag module is already ported, see
// ../waste-bag/waste-bag.repository.ts for its full column list):
//
//   waste_bag.waste_treatment_group_id -> waste_treatment_group.id
//
// getAllWasteTreatMentGroup's original Sequelize query additionally filters
// the joined waste_bag rows by healthcare_facility_id/transporter_id/
// third_party_id (Op.or, via `entityId`) and waste_status (via `status`), and
// requires at least one matching waste_bag (required: true -> INNER JOIN).
//
// getWasteBagTreatmentGroupByIdWithWasteBags additionally joins/enriches via
// (all wired up in waste-bag-treatment-group.service.ts, not here):
//   - waste_classification/waste_hierarchy for the wasteType/wasteGroup/
//     wasteCharacteristics summary and per-bag treatmentMethod.
//   - partnership.service.ts's
//     getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId.
//   - shared/storage/s3-client.ts's getPresignedUrl per bag's manifestDocPath.
//   - PartnerVehicleModel.findByPk(firstBag[0].transporterVehicleId) — the
//     original's own read here is dead code (transporterVehicleId doesn't
//     exist on waste_bag), so this is preserved as a permanently-null
//     lookup, not a real gap — see service.ts's comment at that line.
//   - getWasteBagLogHistory per bag (this repository's own function, called
//     from the service layer).
//
// getPendingWasteTreatmentGroups mirrors the original's raw SQL (kept as raw
// SQL here too, since it's a GROUP BY + aggregate-ordering query Kysely's
// query builder doesn't make meaningfully clearer): joins waste_treatment_group
// to waste_bag on wb.waste_treatment_group_id = wtg.id, filters
// wb.healthcare_facility_id = :healthcareFacilityId AND is_read_only = 0 AND
// treatment_status NOT IN ('IN_COLD_STORAGE','IN_TEMPORARY_STORAGE'), grouped
// by wtg.id, ordered by MAX(wb.updated_at) DESC. NOTE: `is_read_only = 0` is
// unqualified in the original SQL — given the JOIN, Postgres/MySQL both
// resolve it to whichever table's `is_read_only` column is unambiguous
// (only waste_treatment_group has one), so this is preserved as
// `wtg.is_read_only` here for clarity, same semantics.

import { sql } from "kysely";
import { db } from "../../db/db";
import { isValidDate } from "../../shared/utils/date-range";
import type {
  WasteTreatmentGroup,
  WasteTreatmentGroupSelectDto,
  PaginationMeta,
  TreatmentGroupStatus,
} from "./waste-bag-treatment-group.types";
import * as classificationRepo from "../waste-classification/waste-classification.repository";
import type { WasteClassification } from "../waste-classification/waste-classification.types";

// ---------------------------------------------------------------------------
// Enrichment helpers ported from apps/wms-service's shared utils
// (shared/utils/wasteClassificationSummary.ts, shared/utils/countProsessEvent.ts,
// shared/utils/wasteBagLogHistory.ts) — duplicated verbatim across this
// module and its two siblings (waste-treatment-external-group,
// waste-transport-external-group) rather than factored out, since this
// port's task boundary restricts each agent to its own module directory.
// See waste-treatment-external-group.repository.ts's copy for the full
// per-function commentary (shape/behavior is identical here).
// ---------------------------------------------------------------------------

export function buildBagWasteClassification(classification?: WasteClassification | null): Record<string, unknown> | undefined {
  if (!classification) return undefined;
  return {
    id: classification.id,
    regionId: classification.regionId,
    wasteCode: classification.wasteCode,
    wasteBagColorCode: classification.wasteBagColorCode,
    allowHealthcareFacilityTreatment: classification.allowHealthcareFacilityTreatment,
    isActive: classification.isActive,
    hasMultipleTransporters: classification.hasMultipleTransporters,
    storageRuleType: classification.storageRuleType,
    useColdStorage: classification.useColdStorage,
    coldStorageMinHours: classification.coldStorageMinHours,
    coldStorageMaxHours: classification.coldStorageMaxHours,
    tempStorageMinHours: classification.tempStorageMinHours,
    tempStorageMaxHours: classification.tempStorageMaxHours,
    storageRule: classification.storageRule,
    wasteCharacteristics: classification.wasteCharacteristics
      ? {
          id: classification.wasteCharacteristics.id,
          name: classification.wasteCharacteristics.name,
          isActive: true,
          nameEn: classification.wasteCharacteristics.nameEn,
        }
      : undefined,
  };
}

export function buildGroupWasteClassificationSummary(classifications: Array<WasteClassification | null | undefined>): {
  wasteType?: { id: number; name: string; nameEn: string };
  wasteGroup?: { id: number; name: string; nameEn: string };
  wasteCharacteristics: { id: number; name: string; isActive: boolean; nameEn: string }[];
} {
  const valid = classifications.filter((c): c is WasteClassification => Boolean(c));
  const first = valid[0];
  const wasteType = first?.wasteType
    ? { id: first.wasteType.id, name: first.wasteType.name, nameEn: first.wasteType.nameEn }
    : undefined;
  const wasteGroup = first?.wasteGroup
    ? { id: first.wasteGroup.id, name: first.wasteGroup.name, nameEn: first.wasteGroup.nameEn }
    : undefined;
  const seen = new Set<number>();
  const wasteCharacteristics = valid
    .map((c) => c.wasteCharacteristics)
    .filter((wc): wc is NonNullable<typeof wc> => Boolean(wc) && !seen.has(wc!.id) && seen.add(wc!.id) !== undefined)
    .map((wc) => ({ id: wc!.id, name: wc!.name, isActive: true, nameEn: wc!.nameEn }));
  return { wasteType, wasteGroup, wasteCharacteristics };
}

// Mirrors shared/utils/countProsessEvent.ts's handleAnalisisProcessCount,
// preserved verbatim (including the unused `status` parameter).
export function handleAnalisisProcessCount(
  disposal?: string,
  treatment?: string | null,
  isTreated?: boolean,
  groupsIds?: string | null,
  _status?: string
): string[] | undefined {
  const hasTreatment = !!treatment && treatment.trim() !== "";
  const disposalSet = new Set(disposal ? disposal.split(",").map((d) => d.trim()) : []);
  const treatmentSet = new Set(treatment ? treatment.split(",").map((d) => d.trim()) : []);

  if (!isTreated && treatmentSet.has("INTERNAL_LANDFILL") && treatmentSet.has("PYROLYSIS")) {
    return ["IN_TEMPORARY_STORAGE", "INCINERATED", "INTERNAL_LANDFILLED"];
  }
  if (!isTreated && treatmentSet.has("INTERNAL_LANDFILL") && !treatmentSet.has("PYROLYSIS")) {
    return ["IN_TEMPORARY_STORAGE", "INTERNAL_LANDFILLED"];
  }
  if (!hasTreatment && disposalSet.has("SPECIALIZED_TREATMENT_PROVIDER")) {
    return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "COLLECTED"];
  }
  if (!hasTreatment && disposalSet.has("TRANSPORTER_GOVERNMENT")) {
    return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "DISPOSED"];
  }
  if (!hasTreatment && disposalSet.has("TRANSPORTER_GOVERNMENT_WASTE_BANK")) {
    return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "READY_FOR_TREATMENT", "DISPOSED"];
  }
  if (hasTreatment && (disposalSet.has("TRANSPORTER_RECYCLER") || disposalSet.has("TRANSPORTER_LANDFILL"))) {
    if (treatmentSet.has("DISINFECTION") && disposalSet.has("TRANSPORTER_RECYCLER")) {
      return ["IN_TEMPORARY_STORAGE", "STERILISED", "IN_TRANSIT", "RECYCLED"];
    }
    if (treatmentSet.has("PYROLYSIS") && disposalSet.has("TRANSPORTER_LANDFILL") && isTreated && groupsIds && groupsIds.length > 0) {
      return ["IN_TEMPORARY_STORAGE", "INCINERATED", "IN_TRANSIT", "READY_FOR_TREATMENT", "LANDFILLED"];
    }
    if (treatmentSet.has("PYROLYSIS") && disposalSet.has("TRANSPORTER_LANDFILL") && !isTreated && !groupsIds) {
      return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "READY_FOR_TREATMENT", "LANDFILLED"];
    }
  }
  if (!hasTreatment && disposalSet.has("TRANSPORTER_RECYCLER") && isTreated && groupsIds && groupsIds.length > 0) {
    return ["IN_TEMPORARY_STORAGE", "STERILISED", "IN_TRANSIT", "RECYCLED"];
  }
  if (disposalSet.has("GOVERNMENT_WASTE_TRANSPORT")) {
    return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "READY_FOR_TREATMENT", "DISPOSED"];
  }
  if (!hasTreatment && disposalSet.has("TRANSPORTER_TREATMENT")) {
    return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "READY_FOR_TREATMENT", "LANDFILLED"];
  }
  if (hasTreatment && disposalSet.has("TRANSPORTER_TREATMENT")) {
    if (isTreated && groupsIds && groupsIds.length > 0) {
      if (treatmentSet.has("PYROLYSIS")) {
        return ["IN_TEMPORARY_STORAGE", "INCINERATED", "IN_TRANSIT", "READY_FOR_TREATMENT", "LANDFILLED"];
      }
      if (treatmentSet.has("DISINFECTION")) {
        return ["IN_TEMPORARY_STORAGE", "STERILISED", "IN_TRANSIT", "READY_FOR_TREATMENT", "RECYCLED"];
      }
    } else {
      if (treatmentSet.has("PYROLYSIS")) {
        return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "READY_FOR_TREATMENT", "LANDFILLED"];
      }
      if (treatmentSet.has("DISINFECTION")) {
        return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "READY_FOR_TREATMENT", "RECYCLED"];
      }
    }
  }
  return undefined;
}

// Mirrors shared/utils/wasteBagLogHistory.ts's getWasteBagLogHistory — see
// waste-treatment-external-group.repository.ts's copy for the
// waste_bag_qr_code vs. legacy waste_bag_id column note.
export async function getWasteBagLogHistory(
  wasteBagQrCodeId?: string
): Promise<Array<{ wasteStatus: string; wasteBagStatusUpdateDate: Date }>> {
  if (!wasteBagQrCodeId) return [];
  const rows = await db
    .selectFrom("waste_bag_audit_trail")
    .select(["waste_bag_status", "created_at"])
    .where("waste_bag_qr_code", "=", wasteBagQrCodeId)
    .where("is_group", "=", true)
    .orderBy("created_at", "asc")
    .execute();
  return rows.map((r) => ({ wasteStatus: r.waste_bag_status, wasteBagStatusUpdateDate: r.created_at }));
}

export { classificationRepo };

// Zod already validates `status` against ALLOWED_LISTING_STATUS_VALUES /
// TREATMENT_GROUP_STATUS_VALUES before these are called — this cast just
// tells Kysely the wire string is one of the enum's members, same pattern as
// asset-model.repository.ts's toAssetType helper.
function toTreatmentGroupStatus(value: string): TreatmentGroupStatus {
  return value as TreatmentGroupStatus;
}

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
  total_bags_count: number;
  total_weight_in_kgs: number;
  treatment_asset_id: number | null;
  treatment_operator_id: number | null;
  handover_lattitude: number | null;
  handover_longitude: number | null;
  treatment_status: string;
  handover_timestamp: Date | null;
  is_read_only: boolean;
  group_id: string;
}): WasteTreatmentGroup {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalBagsCount: row.total_bags_count,
    totalWeightInKgs: row.total_weight_in_kgs,
    treatmentAssetId: row.treatment_asset_id ?? undefined,
    treatmentOperatorId: row.treatment_operator_id ?? undefined,
    handoverLattitude: row.handover_lattitude ?? undefined,
    handoverLongitude: row.handover_longitude ?? undefined,
    treatmentStatus: toTreatmentGroupStatus(row.treatment_status),
    handoverTimestamp: row.handover_timestamp ?? undefined,
    isReadOnly: row.is_read_only,
    groupId: row.group_id,
  };
}

// Mirrors getWasteBagTreatmentGroupByIdWithWasteBags: `id` is only applied to
// the WHERE clause when truthy (original: `...(id && { id })`), so a
// missing/NaN id does NOT 404 — it falls through to matching the first row
// in whatever order Postgres returns (findOne with no ORDER BY), same
// behavior preserved here. `qrCodeId`, when present, requires (INNER JOIN)
// at least one associated waste_bag row with that waste_bag_qr_code_id;
// requires the JOIN (required: true) whenever qrCodeId is passed.
export interface TreatmentGroupBagRow {
  id: number;
  waste_bag_qr_code_id: string;
  waste_status: string;
  weight_in_kgs: number | null;
  created_at: Date;
  healthcare_facility_id: number;
  healthcare_facility_name: string | null;
  transporter_id: number | null;
  waste_classification_id: number;
  manifest_doc_number: string | null;
  manifest_doc_path: string | null;
  is_treated: boolean;
  waste_group_ids: string | null;
}

export async function findByIdWithWasteBags(params: {
  id?: number;
  qrCodeId?: string;
}): Promise<{ group: WasteTreatmentGroup; wasteBagRows: TreatmentGroupBagRow[] } | null> {
  let query = db.selectFrom("waste_treatment_group").selectAll("waste_treatment_group");

  if (params.id) {
    query = query.where("waste_treatment_group.id", "=", params.id);
  }

  if (params.qrCodeId) {
    query = query
      .innerJoin("waste_bag", "waste_bag.waste_treatment_group_id", "waste_treatment_group.id")
      .where("waste_bag.waste_bag_qr_code_id", "=", params.qrCodeId);
  }

  const row = await query.executeTakeFirst();
  if (!row) return null;

  const wasteBagRows = await db
    .selectFrom("waste_bag")
    .select([
      "id",
      "waste_bag_qr_code_id",
      "waste_status",
      "weight_in_kgs",
      "created_at",
      "healthcare_facility_id",
      "healthcare_facility_name",
      "transporter_id",
      "waste_classification_id",
      "manifest_doc_number",
      "manifest_doc_path",
      "is_treated",
      "waste_group_ids",
    ])
    .where("waste_treatment_group_id", "=", row.id)
    .execute();

  return { group: toEntity(row), wasteBagRows: wasteBagRows as unknown as TreatmentGroupBagRow[] };
}

// Mirrors getAllWasteTreatMentGroup: INNER JOINs waste_bag (required: true),
// optionally filtered by entityId (matches healthcare_facility_id OR
// transporter_id OR third_party_id on the waste_bag row) and/or status
// (waste_bag.waste_status), plus a created_at date-range filter on the GROUP
// row itself (end-of-day inclusive: endDate's day is advanced by 1, matched
// with `<`, mirroring `new Date(endDate).setDate(getDate()+1)` + Op.lt).
export async function findAllPaginated(params: {
  limit: number;
  page: number;
  entityId?: number;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}): Promise<{ data: WasteTreatmentGroup[]; pagination: PaginationMeta }> {
  let query = db
    .selectFrom("waste_treatment_group")
    .innerJoin("waste_bag", "waste_bag.waste_treatment_group_id", "waste_treatment_group.id");

  if (isValidDate(params.startDate) && isValidDate(params.endDate)) {
    const endExclusive = new Date(params.endDate);
    endExclusive.setDate(endExclusive.getDate() + 1);
    query = query
      .where("waste_treatment_group.created_at", ">=", params.startDate)
      .where("waste_treatment_group.created_at", "<", endExclusive);
  }

  if (params.entityId) {
    query = query.where((eb) =>
      eb.or([
        eb("waste_bag.healthcare_facility_id", "=", params.entityId!),
        eb("waste_bag.transporter_id", "=", params.entityId!),
        eb("waste_bag.third_party_id", "=", params.entityId!),
      ])
    );
  }

  if (params.status) {
    // waste_bag.waste_status is a Postgres enum column — cast to text for the
    // equality/ilike-style comparison, matching convention #5's guidance for
    // filtering enum columns (here an exact match, so a plain cast suffices).
    query = query.where(sql<boolean>`waste_bag.waste_status::text = ${params.status}`);
  }

  const countRow = await query
    .select((eb) => eb.fn.count<string>("waste_treatment_group.id").distinct().as("count"))
    .executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .select([
      "waste_treatment_group.id",
      "waste_treatment_group.created_by",
      "waste_treatment_group.updated_by",
      "waste_treatment_group.created_at",
      "waste_treatment_group.updated_at",
      "waste_treatment_group.total_bags_count",
      "waste_treatment_group.total_weight_in_kgs",
      "waste_treatment_group.treatment_asset_id",
      "waste_treatment_group.treatment_operator_id",
      "waste_treatment_group.handover_lattitude",
      "waste_treatment_group.handover_longitude",
      "waste_treatment_group.treatment_status",
      "waste_treatment_group.handover_timestamp",
      "waste_treatment_group.is_read_only",
      "waste_treatment_group.group_id",
    ])
    .distinct()
    .orderBy("waste_treatment_group.updated_at", "desc")
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

// Mirrors getPendingWasteTreatmentGroups's raw SQL exactly (see the header
// comment above for the `is_read_only = 0` qualification note).
export async function findPending(params: {
  limit: number;
  page: number;
  healthcareFacilityId: number;
}): Promise<{ data: WasteTreatmentGroupSelectDto[]; pagination: PaginationMeta }> {
  const countRow = await sql<{ total: string }>`
    SELECT COUNT(*) AS total FROM (
      SELECT wtg.id
      FROM waste_treatment_group wtg
      JOIN waste_bag wb ON wb.waste_treatment_group_id = wtg.id
      WHERE wb.healthcare_facility_id = ${params.healthcareFacilityId}
        AND wtg.is_read_only = false
        AND wtg.treatment_status NOT IN ('IN_COLD_STORAGE', 'IN_TEMPORARY_STORAGE')
      GROUP BY wtg.id
    ) AS sub
  `.execute(db);
  const total = Number(countRow.rows[0]?.total ?? 0);

  const dataRows = await sql<{ id: number; groupId: string }>`
    SELECT wtg.id, wtg.group_id AS "groupId"
    FROM waste_treatment_group wtg
    JOIN waste_bag wb ON wb.waste_treatment_group_id = wtg.id
    WHERE wb.healthcare_facility_id = ${params.healthcareFacilityId}
      AND wtg.is_read_only = false
      AND wtg.treatment_status NOT IN ('IN_COLD_STORAGE', 'IN_TEMPORARY_STORAGE')
    GROUP BY wtg.id, wtg.group_id
    ORDER BY MAX(wb.updated_at) DESC
    LIMIT ${params.limit} OFFSET ${(params.page - 1) * params.limit}
  `.execute(db);

  return {
    data: dataRows.rows.map((r) => ({ id: r.id, groupId: r.groupId })),
    pagination: {
      total,
      pages: Math.ceil(total / params.limit),
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}

// Mirrors WasteBagTreatmentGroupImpl.updateIsReadOnly: flips is_read_only on
// every waste_treatment_group row named in a comma-separated id list.
// Original uses MySQL's FIND_IN_SET; ported as a parsed-and-filtered id
// array with a plain `IN`.
export async function updateIsReadOnly(wasteGroupIds: string): Promise<void> {
  const ids = wasteGroupIds
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id));
  if (ids.length === 0) return;

  await db.updateTable("waste_treatment_group").set({ is_read_only: true }).where("id", "in", ids).execute();
}
