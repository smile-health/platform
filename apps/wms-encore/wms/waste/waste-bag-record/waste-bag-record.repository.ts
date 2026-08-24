// Postgres columns for table `waste_bag_record` (mirrors
// infrastructure/database/models/WasteBagRecordModel.ts field-for-field):
//
//   id                                     bigint, unsigned, auto-increment, primary key
//   created_by                             varchar(36), not null
//   created_at                             timestamp, not null, default now()
//   updated_at                             timestamp, nullable
//   updated_by                             varchar(36), nullable
//   waste_bag_qr_code_id                   varchar(255), not null, UNIQUE (waste_bag_qr_code_id)
//   healthcare_facility_id                 bigint, unsigned, not null
//   waste_source_id                        bigint, unsigned, not null
//   waste_classification_id                bigint, unsigned, not null
//   source_treatment_group_id              varchar(255), nullable
//   scale_method                           enum('IOT','MANUAL'), not null, default 'IOT'
//   asset_id                               bigint, unsigned, nullable
//   weight_in_kgs                          decimal(10,2), nullable
//   storage_start_timestamp                timestamp, nullable
//   scheduled_storage_end_datetime         timestamp, nullable
//   actual_storage_end_timestamp           timestamp, nullable
//   max_storage_hours                      integer, nullable
//   min_storage_hours                      integer, nullable
//   waste_treatment_group_id               bigint, nullable
//   waste_transportation_group_id          bigint, nullable
//   waste_treatment_external_group_id      integer, nullable
//   waste_transportation_external_group_id integer, nullable
//   waste_status                           enum(...17 values, see toWasteStatus below), not null, default 'IN_TEMPORARY_STORAGE'
//   waste_status_updated_at                timestamp, nullable, default now()
//   waste_status_updated_by                varchar(36), nullable
//   transportation_status                  enum('REQUESTED','IN_TRANSIT','HANDED_OVER'), nullable
//   transportation_status_updated_at       timestamp, nullable, default now()
//   transportation_status_updated_by       varchar(36), nullable
//   owned_by                               enum('HEALTHCARE_FACILITY','TRANSPORTER','THIRD_PARTY'), not null, default 'HEALTHCARE_FACILITY'
//   transporter_id                         bigint, unsigned, nullable
//   third_party_id                         bigint, unsigned, nullable
//   is_treated                             boolean, not null, default false
//   is_disposed                            boolean, not null, default false
//   bin_number                             varchar(50), nullable
//   iot_method                             enum('BLUETOOTH','INTERNET'), nullable
//   manifest_doc_number                    varchar(50), nullable
//   manifest_doc_path                      text, nullable
//   treatment_start_time                   timestamp, nullable
//   treatment_end_time                     timestamp, nullable
//   waste_group_ids                        varchar(255), nullable
//   treatment_location_id                  bigint, unsigned, nullable
//   healthcare_facility_name               varchar(255), nullable
//   province_id                            bigint, unsigned, nullable
//   province_name                          varchar(255), nullable
//   regency_id                             bigint, unsigned, nullable
//   regency_name                           varchar(255), nullable
//   district_id                            bigint, unsigned, nullable
//   district_name                          varchar(255), nullable
//   transporter_name                       varchar(255), nullable
//   third_party_name                       varchar(255), nullable
//   bast_no                                varchar(100), nullable
//   material_ids                           varchar(64), nullable
//   deleted_at                             timestamp, nullable (paranoid soft-delete)
//   deleted_by                             bigint, nullable
//
// waste_status enum values (17): INTERNAL_LANDFILL_IN_PROCESS, INTERNAL_LANDFILLED,
//   IN_TEMPORARY_STORAGE, IN_COLD_STORAGE, INCINERATION_IN_PROCESS,
//   STERILIZATION_IN_PROCESS, INCINERATED, STERILISED, READY_FOR_TRANSPORT,
//   TRANSPORTATION_REQUEST_CREATED, IN_TRANSIT, READY_FOR_TREATMENT,
//   STORED_FOR_TREATMENT, RECYCLED, LANDFILLED, COLLECTED, DISPOSED.
//   (Note: the domain entity's TS union additionally lists HANDOVER_TO_TREATMENT
//   and IN_THIRD_PARTY_STORAGE, which are NOT in the Sequelize model's actual
//   DB enum — a pre-existing mismatch in the original left undisturbed here.)
//
// getAllWasteBagRecord (list/filter endpoint) joins against:
//   waste_source            (alias "wasteSource"), filtered by source_type = sourceType
//   waste_classification    (alias "wasteClassification")
//   waste_hierarchy (x3 aliases via waste_classification: waste_type_id -> "wasteType",
//                     waste_group_id -> "wasteGroup", waste_characteristics_id -> "wasteCharacteristics")
//     search filters ILIKE against waste_hierarchy.name for the "wasteCharacteristics" alias join.
// These joins ARE now wired — see findAllFilteredWithClassification below,
// used by service.ts's getAllWasteBagRecord. findAllFiltered (the
// no-join version) is kept as-is for callers that don't need the names.
//
// createWasteBagRecord also calls an external HTTP client (getEntityDetail)
// to populate healthcare_facility_name/province_id/province_name/regency_id/
// regency_name/district_id/district_name at insert time — not a DB read.
// waste-bag-record.service.ts's createWasteBagRecord now populates all of
// these from the local `entities` + `regions` tables (see
// shared/core/entity-region-lookup.ts for the id-to-name resolution).

import { sql } from "kysely";
import { db } from "../db";
import type { WasteBagRecord } from "./waste-bag-record.types";

// See asset-model.repository.ts's toAssetType helper for the pattern this follows.
type ScaleMethod = "MANUAL" | "IOT";
function toScaleMethod(v: string): ScaleMethod {
  return v as ScaleMethod;
}

type OwnedBy = "HEALTHCARE_FACILITY" | "TRANSPORTER" | "THIRD_PARTY";
function toOwnedBy(v: string): OwnedBy {
  return v as OwnedBy;
}

type WasteStatus =
  | "INTERNAL_LANDFILL_IN_PROCESS"
  | "INTERNAL_LANDFILLED"
  | "IN_TEMPORARY_STORAGE"
  | "IN_COLD_STORAGE"
  | "INCINERATION_IN_PROCESS"
  | "STERILIZATION_IN_PROCESS"
  | "INCINERATED"
  | "STERILISED"
  | "READY_FOR_TRANSPORT"
  | "TRANSPORTATION_REQUEST_CREATED"
  | "IN_TRANSIT"
  | "READY_FOR_TREATMENT"
  | "STORED_FOR_TREATMENT"
  | "RECYCLED"
  | "LANDFILLED"
  | "COLLECTED"
  | "DISPOSED";
function toWasteStatus(v: string): WasteStatus {
  return v as WasteStatus;
}

function toEntity(row: {
  id: number;
  created_by: string;
  created_at: Date;
  updated_at: Date | null;
  updated_by: string | null;
  waste_bag_qr_code_id: string;
  healthcare_facility_id: number;
  waste_source_id: number;
  waste_classification_id: number;
  source_treatment_group_id: string | null;
  scale_method: string;
  asset_id: number | null;
  weight_in_kgs: string | number | null;
  storage_start_timestamp: Date | null;
  scheduled_storage_end_datetime: Date | null;
  actual_storage_end_timestamp: Date | null;
  max_storage_hours: number | null;
  min_storage_hours: number | null;
  waste_treatment_group_id: number | null;
  waste_transportation_group_id: number | null;
  waste_treatment_external_group_id: number | null;
  waste_transportation_external_group_id: number | null;
  waste_status: string;
  waste_status_updated_at: Date | null;
  waste_status_updated_by: string | null;
  transportation_status: string | null;
  transportation_status_updated_at: Date | null;
  transportation_status_updated_by: string | null;
  owned_by: string;
  transporter_id: number | null;
  third_party_id: number | null;
  is_treated: boolean;
  is_disposed: boolean;
  bin_number: string | null;
  iot_method: string | null;
  manifest_doc_number: string | null;
  manifest_doc_path: string | null;
  treatment_start_time: Date | null;
  treatment_end_time: Date | null;
  waste_group_ids: string | null;
  treatment_location_id: number | null;
  bast_no: string | null;
  material_ids: string | null;
}): WasteBagRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    updatedAt: row.updated_at ?? undefined,
    updatedBy: row.updated_by ?? undefined,
    wasteBagQrCodeId: row.waste_bag_qr_code_id,
    healthcareFacilityId: row.healthcare_facility_id,
    wasteSourceId: row.waste_source_id,
    wasteClassificationId: row.waste_classification_id,
    sourceTreatmentGroupId: row.source_treatment_group_id ?? undefined,
    scaleMethod: row.scale_method,
    assetId: row.asset_id ?? undefined,
    weightInKgs: row.weight_in_kgs != null ? Number(row.weight_in_kgs) : undefined,
    storageStartTimestamp: row.storage_start_timestamp ?? undefined,
    scheduledStorageEndDatetime: row.scheduled_storage_end_datetime ?? undefined,
    actualStorageEndDatetime: row.actual_storage_end_timestamp ?? undefined,
    maxStorageHours: row.max_storage_hours ?? undefined,
    minimumStorageHours: row.min_storage_hours ?? undefined,
    wasteTreatmentGroupId: row.waste_treatment_group_id ?? undefined,
    wasteTransportationGroupId: row.waste_transportation_group_id ?? undefined,
    wasteTreatmentExternalGroupId: row.waste_treatment_external_group_id ?? undefined,
    wasteTransportationExternalGroupId: row.waste_transportation_external_group_id ?? undefined,
    wasteStatus: row.waste_status,
    wasteStatusUpdatedAt: row.waste_status_updated_at ?? undefined,
    wasteStatusUpdatedBy: row.waste_status_updated_by ?? undefined,
    transportationStatus: row.transportation_status ?? undefined,
    transportationStatusUpdatedAt: row.transportation_status_updated_at ?? undefined,
    transportationStatusUpdatedBy: row.transportation_status_updated_by ?? undefined,
    ownedBy: row.owned_by,
    transporterId: row.transporter_id ?? undefined,
    thirdPartyId: row.third_party_id ?? undefined,
    isTreated: row.is_treated,
    isDisposed: row.is_disposed,
    binNumber: row.bin_number ?? undefined,
    iotMethod: row.iot_method ?? undefined,
    manifestDocNumber: row.manifest_doc_number ?? undefined,
    manifestDocPath: row.manifest_doc_path ?? undefined,
    treatmentStartTime: row.treatment_start_time ?? undefined,
    treatmentEndTime: row.treatment_end_time ?? undefined,
    wasteGroupIds: row.waste_group_ids ?? undefined,
    treatmentLocationId: row.treatment_location_id ?? undefined,
    bastNo: row.bast_no ?? undefined,
    materialIds: row.material_ids ?? undefined,
  };
}

export async function findById(id: number): Promise<WasteBagRecord | null> {
  const row = await db
    .selectFrom("waste_bag_record")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export interface FindAllFilters {
  entityTag?: string;
  entityId?: number;
  search?: string;
  wasteClassificationId?: number[];
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  transportationGroupId?: number;
  transportationExternalGroupId?: number;
  treatmentGroupId?: number;
  treatmentExternalGroupId?: number;
  ownedBy?: string;
  wasteStatus?: string; // comma-separated list, split by caller
  isTreated?: boolean;
  isDisposed?: boolean;
  binNumber?: string;
  wasteBagQrCodeId?: string;
  id?: number;
  sourceType?: string;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
}

// Row shape returned by findAllFilteredWithClassification: a WasteBagRecord
// plus the wasteType/wasteGroup/wasteCharacteristics names the original's
// getAllWasteBagRecord reads off `r.wasteClassification?.wasteType?.name`
// etc (falling back to 'Unknown' in the service layer when the joined
// hierarchy row's name is missing, matching the original's `|| 'Unknown'`).
export interface WasteBagRecordWithClassificationNames extends WasteBagRecord {
  wasteTypeName: string | null;
  wasteGroupName: string | null;
  wasteCharacteristicsName: string | null;
}

// Mirrors WasteBagRecordRepositoryImpl.getAllWasteBagRecord's row-level
// filtering AND its required (`required: true`) joins to waste_source (with
// an inner where on source_type when sourceType is given),
// waste_classification, and waste_hierarchy x3 (waste_type / waste_group /
// waste_characteristics aliases), including the `search` filter's ILIKE
// against the waste_characteristics hierarchy row's name and the
// wasteTypeId/wasteGroupId/wasteCharacteristicsId exact-id filters scoped to
// their respective joined hierarchy row. Every join is a plain INNER JOIN
// (not left) to mirror `required: true` — a waste_bag_record row with no
// matching waste_source/waste_classification/hierarchy row is excluded
// entirely, same as the original. All the row-level filters below duplicate
// findAllFiltered's own (column names are qualified with `waste_bag_record.`
// here since they'd otherwise be ambiguous across the joined tables).
export async function findAllFilteredWithClassification(
  filters: FindAllFilters
): Promise<WasteBagRecordWithClassificationNames[]> {
  let query = db
    .selectFrom("waste_bag_record")
    .innerJoin("waste_source", "waste_source.id", "waste_bag_record.waste_source_id")
    .innerJoin("waste_classification", "waste_classification.id", "waste_bag_record.waste_classification_id")
    .innerJoin("waste_hierarchy as waste_type", "waste_type.id", "waste_classification.waste_type_id")
    .innerJoin("waste_hierarchy as waste_group", "waste_group.id", "waste_classification.waste_group_id")
    .innerJoin(
      "waste_hierarchy as waste_characteristics",
      "waste_characteristics.id",
      "waste_classification.waste_characteristics_id"
    )
    .where("waste_bag_record.deleted_at", "is", null);

  if (filters.sourceType) {
    query = query.where("waste_source.source_type", "=", filters.sourceType as any);
  }
  if (filters.wasteTypeId) {
    query = query.where("waste_type.id", "=", filters.wasteTypeId);
  }
  if (filters.wasteGroupId) {
    query = query.where("waste_group.id", "=", filters.wasteGroupId);
  }
  if (filters.wasteCharacteristicsId) {
    query = query.where("waste_characteristics.id", "=", filters.wasteCharacteristicsId);
  }
  if (filters.search) {
    query = query.where("waste_characteristics.name", "ilike", `%${filters.search}%`);
  }

  if (filters.entityTag?.toLowerCase().includes("hospital")) {
    query = query.where("waste_bag_record.healthcare_facility_id", "=", filters.entityId ?? -1);
  } else if (filters.entityTag) {
    query = query.where((eb) =>
      eb.or([
        eb("waste_bag_record.third_party_id", "=", filters.entityId ?? -1),
        eb("waste_bag_record.transporter_id", "=", filters.entityId ?? -1),
      ])
    );
  }
  if (filters.wasteClassificationId && filters.wasteClassificationId.length > 0) {
    query = query.where("waste_bag_record.waste_classification_id", "in", filters.wasteClassificationId);
  }
  if (filters.wasteUpdateStart && filters.wasteUpdateEnd) {
    query = query
      .where("waste_bag_record.created_at", ">=", new Date(`${filters.wasteUpdateStart} 00:00:00`))
      .where("waste_bag_record.created_at", "<=", new Date(`${filters.wasteUpdateEnd} 23:59:59`));
  }
  if (filters.transportationGroupId) {
    query = query.where("waste_bag_record.waste_transportation_group_id", "=", filters.transportationGroupId);
  }
  if (filters.transportationExternalGroupId) {
    query = query.where(
      "waste_bag_record.waste_transportation_external_group_id",
      "=",
      filters.transportationExternalGroupId
    );
  }
  if (filters.treatmentGroupId) {
    query = query.where("waste_bag_record.waste_treatment_group_id", "=", filters.treatmentGroupId);
  }
  if (filters.treatmentExternalGroupId) {
    query = query.where(
      "waste_bag_record.waste_treatment_external_group_id",
      "=",
      filters.treatmentExternalGroupId
    );
  }
  if (filters.ownedBy) {
    query = query.where("waste_bag_record.owned_by", "=", toOwnedBy(filters.ownedBy));
  }
  if (filters.wasteStatus) {
    query = query.where(
      "waste_bag_record.waste_status",
      "in",
      filters.wasteStatus.split(",").map((s) => toWasteStatus(s))
    );
  }
  if (filters.isTreated) {
    query = query.where("waste_bag_record.is_treated", "=", filters.isTreated);
  }
  if (filters.isDisposed) {
    query = query.where("waste_bag_record.is_disposed", "=", filters.isDisposed);
  }
  if (filters.binNumber) {
    query = query.where("waste_bag_record.bin_number", "=", filters.binNumber);
  }
  if (filters.wasteBagQrCodeId) {
    query = query.where("waste_bag_record.waste_bag_qr_code_id", "=", filters.wasteBagQrCodeId);
  }
  if (filters.id) {
    query = query.where("waste_bag_record.id", "=", filters.id);
  }

  const rows = await query
    .selectAll("waste_bag_record")
    .select([
      "waste_type.name as waste_type_name",
      "waste_group.name as waste_group_name",
      "waste_characteristics.name as waste_characteristics_name",
    ])
    .orderBy("waste_bag_record.created_at", "desc")
    .execute();

  return rows.map((row) => ({
    ...toEntity(row as any),
    wasteTypeName: row.waste_type_name ?? null,
    wasteGroupName: row.waste_group_name ?? null,
    wasteCharacteristicsName: row.waste_characteristics_name ?? null,
  }));
}

export async function create(payload: {
  createdBy: string;
  healthcareFacilityId: number;
  wasteBagQrCodeId: string;
  wasteSourceId: number;
  sourceTreatmentGroupId?: string;
  wasteClassificationId: number;
  scheduledStorageEndDatetime?: Date;
  assetId?: number;
  scaleMethod: string;
  weightInKgs?: number;
  ownedBy: string;
  isTreated: boolean;
  isDisposed: boolean;
  binNumber?: string;
  iotMethod?: string;
  wasteGroupIds?: string;
  healthcareFacilityName?: string;
  provinceId?: number;
  regencyId?: number;
  districtId?: number;
  provinceName?: string;
  regencyName?: string;
  districtName?: string;
  bastNo?: string;
  materialIds?: string;
}): Promise<WasteBagRecord> {
  const now = new Date();
  const row = await db
    .insertInto("waste_bag_record")
    .values({
      healthcare_facility_id: payload.healthcareFacilityId,
      created_at: now,
      created_by: payload.createdBy,
      waste_bag_qr_code_id: payload.wasteBagQrCodeId,
      waste_source_id: payload.wasteSourceId,
      source_treatment_group_id: payload.sourceTreatmentGroupId ?? null,
      waste_classification_id: payload.wasteClassificationId,
      storage_start_timestamp: now,
      scheduled_storage_end_datetime: payload.scheduledStorageEndDatetime ?? null,
      asset_id: payload.assetId ?? null,
      scale_method: toScaleMethod(payload.scaleMethod),
      weight_in_kgs: payload.weightInKgs != null ? Number(payload.weightInKgs.toFixed(3)) : null,
      waste_status: toWasteStatus("IN_TEMPORARY_STORAGE"),
      owned_by: toOwnedBy(payload.ownedBy),
      is_treated: payload.isTreated,
      is_disposed: payload.isDisposed,
      bin_number: payload.binNumber ?? null,
      iot_method: payload.iotMethod ?? null,
      waste_group_ids: payload.wasteGroupIds ?? null,
      healthcare_facility_name: payload.healthcareFacilityName ?? null,
      province_id: payload.provinceId ?? null,
      regency_id: payload.regencyId ?? null,
      district_id: payload.districtId ?? null,
      province_name: payload.provinceName ?? null,
      regency_name: payload.regencyName ?? null,
      district_name: payload.districtName ?? null,
      bast_no: payload.bastNo ?? null,
      material_ids: payload.materialIds ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

export interface WasteRecordCharacteristicsSummaryRow {
  wasteTypeName: string;
  wasteGroupName: string;
  wasteCharacteristicsName: string;
  totalWasteBag: number;
  totalWeightInKgs: number;
  avgWeightPerDay: number;
  avgWasteBagPerDay: number;
  healthcareFacilityName: string | null;
}

// Mirrors WasteTrackingExportExcelRepositoryImpl.fetchWasteRecordCharacteristicsSummary's
// raw SQL verbatim (see that method for the original MySQL version — ported
// to Postgres syntax: DATEDIFF(...) -> date subtraction, CEIL(...)::int).
// Joins waste_classification and waste_hierarchy (x3 aliases: waste_type_id,
// waste_group_id, waste_characteristics_id) — neither table is registered in
// this port's db schema yet, same gap noted at the top of this file.
export async function findRecordCharacteristicsSummary(params: {
  startDate: string;
  endDate: string;
  provinceId?: number;
  regencyId?: number;
  healthcareFacilityId?: number;
}): Promise<WasteRecordCharacteristicsSummaryRow[]> {
  const conditions: string[] = [];
  if (params.provinceId) conditions.push(`a.province_id = ${params.provinceId}`);
  if (params.regencyId) conditions.push(`a.regency_id = ${params.regencyId}`);
  if (params.healthcareFacilityId)
    conditions.push(`a.healthcare_facility_id = ${params.healthcareFacilityId}`);
  const andSQL = conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";

  const query = sql<WasteRecordCharacteristicsSummaryRow>`
    WITH date_range AS (
      SELECT (${params.endDate}::date - ${params.startDate}::date) + 1 AS days_count
    )
    SELECT
      wt.name AS "wasteTypeName",
      wg.name AS "wasteGroupName",
      wh.name AS "wasteCharacteristicsName",
      COUNT(a.id) AS "totalWasteBag",
      SUM(a.weight_in_kgs) AS "totalWeightInKgs",
      ROUND(SUM(a.weight_in_kgs) / MAX(dr.days_count), 2) AS "avgWeightPerDay",
      CEIL(COUNT(a.id)::numeric / MAX(dr.days_count)) AS "avgWasteBagPerDay",
      MAX(a.healthcare_facility_name) AS "healthcareFacilityName"
    FROM waste_bag_record a
    JOIN waste_classification wc ON wc.id = a.waste_classification_id
    JOIN waste_hierarchy wh ON wh.id = wc.waste_characteristics_id
    JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
    JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
    CROSS JOIN date_range dr
    WHERE a.created_at BETWEEN ${params.startDate + " 00:00:00"} AND ${params.endDate + " 23:59:59"}
      ${sql.raw(andSQL)}
    GROUP BY wc.waste_characteristics_id, wt.name, wg.name, wh.name
    ORDER BY wh.name
  `;
  const result = await query.execute(db);
  return result.rows;
}
