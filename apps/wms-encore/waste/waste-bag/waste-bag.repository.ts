// Postgres columns for table `waste_bag` (mirrors
// infrastructure/database/models/WasteBagModel.ts field-for-field):
//
//   id                                      bigint unsigned, auto-increment, primary key
//   created_by                              varchar(36), not null
//   created_at                              timestamp, not null, default now()
//   updated_at                              timestamp, nullable
//   updated_by                              varchar(36), nullable
//   waste_bag_qr_code_id                    varchar(255), not null, UNIQUE
//   healthcare_facility_id                  bigint unsigned, not null
//   waste_source_id                         bigint unsigned, not null
//   waste_classification_id                 bigint unsigned, not null
//   source_treatment_group_id               varchar(255), nullable
//   scale_method                            enum('IOT','MANUAL'), not null, default 'IOT'
//   asset_id                                bigint unsigned, nullable
//   weight_in_kgs                           decimal(10,2), nullable
//   storage_start_timestamp                 timestamp, nullable
//   scheduled_storage_end_datetime          timestamp, nullable
//   actual_storage_end_timestamp            timestamp, nullable
//   max_storage_hours                       integer, nullable
//   min_storage_hours                       integer, nullable
//   waste_treatment_group_id                bigint, nullable
//   waste_transportation_group_id           bigint, nullable
//   waste_treatment_external_group_id       integer, nullable
//   waste_transportation_external_group_id  integer, nullable
//   waste_status                            enum(18 values — see WASTE_STATUS_VALUES
//                                            in waste-bag.types.ts), not null,
//                                            default 'IN_TEMPORARY_STORAGE'
//                                            NOTE: the model's ENUM() call and the
//                                            entity's TS union list DISAGREE —
//                                            model list is missing HANDOVER_TO_TREATMENT
//                                            and IN_THIRD_PARTY_STORAGE but has an
//                                            extra STORED_FOR_TREATMENT the entity
//                                            doesn't have. Documented, not resolved —
//                                            flag for the DB migration author.
//   waste_status_updated_at                 timestamp, nullable, default now()
//   waste_status_updated_by                 varchar(36), nullable
//   transportation_status                   enum('REQUESTED','IN_TRANSIT','HANDED_OVER'), nullable
//   transportation_status_updated_at        timestamp, nullable, default now()
//   transportation_status_updated_by        varchar(36), nullable
//   owned_by                                enum('HEALTHCARE_FACILITY','TRANSPORTER','THIRD_PARTY'),
//                                            not null, default 'HEALTHCARE_FACILITY'
//   transporter_id                          bigint unsigned, nullable
//   third_party_id                          bigint unsigned, nullable
//   is_treated                              boolean, not null, default false
//   is_disposed                             boolean, not null, default false
//   bin_number                              varchar(50), nullable
//   iot_method                              enum('BLUETOOTH','INTERNET'), nullable
//   manifest_doc_number                     varchar(50), nullable
//   manifest_doc_path                       text, nullable
//   treatment_start_time                    timestamp, nullable
//   treatment_end_time                      timestamp, nullable
//   waste_group_ids                         varchar(255), nullable (comma-separated ids)
//   treatment_location_id                   bigint unsigned, nullable
//   healthcare_facility_name                varchar(255), nullable (denormalized)
//   province_id / province_name             bigint unsigned / varchar(255), nullable (denormalized)
//   regency_id / regency_name                bigint unsigned / varchar(255), nullable (denormalized)
//   district_id / district_name              bigint unsigned / varchar(255), nullable (denormalized)
//   transporter_name                        varchar(255), nullable (denormalized)
//   third_party_name                        varchar(255), nullable (denormalized)
//   bast_no                                 varchar(100), nullable
//   material_ids                            varchar(64), nullable
//   deleted_at                              timestamp, nullable (paranoid soft-delete)
//   deleted_by                              bigint, nullable
//
// Joins (see WasteBagModel's belongsTo associations — none of these tables
// need to physically exist for this pass, documented for later integration):
//   waste_classification_id -> waste_classification.id      (as "wasteClassification")
//   waste_source_id         -> waste_source.id              (as "wasteSource")
//   waste_treatment_group_id -> waste_bag_treatment_group.id (as "treatmentGroup")
//   waste_transportation_group_id -> waste_transportation_group.id (as "transportationGroup")
//   waste_treatment_external_group_id -> waste_treatment_external_group.id (as "treatmentExternalGroup")
//   waste_transportation_external_group_id -> waste_transportation_external_group.id (as "transportationExternalGroup")
//   healthcare_facility_id / transporter_id / third_party_id -> entities.id (three FKs onto the same table)
//
// Reporting queries (transactions/logbook/summary/history) join further
// against waste_source, waste_classification, entities (for provider_type via
// partnership) per WASTE_STATUS_LABEL's CASE-on-p.provider_type in the
// original WasteBag.ts — those joins are simplified/stubbed here (see the
// reporting functions at the bottom of this file) pending the actual schema
// integration pass.

import { db } from "../db";
import { sql } from "kysely";
import { isValidDateString } from "../../shared/utils/date-range";
import { getPresignedUrl } from "../../shared/storage/s3-client";
import { handleAnalisisProcessCount } from "./waste-bag.process-analysis";
import type { WasteBag, PaginationMeta } from "./waste-bag.types";
import type { WasteStatus } from "./waste-bag.types";
import type {
  GetAllTransactionWasteBagsRequest,
  PaginatedTransactionWasteBags,
  TransactionWasteBag,
} from "./waste-bag.types";

// Local literal-union cast helper, same pattern as asset-model.repository.ts's
// toAssetType — the DB column is a Postgres enum once wired; until then this
// documents the exact enum values expected at each call site.
function asWasteStatus(value: string): WasteStatus {
  return value as WasteStatus;
}

interface WasteBagRow {
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
  healthcare_facility_name: string | null;
  transporter_name: string | null;
  third_party_name: string | null;
  bast_no: string | null;
  material_ids: string | null;
}

function toEntity(row: WasteBagRow): WasteBag {
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
    healthcareFacilityName: row.healthcare_facility_name ?? undefined,
    transporterName: row.transporter_name ?? undefined,
    thirdPartyName: row.third_party_name ?? undefined,
    bastNo: row.bast_no ?? undefined,
    materialIds: row.material_ids ?? undefined,
  };
}

export async function findById(id: number): Promise<WasteBag | null> {
  const row = await db
    .selectFrom("waste_bag")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row as WasteBagRow) : null;
}

export async function findByQrCodeId(qrCodeId: string): Promise<WasteBag | null> {
  const row = await db
    .selectFrom("waste_bag")
    .selectAll()
    .where("waste_bag_qr_code_id", "=", qrCodeId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row as WasteBagRow) : null;
}

// Applies the same entityTag-driven scoping findPaginated uses (hospital-tag
// -> healthcare_facility_id, else -> third_party_id/transporter_id) to a
// single-row lookup, for GET /waste/:id — restores the entity-scoping the
// original's getWasteBagById callers relied on the shared getAllWasteBag
// gate for. Returns null (not found) rather than throwing when the row
// exists but is out of scope, so this reads as a plain 404 to the caller
// instead of leaking the row's existence.
export async function findByIdScoped(
  id: number,
  entityTag: string,
  entityId: number
): Promise<WasteBag | null> {
  const currentTag = entityTag.toLowerCase();
  let query = db.selectFrom("waste_bag").selectAll().where("id", "=", id).where("deleted_at", "is", null);
  query = currentTag.includes("hospital")
    ? query.where("healthcare_facility_id", "=", entityId)
    : query.where((eb) => eb.or([eb("third_party_id", "=", entityId), eb("transporter_id", "=", entityId)]));
  const row = await query.executeTakeFirst();
  return row ? toEntity(row as WasteBagRow) : null;
}

export async function findByQrCodeIdScoped(
  qrCodeId: string,
  entityTag: string,
  entityId: number
): Promise<WasteBag | null> {
  const currentTag = entityTag.toLowerCase();
  let query = db
    .selectFrom("waste_bag")
    .selectAll()
    .where("waste_bag_qr_code_id", "=", qrCodeId)
    .where("deleted_at", "is", null);
  query = currentTag.includes("hospital")
    ? query.where("healthcare_facility_id", "=", entityId)
    : query.where((eb) => eb.or([eb("third_party_id", "=", entityId), eb("transporter_id", "=", entityId)]));
  const row = await query.executeTakeFirst();
  return row ? toEntity(row as WasteBagRow) : null;
}

export async function findManyByQrCodeIds(qrCodeIds: string[]): Promise<WasteBag[]> {
  if (qrCodeIds.length === 0) return [];
  const rows = await db
    .selectFrom("waste_bag")
    .selectAll()
    .where("waste_bag_qr_code_id", "in", qrCodeIds)
    .where("deleted_at", "is", null)
    .execute();
  return rows.map((row) => toEntity(row as WasteBagRow));
}

export interface FindPaginatedParams {
  limit: number;
  page: number;
  search?: string;
  healthcareId?: number;
  transporterId?: number;
  thirdPartyId?: number;
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  wasteClassificationId?: number[];
  transportationGroupId?: number;
  transportationExternalGroupId?: number;
  treatmentGroupId?: number;
  treatmentExternalGroupId?: number;
  ownedBy?: string;
  wasteStatus?: string;
  binNumber?: string;
  wasteBagQrCodeId?: string;
  id?: number;
  // Mirrors getAllWasteController's sourceType/wasteTypeId/wasteGroupId/
  // wasteCharacteristicsId query params — dropped from this port's list
  // filters and restored here. sourceType filters via a join against
  // waste_source.source_type (waste_bag itself carries no source_type
  // column); wasteTypeId/wasteGroupId/wasteCharacteristicsId filter via a
  // join against waste_classification's matching FK columns.
  sourceType?: string;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
  isTreated?: boolean;
  isDisposed?: boolean;
  // Entity scoping restored to match GetAllWasteBagUseCase/
  // WasteBagRepositoryImpl.getAllWasteBag's entityTag/entityId gate — see
  // waste-bag.service.ts's getAllWasteBags for the "Authorization error"
  // check and the hospital-vs-transporter/third-party branch this drives.
  entityTag?: string;
  entityId?: number;
}

export async function findPaginated(
  params: FindPaginatedParams
): Promise<{ data: WasteBag[]; pagination: PaginationMeta }> {
  let query = db.selectFrom("waste_bag").where("deleted_at", "is", null);

  // Mirrors WasteBagRepositoryImpl.getAllWasteBag's entityTag-driven scoping:
  // hospital-tagged callers are scoped to their own healthcare_facility_id;
  // everyone else (transporter/third-party entities) is scoped to rows where
  // they're the transporter OR the third party. entityTag is required (see
  // service.ts's Authorization-error guard) — this is enforced again here as
  // a belt-and-suspenders check since this is a security boundary.
  if (params.entityTag) {
    const currentTag = params.entityTag.toLowerCase();
    if (currentTag.includes("hospital")) {
      query = query.where("healthcare_facility_id", "=", params.entityId ?? -1);
    } else {
      query = query.where((eb) =>
        eb.or([
          eb("third_party_id", "=", params.entityId ?? -1),
          eb("transporter_id", "=", params.entityId ?? -1),
        ])
      );
    }
  }

  if (params.sourceType || params.wasteTypeId || params.wasteGroupId || params.wasteCharacteristicsId) {
    // Restrict to bags whose waste_source/waste_classification match —
    // implemented as an `id in (subquery)` rather than a join so the
    // existing selectAll()/countAll() shape below doesn't need reworking.
    // Both tables are always joined here (harmless — waste_source_id and
    // waste_classification_id are both NOT NULL on waste_bag) so the query
    // builder's type stays stable across the conditional `.where()` calls
    // below, rather than reassigning a `let` across differently-joined
    // branches (which Kysely's type inference doesn't narrow cleanly).
    const idSubquery = db
      .selectFrom("waste_bag as wb2")
      .innerJoin("waste_source", "waste_source.id", "wb2.waste_source_id")
      .innerJoin("waste_classification", "waste_classification.id", "wb2.waste_classification_id")
      .select("wb2.id")
      .$if(!!params.sourceType, (qb) =>
        qb.where(
          "waste_source.source_type",
          "=",
          params.sourceType as "INTERNAL" | "EXTERNAL" | "INTERNAL_TREATMENT"
        )
      )
      .$if(!!params.wasteTypeId, (qb) => qb.where("waste_classification.waste_type_id", "=", params.wasteTypeId!))
      .$if(!!params.wasteGroupId, (qb) => qb.where("waste_classification.waste_group_id", "=", params.wasteGroupId!))
      .$if(!!params.wasteCharacteristicsId, (qb) =>
        qb.where("waste_classification.waste_characteristics_id", "=", params.wasteCharacteristicsId!)
      );
    query = query.where("id", "in", idSubquery);
  }

  // Uses Postgres ILIKE for case-insensitive search, matching binNumber /
  // wasteBagQrCodeId free-text search in the original's Sequelize `Op.like`
  // (MySQL's LIKE is already case-insensitive by default collation — ILIKE
  // is the Postgres-correct equivalent per this migration's convention).
  if (params.search) {
    query = query.where("waste_bag_qr_code_id", "ilike", `%${params.search}%`);
  }
  if (params.healthcareId) query = query.where("healthcare_facility_id", "=", params.healthcareId);
  if (params.transporterId) query = query.where("transporter_id", "=", params.transporterId);
  if (params.thirdPartyId) query = query.where("third_party_id", "=", params.thirdPartyId);
  if (params.transportationGroupId)
    query = query.where("waste_transportation_group_id", "=", params.transportationGroupId);
  if (params.transportationExternalGroupId)
    query = query.where(
      "waste_transportation_external_group_id",
      "=",
      params.transportationExternalGroupId
    );
  if (params.treatmentGroupId) query = query.where("waste_treatment_group_id", "=", params.treatmentGroupId);
  if (params.treatmentExternalGroupId)
    query = query.where("waste_treatment_external_group_id", "=", params.treatmentExternalGroupId);
  if (params.ownedBy) query = query.where("owned_by", "=", params.ownedBy);
  if (params.wasteStatus) query = query.where("waste_status", "=", params.wasteStatus);
  if (params.binNumber) query = query.where("bin_number", "=", params.binNumber);
  if (params.wasteBagQrCodeId) query = query.where("waste_bag_qr_code_id", "=", params.wasteBagQrCodeId);
  if (params.id) query = query.where("id", "=", params.id);
  if (params.wasteClassificationId && params.wasteClassificationId.length > 0)
    query = query.where("waste_classification_id", "in", params.wasteClassificationId);
  if (typeof params.isTreated === "boolean") query = query.where("is_treated", "=", params.isTreated);
  if (typeof params.isDisposed === "boolean") query = query.where("is_disposed", "=", params.isDisposed);
  if (params.wasteUpdateStart) query = query.where("waste_status_updated_at", ">=", new Date(params.wasteUpdateStart));
  if (params.wasteUpdateEnd) query = query.where("waste_status_updated_at", "<=", new Date(params.wasteUpdateEnd));

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .selectAll()
    .orderBy("created_at", "desc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  return {
    data: rows.map((row) => toEntity(row as WasteBagRow)),
    pagination: {
      total,
      pages: Math.ceil(total / params.limit),
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}

// ---------------------------------------------------------------------------
// Nested-relation attachment — restores the associations
// WasteBagRepositoryImpl.getAllWasteBag / getWasteBagById include on every
// row in the original (getWasteBagFromModel's mapping): wasteSource,
// wasteClassification (itself nested with wasteType/wasteGroup/
// wasteCharacteristics), transportationGroup, treatmentGroup,
// transportationExternalGroup, treatmentExternalGroup. Ported here as
// batched follow-up SELECTs keyed by the FK columns already on `waste_bag`,
// rather than a single giant join, so pagination/counting above is untouched
// and a bag with a null FK simply gets `undefined` for that relation (same
// as the original's `wasteSource ? {...} : undefined` branches).
export async function attachRelations(bags: WasteBag[]): Promise<WasteBag[]> {
  if (bags.length === 0) return bags;

  const wasteSourceIds = [...new Set(bags.map((b) => b.wasteSourceId))];
  const wasteClassificationIds = [...new Set(bags.map((b) => b.wasteClassificationId))];
  const treatmentGroupIds = [...new Set(bags.map((b) => b.wasteTreatmentGroupId).filter((id): id is number => id != null))];
  const transportationGroupIds = [...new Set(bags.map((b) => b.wasteTransportationGroupId).filter((id): id is number => id != null))];
  const treatmentExternalGroupIds = [...new Set(bags.map((b) => b.wasteTreatmentExternalGroupId).filter((id): id is number => id != null))];
  const transportationExternalGroupIds = [...new Set(bags.map((b) => b.wasteTransportationExternalGroupId).filter((id): id is number => id != null))];

  const [wasteSources, classifications, treatmentGroups, transportationGroups, treatmentExternalGroups, transportationExternalGroups] =
    await Promise.all([
      wasteSourceIds.length
        ? db.selectFrom("waste_source").selectAll().where("id", "in", wasteSourceIds).execute()
        : Promise.resolve([]),
      wasteClassificationIds.length
        ? db
            .selectFrom("waste_classification as wc")
            .innerJoin("waste_hierarchy as wt", "wt.id", "wc.waste_type_id")
            .innerJoin("waste_hierarchy as wg", "wg.id", "wc.waste_group_id")
            .innerJoin("waste_hierarchy as wch", "wch.id", "wc.waste_characteristics_id")
            .where("wc.id", "in", wasteClassificationIds)
            .selectAll("wc")
            .select([
              "wt.id as wt_id", "wt.name as wt_name", "wt.description as wt_description",
              "wt.name_en as wt_name_en", "wt.description_en as wt_description_en",
              "wt.parent_hierarchy_id as wt_parent_hierarchy_id",
              "wg.id as wg_id", "wg.name as wg_name", "wg.description as wg_description",
              "wg.name_en as wg_name_en", "wg.description_en as wg_description_en",
              "wg.parent_hierarchy_id as wg_parent_hierarchy_id",
              "wch.id as wch_id", "wch.name as wch_name", "wch.description as wch_description",
              "wch.name_en as wch_name_en", "wch.description_en as wch_description_en",
              "wch.is_residue as wch_is_residue", "wch.parent_hierarchy_id as wch_parent_hierarchy_id",
            ])
            .execute()
        : Promise.resolve([]),
      treatmentGroupIds.length
        ? db.selectFrom("waste_treatment_group").selectAll().where("id", "in", treatmentGroupIds).execute()
        : Promise.resolve([]),
      transportationGroupIds.length
        ? db.selectFrom("waste_transportation_group").selectAll().where("id", "in", transportationGroupIds).execute()
        : Promise.resolve([]),
      treatmentExternalGroupIds.length
        ? db.selectFrom("waste_treatment_external_group").selectAll().where("id", "in", treatmentExternalGroupIds).execute()
        : Promise.resolve([]),
      transportationExternalGroupIds.length
        ? db.selectFrom("waste_transportation_external_group").selectAll().where("id", "in", transportationExternalGroupIds).execute()
        : Promise.resolve([]),
    ]);

  const wasteSourceById = new Map(wasteSources.map((r) => [r.id, r]));
  const classificationById = new Map(classifications.map((r) => [r.id, r]));
  const treatmentGroupById = new Map(treatmentGroups.map((r) => [r.id, r]));
  const transportationGroupById = new Map(transportationGroups.map((r) => [r.id, r]));
  const treatmentExternalGroupById = new Map(treatmentExternalGroups.map((r) => [r.id, r]));
  const transportationExternalGroupById = new Map(transportationExternalGroups.map((r) => [r.id, r]));

  return Promise.all(
    bags.map(async (bag) => {
      const ws = wasteSourceById.get(bag.wasteSourceId);
      const wc = classificationById.get(bag.wasteClassificationId);
      const tg = bag.wasteTreatmentGroupId != null ? treatmentGroupById.get(bag.wasteTreatmentGroupId) : undefined;
      const tag = bag.wasteTransportationGroupId != null ? transportationGroupById.get(bag.wasteTransportationGroupId) : undefined;
      const teg =
        bag.wasteTreatmentExternalGroupId != null ? treatmentExternalGroupById.get(bag.wasteTreatmentExternalGroupId) : undefined;
      const taeg =
        bag.wasteTransportationExternalGroupId != null
          ? transportationExternalGroupById.get(bag.wasteTransportationExternalGroupId)
          : undefined;

      const manifestDocPath = bag.manifestDocPath
        ? (await getPresignedUrl(bag.manifestDocPath)) ?? bag.manifestDocPath
        : bag.manifestDocPath;

      return {
        ...bag,
        manifestDocPath,
        wasteSource: ws
          ? {
              id: ws.id,
              healthcareFacilityId: ws.healthcare_facility_id,
              sourceType: ws.source_type,
              internalSourceName: ws.internal_source_name ?? undefined,
              internalTreatmentName: ws.internal_treatment_name ?? undefined,
              externalHealthcareFacilityId: ws.external_healthcare_facility_id ?? undefined,
              externalHealthcareFacilityName: ws.external_healthcare_facility_name ?? undefined,
              isActive: ws.is_active,
              isResidue: ws.is_residue,
            }
          : undefined,
        wasteClassification: wc
          ? {
              id: wc.id,
              regionId: wc.region_id,
              effectiveFrom: wc.effective_from,
              effectiveTo: wc.effective_to,
              wasteTypeId: wc.waste_type_id,
              wasteGroupId: wc.waste_group_id,
              wasteCharacteristicsId: wc.waste_characteristics_id,
              wasteCode: wc.waste_code,
              wasteBagColorCode: wc.waste_bag_color_code,
              storageRuleType: wc.storage_rule_type ?? undefined,
              useColdStorage: wc.use_cold_storage,
              coldStorageMinHours: wc.cold_storage_min_hours ?? undefined,
              coldStorageMaxHours: wc.cold_storage_max_hours ?? undefined,
              tempStorageMinHours: wc.temp_storage_min_hours ?? undefined,
              tempStorageMaxHours: wc.temp_storage_max_hours ?? undefined,
              minimunDecayDay: wc.minimun_decay_day ?? undefined,
              allowHealthcareFacilityTreatment: wc.allow_healthcare_facility_treatment,
              isActive: wc.is_active,
              hasMultipleTransporters: wc.has_multiple_transporters,
              treatmentMethod: wc.treatment_method ?? undefined,
              disposalMethod: wc.disposal_method ?? undefined,
              allowedVehicleTypes: wc.allowed_vehicle_types ?? undefined,
              wasteType: {
                id: (wc as unknown as Record<string, unknown>).wt_id as number,
                name: (wc as unknown as Record<string, unknown>).wt_name as string,
                description: ((wc as unknown as Record<string, unknown>).wt_description as string | null) ?? undefined,
                nameEn: (wc as unknown as Record<string, unknown>).wt_name_en as string,
                descriptionEn: ((wc as unknown as Record<string, unknown>).wt_description_en as string | null) ?? undefined,
                parentHierarchyId: ((wc as unknown as Record<string, unknown>).wt_parent_hierarchy_id as number | null) ?? undefined,
              },
              wasteGroup: {
                id: (wc as unknown as Record<string, unknown>).wg_id as number,
                name: (wc as unknown as Record<string, unknown>).wg_name as string,
                description: ((wc as unknown as Record<string, unknown>).wg_description as string | null) ?? undefined,
                nameEn: (wc as unknown as Record<string, unknown>).wg_name_en as string,
                descriptionEn: ((wc as unknown as Record<string, unknown>).wg_description_en as string | null) ?? undefined,
                parentHierarchyId: ((wc as unknown as Record<string, unknown>).wg_parent_hierarchy_id as number | null) ?? undefined,
              },
              wasteCharacteristics: {
                id: (wc as unknown as Record<string, unknown>).wch_id as number,
                name: (wc as unknown as Record<string, unknown>).wch_name as string,
                description: ((wc as unknown as Record<string, unknown>).wch_description as string | null) ?? undefined,
                nameEn: (wc as unknown as Record<string, unknown>).wch_name_en as string,
                descriptionEn: ((wc as unknown as Record<string, unknown>).wch_description_en as string | null) ?? undefined,
                isResidue: ((wc as unknown as Record<string, unknown>).wch_is_residue as boolean | null) ?? undefined,
                parentHierarchyId: ((wc as unknown as Record<string, unknown>).wch_parent_hierarchy_id as number | null) ?? undefined,
              },
            }
          : undefined,
        transportationGroup: tag
          ? {
              id: tag.id,
              totalBagsCount: tag.total_bags_count,
              totalWeightInKgs: tag.total_weight_in_kgs,
              transporterVehicleId: tag.transporter_vehicle_id ?? undefined,
              transporterOperatorId: tag.transporter_operator_id ?? undefined,
              handoverLattitude: tag.handover_lattitude ?? undefined,
              handoverLongitude: tag.handover_longitude ?? undefined,
              transportationStatus: tag.transportation_status,
              isReadOnly: tag.is_read_only,
              groupId: tag.group_id,
            }
          : undefined,
        treatmentGroup: tg
          ? {
              id: tg.id,
              totalBagsCount: tg.total_bags_count,
              totalWeightInKgs: tg.total_weight_in_kgs,
              treatmentAssetId: tg.treatment_asset_id ?? undefined,
              treatmentOperatorId: tg.treatment_operator_id ?? undefined,
              handoverLattitude: tg.handover_lattitude ?? undefined,
              handoverLongitude: tg.handover_longitude ?? undefined,
              treatmentStatus: tg.treatment_status,
              isReadOnly: tg.is_read_only,
              groupId: tg.group_id,
            }
          : undefined,
        transportationExternalGroup: taeg
          ? {
              id: taeg.id,
              totalBagsCount: taeg.total_bags_count,
              transporterId: taeg.transporter_id,
              totalWeightInKgs: taeg.total_weight_in_kgs,
              transporterVehicleId: taeg.transporter_vehicle_id ?? undefined,
              transporterOperatorId: taeg.transporter_operator_id ?? undefined,
              handoverLattitude: taeg.handover_lattitude ?? undefined,
              handoverLongitude: taeg.handover_longitude ?? undefined,
              transportationStatus: taeg.transportation_status,
              handoverTimestamp: taeg.handover_timestamp ?? undefined,
              isReadOnly: taeg.is_read_only,
              groupId: taeg.group_id,
            }
          : undefined,
        treatmentExternalGroup: teg
          ? {
              id: teg.id,
              totalBagsCount: teg.total_bags_count,
              totalWeightInKgs: teg.total_weight_in_kgs,
              treatmentOperatorId: teg.treatment_operator_id ?? undefined,
              transportationStatus: teg.transportation_status,
              isReadOnly: teg.is_read_only,
              groupId: teg.group_id,
            }
          : undefined,
        processWastebagEnd: handleAnalisisProcessCount(
          wc?.disposal_method ?? undefined,
          wc?.treatment_method ?? undefined,
          bag.isTreated,
          bag.wasteGroupIds,
          bag.wasteStatus
        ),
      };
    })
  );
}

// Mirrors getLogHistories(wasteBagId) restricted to this bag's own
// wasteBagQrCodeId (is_group=true rows on waste_bag_audit_trail), same
// source findHistory below already reads — exposed separately so
// attachRelations' callers (list/detail) can opt in without paying for it
// on every lifecycle action that also returns a WasteBag.
export async function findLogHistoryForBag(wasteBagQrCodeId: string): Promise<{ wasteStatus: string; wasteBagStatusUpdateDate: Date }[]> {
  const rows = await db
    .selectFrom("waste_bag_audit_trail")
    .select(["waste_bag_status", "created_at"])
    .where("waste_bag_qr_code", "=", wasteBagQrCodeId)
    .where("is_group", "=", true)
    .orderBy("created_at", "asc")
    .execute();
  // waste_bag_status is nullable on this table (no NOT NULL default at the
  // DB level) — coalesced to "" rather than widening this function's return
  // type, matching the non-null `wasteStatus: string` contract every other
  // getWasteBagLogHistory port in this codebase (waste-bag-treatment-group,
  // waste-treatment-external-group, waste-transport-external-group) already
  // exposes.
  return rows.map((row) => ({ wasteStatus: row.waste_bag_status ?? "", wasteBagStatusUpdateDate: row.created_at }));
}

export async function create(payload: {
  createdBy: string;
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  sourceTreatmentGroupId?: string;
  scaleMethod: string;
  weightInKgs?: number;
  wasteBagQrCodeId: string;
  assetId?: number;
  binNumber?: string;
  wasteGroupIds?: string;
  bastNo?: string;
  materialIds?: string;
  iotMethod?: string;
  isTreated: boolean;
  scheduledStorageEndDatetime?: Date;
  // Mirrors CreateWaste.ts's getEntityDetail(healthcareFacilityId, token)
  // enrichment — denormalized onto the row at insert time in the original.
  // Ported from the local `entities`/`regions` tables (see
  // waste-bag.service.ts's createWasteBag) rather than the HTTP round-trip.
  healthcareFacilityName?: string;
  provinceId?: number;
  provinceName?: string;
  regencyId?: number;
  regencyName?: string;
  districtId?: number;
  districtName?: string;
}): Promise<WasteBag> {
  const row = await db
    .insertInto("waste_bag")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      healthcare_facility_id: payload.healthcareFacilityId,
      waste_source_id: payload.wasteSourceId,
      waste_classification_id: payload.wasteClassificationId,
      source_treatment_group_id: payload.sourceTreatmentGroupId ?? null,
      scale_method: payload.scaleMethod,
      weight_in_kgs: payload.weightInKgs ?? null,
      waste_bag_qr_code_id: payload.wasteBagQrCodeId,
      asset_id: payload.assetId ?? null,
      bin_number: payload.binNumber ?? null,
      waste_group_ids: payload.wasteGroupIds ?? null,
      bast_no: payload.bastNo ?? null,
      material_ids: payload.materialIds ?? null,
      iot_method: payload.iotMethod ?? null,
      is_treated: payload.isTreated,
      is_disposed: false,
      owned_by: "HEALTHCARE_FACILITY",
      waste_status: asWasteStatus("IN_TEMPORARY_STORAGE"),
      scheduled_storage_end_datetime: payload.scheduledStorageEndDatetime ?? null,
      healthcare_facility_name: payload.healthcareFacilityName ?? null,
      province_id: payload.provinceId ?? null,
      province_name: payload.provinceName ?? null,
      regency_id: payload.regencyId ?? null,
      regency_name: payload.regencyName ?? null,
      district_id: payload.districtId ?? null,
      district_name: payload.districtName ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row as WasteBagRow);
}

// Mirrors CreateWaste.ts's `checkData.set({...}); checkData.save()` branch
// (taken when isRadioActive && a row with the same wasteBagQrCodeId already
// exists) — updates the existing row's mutable fields in place instead of
// creating a new one. Does NOT touch waste_status/scheduled_storage_end_datetime
// (the original's `.set()` call doesn't include them either), and — same as
// the original — does NOT publish a status-change event for this path (no
// logInfo call follows `checkData.save()` in CreateWaste.ts before its early
// `return`).
export async function updateById(
  id: number,
  payload: {
    updatedBy: string;
    scaleMethod: string;
    weightInKgs?: number;
    binNumber?: string;
    iotMethod?: string;
    wasteGroupIds?: string;
    bastNo?: string;
    materialIds?: string;
    assetId?: number;
  }
): Promise<WasteBag | null> {
  // Original: `Number(parseFloat(weightInKgs?.toString() ?? "").toFixed(3))`
  // — when weightInKgs is undefined, parseFloat("") is NaN, NaN.toFixed(3)
  // is the string "NaN", and Number("NaN") is NaN again. Preserved verbatim:
  // an undefined weightInKgs on this branch writes NaN into weight_in_kgs
  // (Postgres will reject a real NaN insert into a numeric column at
  // runtime, same class of footgun as the original silently corrupting the
  // MySQL row).
  const weightInKgs = Number(parseFloat(payload.weightInKgs?.toString() ?? "").toFixed(3));

  const row = await db
    .updateTable("waste_bag")
    .set({
      updated_at: new Date(),
      updated_by: payload.updatedBy,
      scale_method: payload.scaleMethod,
      weight_in_kgs: weightInKgs,
      bin_number: payload.binNumber ?? null,
      iot_method: payload.iotMethod ?? null,
      waste_group_ids: payload.wasteGroupIds ?? null,
      bast_no: payload.bastNo ?? null,
      material_ids: payload.materialIds ?? null,
      asset_id: payload.assetId ?? null,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return row ? toEntity(row as WasteBagRow) : null;
}

// Generic status transition used by every lifecycle action below
// (temporaryStore/coldStore/internalLandfill/sterilise/incinerate/transport
// follow-up/handover/etc.) — mirrors the `waste_status` + `waste_status_updated_at`
// + `waste_status_updated_by` triad every one of the original's repository
// methods updates alongside its own action-specific columns. Returns the rows
// as they were BEFORE the update so callers (waste-bag.service.ts) can
// publish {previousStatus, newStatus} accurately per bag.
export async function updateStatusByQrCodeIds(
  qrCodeIds: string[],
  newStatus: WasteStatus,
  updatedBy: string,
  extra: Record<string, unknown> = {}
): Promise<WasteBag[]> {
  const before = await findManyByQrCodeIds(qrCodeIds);
  if (before.length === 0) return [];

  await db
    .updateTable("waste_bag")
    .set({
      waste_status: newStatus,
      waste_status_updated_at: new Date(),
      waste_status_updated_by: updatedBy,
      updated_at: new Date(),
      updated_by: updatedBy,
      ...extra,
    })
    .where("waste_bag_qr_code_id", "in", qrCodeIds)
    .where("deleted_at", "is", null)
    .execute();

  return before;
}

// Mirrors ProcessScheduledEventUseCase's per-branch `wasteBag.<field> = ...`
// mutations followed by `wasteBagRepository.saveWasteBag(wasteBag)` — a
// direct partial-field UPDATE, since the fields a scheduled-event advance
// touches (isTreated/isDisposed/ownedBy/transportationStatus/treatmentEndTime)
// don't all fit updateStatusByQrCodeIds's "always set waste_status" shape.
// Owned here (not scheduled-event-dispatcher/) because this domain owns
// waste_bag — see advanceScheduledWasteBagEvent below, the sole caller.
export interface ScheduledEventPatch {
  wasteStatus?: WasteStatus;
  isTreated?: boolean;
  isDisposed?: boolean;
  ownedBy?: string;
  transportationStatus?: string;
  transportationStatusUpdatedAt?: Date;
  treatmentEndTime?: Date;
  wasteStatusUpdatedAt: Date;
}

export async function applyScheduledEventPatch(
  id: number,
  patch: ScheduledEventPatch
): Promise<WasteBag | null> {
  await db
    .updateTable("waste_bag")
    .set({
      ...(patch.wasteStatus !== undefined ? { waste_status: patch.wasteStatus } : {}),
      ...(patch.isTreated !== undefined ? { is_treated: patch.isTreated } : {}),
      ...(patch.isDisposed !== undefined ? { is_disposed: patch.isDisposed } : {}),
      ...(patch.ownedBy !== undefined ? { owned_by: patch.ownedBy } : {}),
      ...(patch.transportationStatus !== undefined
        ? { transportation_status: patch.transportationStatus }
        : {}),
      ...(patch.transportationStatusUpdatedAt !== undefined
        ? { transportation_status_updated_at: patch.transportationStatusUpdatedAt }
        : {}),
      ...(patch.treatmentEndTime !== undefined ? { treatment_end_time: patch.treatmentEndTime } : {}),
      waste_status_updated_at: patch.wasteStatusUpdatedAt,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return findById(id);
}

// ---- Group-based transport/treatment transitions --------------------------
// (HandOverTransport.ts / PickUpTransportExternal.ts / HandOverTreatmentExternal.ts)
//
// waste_transportation_group / waste_transportation_external_group /
// waste_treatment_external_group all exist in the Kysely schema (see db/db.ts)
// with waste_bag already carrying FK columns onto each of them
// (waste_transportation_group_id / waste_transportation_external_group_id /
// waste_treatment_external_group_id) — so, unlike the sibling
// waste-transportation-group module (which has no reason to reach into
// waste_bag itself), this repository CAN join/update across those tables
// directly. What's NOT wired: partner_vehicle lookup by vehicle number lives
// in partnership/partner-vehicle (called from waste-bag.service.ts, not
// here), and there is no MinIO/S3 client in this app yet for the manifest
// document upload step (see CLAUDE.md's note on @smile-health/lib) — that
// piece is left as a TODO in the service layer.

// Mirrors createHandoverTransportWasteBag's initial lookup:
// `WasteBagModel.findOne({ where: { wasteTransportationGroupId: {in}, wasteStatus: 'READY_FOR_TRANSPORT' } })`.
export async function findReadyForTransportByGroupIds(
  groupIds: number[]
): Promise<{ id: number; transporterId: number | null } | null> {
  const row = await db
    .selectFrom("waste_bag")
    .select(["id", "transporter_id"])
    .where("waste_transportation_group_id", "in", groupIds)
    .where("waste_status", "=", "READY_FOR_TRANSPORT")
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? { id: row.id, transporterId: row.transporter_id } : null;
}

// Mirrors the remainder of createHandoverTransportWasteBag: updates
// waste_transportation_group's handover/vehicle/status fields, then flips
// the matching waste_bag rows to wasteStatus='TRANSPORTATION_REQUEST_CREATED'
// / transportationStatus='IN_TRANSIT', and returns the bags that now match
// that post-update state (same "re-query after update" shape the original
// uses via `affectedWasteBags`, rather than the before/after-diff pattern
// `updateStatusByQrCodeIds` uses elsewhere in this file — callers must
// publish {previousStatus:'READY_FOR_TRANSPORT', newStatus} explicitly since
// the returned rows already carry the NEW status).
export async function applyHandoverTransport(params: {
  wasteTransportationGroupIds: number[];
  handoverLatitude: number;
  handoverLongitude: number;
  vehicleId: number;
  transporterOperatorId?: string;
  handoverTimestamp: Date;
  manifestDocNumber: string;
  updatedBy: string;
}): Promise<WasteBag[]> {
  await db
    .updateTable("waste_transportation_group")
    .set({
      handover_lattitude: params.handoverLatitude,
      handover_longitude: params.handoverLongitude,
      transporter_vehicle_id: params.vehicleId,
      transporter_operator_id: params.transporterOperatorId ?? null,
      updated_by: params.updatedBy,
      updated_at: new Date(),
      transportation_status: "TRANSPORTATION_REQUEST_CREATED",
      handover_timestamp: params.handoverTimestamp,
    })
    .where("id", "in", params.wasteTransportationGroupIds)
    .execute();

  await db
    .updateTable("waste_bag")
    .set({
      waste_status: "TRANSPORTATION_REQUEST_CREATED",
      transportation_status: "IN_TRANSIT",
      updated_by: params.updatedBy,
      waste_status_updated_at: new Date(),
      waste_status_updated_by: params.updatedBy,
      manifest_doc_number: params.manifestDocNumber,
    })
    .where("waste_transportation_group_id", "in", params.wasteTransportationGroupIds)
    .execute();

  const rows = await db
    .selectFrom("waste_bag")
    .selectAll()
    .where("waste_transportation_group_id", "in", params.wasteTransportationGroupIds)
    .where("waste_status", "=", "TRANSPORTATION_REQUEST_CREATED")
    .where("transportation_status", "=", "IN_TRANSIT")
    .where("waste_status_updated_by", "=", params.updatedBy)
    .execute();
  return rows.map((row) => toEntity(row as WasteBagRow));
}

// Mirrors createPickUpTransportExternalWasteBag, including its
// healthcareFacilityId/transporterId scoping — sourced from the
// authenticated caller (req.user.entity.id/user_uuid_wms in the original,
// AuthData.entityId/userID here), plus healthcareFacilityId from the request
// body (pickUpTransportExternalSchema).
export async function applyPickUpTransportExternal(params: {
  wasteTransportationExternalGroupIds: number[];
  healthcareFacilityId: number;
  transporterId: number;
  transporterOperatorId: string;
  handoverLatitude: number;
  handoverLongitude: number;
  treatmentProviderId?: number;
  treatmentOperatorId?: string;
  isReadOnly?: boolean;
  updatedBy: string;
}): Promise<WasteBag[]> {
  const candidate = await db
    .selectFrom("waste_bag")
    .select(["id", "transporter_id", "waste_group_ids"])
    .where("waste_transportation_external_group_id", "in", params.wasteTransportationExternalGroupIds)
    .where("healthcare_facility_id", "=", params.healthcareFacilityId)
    .where("transporter_id", "=", params.transporterId)
    .where("waste_status", "=", "TRANSPORTATION_REQUEST_CREATED")
    .where("transportation_status", "=", "HANDED_OVER")
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  if (!candidate) return [];

  await db
    .updateTable("waste_transportation_external_group")
    .set({
      handover_lattitude: params.handoverLatitude,
      handover_longitude: params.handoverLongitude,
      transporter_id: candidate.transporter_id ?? undefined,
      transporter_operator_id: params.transporterOperatorId,
      updated_by: params.updatedBy,
      pickup_at: new Date(),
      transportation_status: "IN_TRANSIT",
      treatment_provider_id: params.treatmentProviderId ?? null,
      treatment_operator_id: params.treatmentOperatorId ?? null,
      is_read_only: params.isReadOnly ?? false,
    })
    .where("id", "in", params.wasteTransportationExternalGroupIds)
    .execute();

  // Original decides whether to set treatmentStartTime for the WHOLE bulk
  // update based on a single sampled bag's wasteGroupIds (`wasteBag.wasteGroupIds
  // ? {...} : baseUpdate` — not evaluated per-row) — preserved verbatim, same
  // "one row's field controls every row's update" quirk as the source.
  const baseSet = {
    updated_by: params.updatedBy,
    waste_status: "IN_TRANSIT" as const,
    waste_status_updated_at: new Date(),
    actual_storage_end_timestamp: new Date(),
    waste_status_updated_by: params.updatedBy,
  };

  await db
    .updateTable("waste_bag")
    .set(candidate.waste_group_ids ? { ...baseSet, treatment_start_time: new Date() } : baseSet)
    .where("waste_transportation_external_group_id", "in", params.wasteTransportationExternalGroupIds)
    .where("waste_status", "=", "TRANSPORTATION_REQUEST_CREATED")
    .execute();

  const rows = await db
    .selectFrom("waste_bag")
    .selectAll()
    .where("waste_transportation_external_group_id", "in", params.wasteTransportationExternalGroupIds)
    .where("waste_status", "=", "IN_TRANSIT")
    .execute();
  return rows.map((row) => toEntity(row as WasteBagRow));
}

// Mirrors createHandoverTreatmentExternalWasteBag, which delegates group
// creation to WasteTreatmentExternalGroupImpl.createWasteTreatmentExternalGroup
// (one new waste_treatment_external_group row per distinct
// waste_transportation_external_group_id among the matched bags, copying
// totalBagsCount/totalWeightInKgs/groupId off the transport group) before
// flipping the bags' status. Ported here directly against
// waste_treatment_external_group (rather than calling into the sibling
// waste-treatment-external-group module, which currently exposes no
// "create" — only report/find helpers, see that module's repository.ts).
export async function applyHandoverTreatmentExternal(params: {
  wasteTransportationExternalGroupIds: number[];
  treatmentProviderId: number | null;
  thirdPartyId?: number;
  treatmentLocationId: number;
  updatedBy: string;
}): Promise<WasteBag[]> {
  const bags = await db
    .selectFrom("waste_bag")
    .select(["id", "waste_transportation_external_group_id"])
    .where("waste_transportation_external_group_id", "in", params.wasteTransportationExternalGroupIds)
    .where("deleted_at", "is", null)
    .execute();
  if (bags.length === 0) return [];

  const transportGroupIds = [
    ...new Set(bags.map((b) => b.waste_transportation_external_group_id).filter((id): id is number => id != null)),
  ];

  const treatmentGroupIds: number[] = [];
  for (const transportGroupId of transportGroupIds) {
    const transportGroup = await db
      .selectFrom("waste_transportation_external_group")
      .select(["id", "group_id", "total_bags_count", "total_weight_in_kgs"])
      .where("id", "=", transportGroupId)
      .executeTakeFirst();
    if (!transportGroup) continue;

    const created = await db
      .insertInto("waste_treatment_external_group")
      .values({
        created_by: params.updatedBy,
        updated_by: params.updatedBy,
        treatment_provider_id: params.treatmentProviderId,
        total_bags_count: transportGroup.total_bags_count,
        total_weight_in_kgs: transportGroup.total_weight_in_kgs,
        source_external_transportation_group_id: transportGroupId,
        transportation_status: "STORED_FOR_TREATMENT",
        treatment_operator_id: params.updatedBy,
        group_id: transportGroup.group_id,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    await db
      .updateTable("waste_transportation_external_group")
      .set({ waste_treatment_external_group_id: created.id })
      .where("id", "=", transportGroupId)
      .execute();

    await db
      .updateTable("waste_bag")
      .set({
        waste_status: "HANDOVER_TO_TREATMENT",
        transportation_status: "HANDED_OVER",
        waste_treatment_external_group_id: created.id,
        third_party_id: params.thirdPartyId ?? null,
        updated_by: params.updatedBy,
        transportation_status_updated_by: params.updatedBy,
        waste_status_updated_at: new Date(),
        waste_status_updated_by: params.updatedBy,
        treatment_location_id: params.treatmentLocationId,
      })
      .where("waste_transportation_external_group_id", "=", transportGroupId)
      .execute();

    treatmentGroupIds.push(created.id);
  }
  if (treatmentGroupIds.length === 0) return [];

  const rows = await db
    .selectFrom("waste_bag")
    .selectAll()
    .where("waste_treatment_external_group_id", "in", treatmentGroupIds)
    .where("waste_status", "=", "HANDOVER_TO_TREATMENT")
    .execute();
  return rows.map((row) => toEntity(row as WasteBagRow));
}

// ---- Reporting (reportWasteBagController.ts's use-cases) ------------------

// Ports ReportWasteBagRepositoryImpl.getAllTransactionWasteBagRaw's CTE
// verbatim (join structure, filters, and derived columns), translated to
// Postgres: CONVERT_TZ(...) -> AT TIME ZONE chain (same pattern as
// dashboard.repository.ts), MySQL two-arg LIMIT -> LIMIT/OFFSET, LIKE -> ILIKE.
//
// One deliberate correction: the original's treatmentStatus filter referenced
// `wrg.transportation_status` — `wrg` is not a declared alias anywhere in
// that query (the joins declare `wg`/`wteg`/`wtrg`), so that branch would
// have thrown "unknown column" in MySQL had it ever actually been exercised.
// Rewritten here to reference `wtrg.transportation_status` (the
// waste_treatment_external_group join, whose alias `wrg` most plausibly
// meant to reference given the naming and its transportation_status column).
export async function findTransactionsPaginated(
  params: GetAllTransactionWasteBagsRequest & { limit: number; page: number }
): Promise<PaginatedTransactionWasteBags> {
  const offset = (params.page - 1) * params.limit;

  const clauses: ReturnType<typeof sql>[] = [sql`wb.deleted_at IS NULL`];
  if (params.healthcareId) clauses.push(sql`wb.healthcare_facility_id = ${params.healthcareId}`);
  if (params.transporterId) clauses.push(sql`wb.transporter_id = ${params.transporterId}`);
  if (isValidDateString(params.startDate) && isValidDateString(params.endDate)) {
    clauses.push(
      sql`(wb.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') BETWEEN ${`${params.startDate} 00:00:00`}::timestamp AND ${`${params.endDate} 23:59:59`}::timestamp`
    );
  }
  if (params.treatmentStatus) {
    clauses.push(
      sql`(wg.treatment_status = ${params.treatmentStatus} OR wtrg.transportation_status = ${params.treatmentStatus})`
    );
  }
  if (params.wasteTypeId) clauses.push(sql`wcx.waste_type_id = ${params.wasteTypeId}`);
  if (params.wasteGroupId) clauses.push(sql`wcx.waste_group_id = ${params.wasteGroupId}`);
  if (params.wasteCharacteristicsId) {
    clauses.push(sql`wcx.waste_characteristics_id = ${params.wasteCharacteristicsId}`);
  }
  if (params.search) clauses.push(sql`wb.waste_bag_qr_code_id ILIKE ${`%${params.search}%`}`);
  if (params.provinceId) clauses.push(sql`wb.province_id = ${params.provinceId}`);
  if (params.cityId) clauses.push(sql`wb.regency_id = ${params.cityId}`);
  const whereSql = sql`WHERE ${sql.join(clauses, sql` AND `)}`;

  const baseCte = sql`
    WITH filtered_data AS (
      SELECT
        wb.id, wb.created_at AS "createdAt", wcx.waste_code AS "wasteCode",
        wb.waste_bag_qr_code_id AS "qrCode", wc.name AS "wasteCharacteristicsName",
        wc.name_en AS "wasteCharacteristicsNameEn", wb.waste_status AS "wasteStatus",
        wb.weight_in_kgs AS "weightInKgs", wb.actual_storage_end_timestamp AS "actualStorageEndDatetime",
        wb.healthcare_facility_id AS "healthcareFacilityId", wb.waste_source_id AS "wasteSourceId",
        wb.waste_classification_id AS "wasteClassificationId", wb.transporter_id AS "transporterId",
        wb.third_party_id AS "thirdPartyId", wt.name AS "wasteTypeName", wt.name_en AS "wasteTypeNameEn",
        wgh.name AS "wasteGroupName", wgh.name_en AS "wasteGroupNameEn",
        wb.waste_status_updated_at AS "wasteStatusUpdatedAt",
        CASE
          WHEN ws.source_type = 'INTERNAL' THEN ws.internal_source_name
          WHEN ws.source_type = 'INTERNAL_TREATMENT' THEN ws.internal_treatment_name::text
          ELSE ws.external_healthcare_facility_name
        END AS "wasteSource",
        p.provider_type AS "wasteTreatment",
        CASE WHEN wb.waste_status = 'IN_COLD_STORAGE' THEN ROUND(wcx.cold_storage_max_hours / 24.0)
             ELSE ROUND(wcx.temp_storage_max_hours / 24.0) END AS "storageMax",
        CASE WHEN wb.waste_treatment_group_id IS NOT NULL AND wteg.id IS NULL
             THEN wg.group_id ELSE wteg.group_id END AS "wasteGroupNumber",
        wb.created_at AS "checkInDate", wteg.updated_at AS "checkOutDate",
        CASE WHEN wteg.id IS NOT NULL THEN wb.weight_in_kgs
             WHEN wb.waste_treatment_group_id IS NOT NULL THEN wb.weight_in_kgs
             ELSE 0 END AS "weightOutKgs",
        CASE WHEN wteg.id IS NOT NULL THEN 1
             WHEN wb.waste_treatment_group_id IS NOT NULL THEN 1
             ELSE 0 END AS "wasteBagOut",
        wb.manifest_doc_number AS "manifestDocNumber", wb.province_name AS "provinceName",
        wb.regency_name AS "regencyName", wb.healthcare_facility_name AS "healthcareFacilityName",
        wb.transporter_name AS "transporterName", wb.third_party_name AS "thirdPartyName",
        wb.district_name AS "districtName", wcx.disposal_method AS "disposalMethod",
        u.firstname AS "operatorHealthcareName"
      FROM waste_bag wb
      JOIN waste_source ws ON ws.id = wb.waste_source_id
      JOIN waste_classification wcx ON wcx.id = wb.waste_classification_id
      JOIN waste_hierarchy wc ON wc.id = wcx.waste_characteristics_id
      JOIN waste_hierarchy wt ON wt.id = wcx.waste_type_id
      JOIN waste_hierarchy wgh ON wgh.id = wcx.waste_group_id
      LEFT JOIN users u ON u.user_uuid::text = wb.created_by
      LEFT JOIN waste_treatment_group wg ON wg.id = wb.waste_treatment_group_id
      LEFT JOIN waste_transportation_external_group wteg
        ON wteg.id = wb.waste_transportation_external_group_id
        AND wteg.transportation_status != 'READY_FOR_TRANSPORT'
      LEFT JOIN waste_treatment_external_group wtrg ON wtrg.id = wb.waste_treatment_external_group_id
      LEFT JOIN partnership p ON p.provider_id = wb.transporter_id AND p.transporter_id IS NULL
        AND wcx.id = p.waste_classification_id AND p.consumer_id = wb.healthcare_facility_id
        AND p.partnership_status = 'ACTIVE'
      ${whereSql}
    )
  `;

  const dataResult = await sql<TransactionWasteBag>`
    ${baseCte}
    SELECT * FROM filtered_data ORDER BY "createdAt" DESC LIMIT ${params.limit} OFFSET ${offset}
  `.execute(db);

  const countResult = await sql<{
    total: string | number;
    weightInKgs: string | number | null;
    weightOutKgs: string | number | null;
    wasteBagOut: string | number | null;
  }>`
    ${baseCte}
    SELECT COUNT(*) AS total, SUM("weightInKgs") AS "weightInKgs",
      SUM("weightOutKgs") AS "weightOutKgs", SUM("wasteBagOut") AS "wasteBagOut"
    FROM filtered_data
  `.execute(db);

  const totalsRow = countResult.rows[0];
  const total = Number(totalsRow?.total ?? 0);
  const weightInKgs = Number(totalsRow?.weightInKgs ?? 0).toFixed(3);
  const weightOutKgs = Number(totalsRow?.weightOutKgs ?? 0).toFixed(3);
  const wasteBagOut = Number(totalsRow?.wasteBagOut ?? 0);

  const data = dataResult.rows.map((row) => {
    if (row.actualStorageEndDatetime && row.storageMax != null) {
      const withStorageMax = new Date(row.actualStorageEndDatetime);
      withStorageMax.setDate(withStorageMax.getDate() + Number(row.storageMax));
      return { ...row, actualStorageEndDatetime: withStorageMax };
    }
    return row;
  });

  return {
    data,
    totals: {
      weightInKgs,
      wasteInBags: total,
      weightOutKgs,
      wasteOutBags: wasteBagOut,
    },
    pagination: {
      total,
      pages: Math.ceil(total / params.limit),
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}

// Ports GetWasteBagSummaryByCharacteristicsUseCase / ReportWasteBagRepositoryImpl's
// getWasteBagSummaryByCharacteristics. The original also accepts
// limit/page/includeWasteStatus/provinceId/cityId — not present on this
// function's param surface (WasteBagSummaryByCharacteristicsRequest, see
// waste-bag.types.ts), so pagination/province/city filtering and the
// dynamic includeWasteStatus GROUP BY column aren't reproduced; everything
// else (the grouped totals per waste_characteristics, split by scale_method)
// is ported faithfully. Date-range filtering is done directly against the
// (timestamptz) created_at column rather than the original's
// CONVERT_TZ(...,'+00:00','+07:00') dance — Postgres already stores UTC and
// there's no equivalent "interpret naive datetime as +07:00" step needed
// here; wasteUpdateStart/wasteUpdateEnd are still treated as whole calendar
// days (start 00:00:00 through end's 23:59:59, inclusive).
export async function findSummaryByCharacteristics(params: {
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  healthcareId?: number;
}): Promise<Record<string, unknown>[]> {
  const conditions = [sql`a.deleted_at is null`];
  if (params.healthcareId) conditions.push(sql`a.healthcare_facility_id = ${params.healthcareId}`);
  if (params.wasteUpdateStart) conditions.push(sql`a.created_at >= ${new Date(`${params.wasteUpdateStart} 00:00:00`)}`);
  if (params.wasteUpdateEnd) conditions.push(sql`a.created_at <= ${new Date(`${params.wasteUpdateEnd} 23:59:59`)}`);
  const whereSql = sql.join(conditions, sql` and `);

  const query = sql<{
    wasteTypeName: string;
    wasteTypeNameEn: string;
    wasteGroupName: string;
    wasteGroupNameEn: string;
    wasteCharacteristicsName: string;
    wasteCharacteristicsNameEn: string;
    disposalMethod: string | null;
    healthcareFacilityName: string | null;
    totalWasteBag: string;
    totalWeightInKgs: string | null;
    manualWeightInKgs: string | null;
    manualWasteBagCount: string;
    iotWeightInKgs: string | null;
    iotWasteBagCount: string;
  }>`
    select
      wt.name as "wasteTypeName",
      wt.name_en as "wasteTypeNameEn",
      wg.name as "wasteGroupName",
      wg.name_en as "wasteGroupNameEn",
      wh.name as "wasteCharacteristicsName",
      wh.name_en as "wasteCharacteristicsNameEn",
      wc.disposal_method as "disposalMethod",
      a.healthcare_facility_name as "healthcareFacilityName",
      count(a.id) as "totalWasteBag",
      sum(a.weight_in_kgs) as "totalWeightInKgs",
      sum(case when a.scale_method = 'MANUAL' then a.weight_in_kgs else 0 end) as "manualWeightInKgs",
      count(case when a.scale_method = 'MANUAL' then a.id end) as "manualWasteBagCount",
      sum(case when a.scale_method = 'IOT' then a.weight_in_kgs else 0 end) as "iotWeightInKgs",
      count(case when a.scale_method = 'IOT' then a.id end) as "iotWasteBagCount"
    from waste_bag a
    join waste_classification wc on wc.id = a.waste_classification_id
    join waste_hierarchy wh on wh.id = wc.waste_characteristics_id
    join waste_hierarchy wg on wg.id = wc.waste_group_id
    join waste_hierarchy wt on wt.id = wc.waste_type_id
    where ${whereSql}
    group by a.healthcare_facility_name, wh.name, wh.name_en, wg.name, wg.name_en, wt.name, wt.name_en, wc.disposal_method
    order by wh.name
  `;

  const result = await query.execute(db);
  return result.rows as unknown as Record<string, unknown>[];
}

// Ports GetWasteSourceSummaryUseCase / getWasteSourceSummary. Same param-
// surface caveat as findSummaryByCharacteristics above (no limit/page/
// provinceId/cityId here); the per-source-type grouped totals and the
// INTERNAL/INTERNAL_TREATMENT/EXTERNAL summary split are ported faithfully.
export async function findWasteSourceSummary(params: {
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  healthcareId?: number;
}): Promise<Record<string, unknown>[]> {
  const conditions = [sql`wb.deleted_at is null`];
  if (params.healthcareId) conditions.push(sql`wb.healthcare_facility_id = ${params.healthcareId}`);
  if (params.wasteUpdateStart) conditions.push(sql`wb.created_at >= ${new Date(`${params.wasteUpdateStart} 00:00:00`)}`);
  if (params.wasteUpdateEnd) conditions.push(sql`wb.created_at <= ${new Date(`${params.wasteUpdateEnd} 23:59:59`)}`);
  const whereSql = sql.join(conditions, sql` and `);

  const query = sql<{
    wasteSourceName: string | null;
    sourceType: string;
    totalWasteBag: string;
    totalWeightInKgs: string | null;
  }>`
    select
      case
        when ws.source_type = 'INTERNAL' then ws.internal_source_name
        when ws.source_type = 'INTERNAL_TREATMENT' then ws.internal_treatment_name::text
        else ws.external_healthcare_facility_name
      end as "wasteSourceName",
      ws.source_type as "sourceType",
      count(wb.id) as "totalWasteBag",
      sum(wb.weight_in_kgs) as "totalWeightInKgs"
    from waste_bag wb
    join waste_source ws on ws.id = wb.waste_source_id
    where ${whereSql}
    group by wb.waste_source_id, ws.source_type, ws.internal_source_name, ws.internal_treatment_name, ws.external_healthcare_facility_name
    order by ws.source_type asc
  `;
  const result = await query.execute(db);
  return result.rows as unknown as Record<string, unknown>[];
}

// Companion to findWasteSourceSummary — mirrors the original's separate
// `summarySql` query (INTERNAL / INTERNAL_TREATMENT / everything-else
// weight totals), used by waste-bag.service.ts to build the `summary`
// object the original use-case returns alongside `data`/`pagination`.
export async function findWasteSourceWeightBySourceType(params: {
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  healthcareId?: number;
}): Promise<{ totalInternal: number; totalInternalTreatment: number; totalExternal: number }> {
  const conditions = [sql`wb.deleted_at is null`];
  if (params.healthcareId) conditions.push(sql`wb.healthcare_facility_id = ${params.healthcareId}`);
  if (params.wasteUpdateStart) conditions.push(sql`wb.created_at >= ${new Date(`${params.wasteUpdateStart} 00:00:00`)}`);
  if (params.wasteUpdateEnd) conditions.push(sql`wb.created_at <= ${new Date(`${params.wasteUpdateEnd} 23:59:59`)}`);
  const whereSql = sql.join(conditions, sql` and `);

  const query = sql<{ source_type: string; totalWeight: string | null }>`
    select ws.source_type, sum(wb.weight_in_kgs) as "totalWeight"
    from waste_bag wb
    join waste_source ws on ws.id = wb.waste_source_id
    where ${whereSql}
    group by ws.source_type
  `;
  const result = await query.execute(db);

  let totalInternal = 0;
  let totalInternalTreatment = 0;
  let totalExternal = 0;
  for (const row of result.rows) {
    const weight = Number(row.totalWeight ?? 0);
    if (row.source_type === "INTERNAL") totalInternal = weight;
    else if (row.source_type === "INTERNAL_TREATMENT") totalInternalTreatment = weight;
    else totalExternal = weight;
  }
  return { totalInternal, totalInternalTreatment, totalExternal };
}

export async function findLogBookPaginated(params: {
  limit: number;
  page: number;
  healthcareId?: number;
}): Promise<{ data: Record<string, unknown>[]; pagination: PaginationMeta }> {
  let query = db.selectFrom("waste_bag").where("deleted_at", "is", null);
  if (params.healthcareId) query = query.where("healthcare_facility_id", "=", params.healthcareId);

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);
  const rows = await query
    .selectAll()
    .orderBy("created_at", "desc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  return {
    data: rows as unknown as Record<string, unknown>[],
    pagination: { total, pages: Math.ceil(total / params.limit), currentPage: params.page, perPage: params.limit },
  };
}

// Ports GetWasteBagHistoryUseCase / getLogHistories (shared/utils/logHistories.ts),
// following the same getWasteBagLogHistory convention already established by
// the sibling waste-treatment-external-group / waste-bag-treatment-group /
// waste-transport-external-group repositories (see e.g.
// waste-treatment-external-group.repository.ts's copy) now that
// waste_bag_audit_trail carries waste_bag_status/is_group/waste_bag_qr_code
// (see db/db.ts's WasteBagAuditTrailTable comment for the migration
// history) — filtering to is_group=true rows and reading waste_bag_status
// directly, rather than this file's own updateStatusByQrCodeIds/
// previous_status+new_status pair, which is a different (non-group) event
// stream on the same table.
//
// This function's signature only carries a numeric `id` (see
// WasteBagHistoryRequest in waste-bag.types.ts) rather than the original's
// id/qrCode/groupNumber trio — the id is resolved to its qrCodeId here via
// findById first, mirroring the original's `wasteBagId` branch of
// getLogHistories' three-way resolution (the qrCode/groupNumber branches
// aren't reachable through this port's request surface).
export async function findHistory(params: {
  id?: number;
  limit: number;
  page: number;
}): Promise<Record<string, unknown>[]> {
  if (!params.id) return [];
  const bag = await findById(params.id);
  if (!bag || !bag.wasteBagQrCodeId) return [];

  const rows = await db
    .selectFrom("waste_bag_audit_trail")
    .select(["waste_bag_status", "created_at"])
    .where("waste_bag_qr_code", "=", bag.wasteBagQrCodeId)
    .where("is_group", "=", true)
    .orderBy("created_at", "asc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  return rows.map((row) => ({
    wasteBagQrCode: bag.wasteBagQrCodeId,
    wasteStatus: row.waste_bag_status,
    wasteBagStatusUpdateDate: row.created_at,
  }));
}

// Ports GetWasteGroupDetailsUseCase / getWasteGroupDetails. The original
// takes (limit, page, wasteGroupId: number) and returns { data, pagination };
// this function's signature (wasteGroupId: string, no limit/page) is fixed
// by findWasteGroupDetails's existing callers (waste-bag.service.ts's
// getWasteGroupDetails, called from a route param, always fetches the full
// set for one group) — so this returns every bag in the group unpaginated,
// wrapped in the same { data, pagination } shape the original produces, with
// `pagination` describing that single (unpaginated) page.
export async function findWasteGroupDetails(wasteGroupId: string): Promise<Record<string, unknown> | null> {
  const numericGroupId = Number(wasteGroupId);
  if (!wasteGroupId || Number.isNaN(numericGroupId)) return null;

  const rows = await db
    .selectFrom("waste_bag as a")
    .innerJoin("waste_classification as b", "b.id", "a.waste_classification_id")
    .innerJoin("waste_hierarchy as c", "c.id", "b.waste_type_id")
    .innerJoin("waste_hierarchy as d", "d.id", "b.waste_group_id")
    .innerJoin("waste_hierarchy as e", "e.id", "b.waste_characteristics_id")
    .where("a.waste_transportation_external_group_id", "=", numericGroupId)
    .select([
      "a.waste_bag_qr_code_id as wasteQrCode",
      "c.name as wasteTypeName",
      "d.name as wasteGroupName",
      "e.name as wasteCharacteristicsName",
      "c.name_en as wasteTypeNameEn",
      "d.name_en as wasteGroupNameEn",
      "e.name_en as wasteCharacteristicsNameEn",
      "a.weight_in_kgs as wasteWeight",
    ])
    .execute();

  if (rows.length === 0) return null;

  return {
    data: rows,
    pagination: { total: rows.length, pages: 1, currentPage: 1, perPage: rows.length },
  };
}

// Ports GetWasteBagDetailsInternalTreatmentUseCase / getWasteBagDetailsInternalTreatment.
// The original's `lang` parameter (name vs name_en selection) isn't part of
// this function's signature — WasteBagInternalTreatmentDetailsRequest (see
// waste-bag.types.ts) only carries wasteBagQrCodeId — so this always returns
// the (non-English) `name` columns, same as calling the original with no
// `lang`. The MySQL FIND_IN_SET(wtg.id, wb.waste_group_ids) membership test
// is ported to Postgres via string_to_array(...)::text[] @> ARRAY[...] since
// waste_group_ids is a comma-separated TEXT column here too (see the
// WasteBagTable column comment at the top of this file), not a real
// array/set type.
export async function findInternalTreatmentDetails(
  wasteBagQrCodeId: string
): Promise<Record<string, unknown> | null> {
  const query = sql<{
    groupId: string;
    wasteBagQrcodeId: string;
    wasteTypeName: string;
    wasteGroupName: string;
    wasteCharacteristicsName: string;
    totalWeightInKgs: string;
    weightInKgs: string | null;
  }>`
    select
      wbs.group_id as "groupId",
      wb.waste_bag_qr_code_id as "wasteBagQrcodeId",
      wt.name as "wasteTypeName",
      wg.name as "wasteGroupName",
      wch.name as "wasteCharacteristicsName",
      wbs.total_weight_in_kgs as "totalWeightInKgs",
      wb.weight_in_kgs as "weightInKgs"
    from waste_bag wb
    join waste_classification wc on wc.id = wb.waste_classification_id
    join waste_hierarchy wt on wt.id = wc.waste_type_id
    join waste_hierarchy wg on wg.id = wc.waste_group_id
    join waste_hierarchy wch on wch.id = wc.waste_characteristics_id
    join (
      select wtg.id, wtg.group_id, wtg.total_weight_in_kgs
      from waste_bag wb2
      join waste_treatment_group wtg
        on wb2.waste_group_ids is not null
        and string_to_array(wb2.waste_group_ids, ',')::text[] @> array[wtg.id::text]
      where wb2.waste_bag_qr_code_id = ${wasteBagQrCodeId}
        and wb2.waste_group_ids is not null
    ) wbs on wbs.id = wb.waste_treatment_group_id
  `;

  const result = await query.execute(db);
  const rows = result.rows;
  if (rows.length === 0) return null;

  const grouped: Record<string, Record<string, unknown>> = {};
  for (const row of rows) {
    if (!grouped[row.groupId]) {
      grouped[row.groupId] = {
        wasteQrCode: wasteBagQrCodeId,
        groupId: row.groupId,
        wasteTypeName: row.wasteTypeName,
        wasteGroupName: row.wasteGroupName,
        wasteCharacteristicsName: row.wasteCharacteristicsName,
        totalWeightInKgs: Number(row.totalWeightInKgs),
        wasteBags: [] as Record<string, unknown>[],
      };
    }
    (grouped[row.groupId].wasteBags as Record<string, unknown>[]).push({
      groupId: row.groupId,
      wasteBagQrcodeId: row.wasteBagQrcodeId,
      wasteTypeName: row.wasteTypeName,
      wasteGroupName: row.wasteGroupName,
      wasteCharacteristicsName: row.wasteCharacteristicsName,
      weightInKgs: row.weightInKgs != null ? Number(row.weightInKgs) : undefined,
    });
  }

  return { data: Object.values(grouped) };
}

// ---------------------------------------------------------------------------
// GET /api/v1/waste/waste-tracking-all/export
//
// Ports WasteTrackingExportExcelRepositoryImpl's fetchWasteCharacteristicsSummary/
// fetchWasteSourceSummary/fetchWasteBags (apps/wms-service/src/infrastructure/
// database/repositories/WasteTrackingExportExcelRepositoryImpl.ts, lines
// ~1525-1799), feeding WasteTrackingAllExportExcelUseCase's 3-sheet workbook
// (waste-bag.service.ts's exportWasteTrackingAll). Filter surface matches the
// original exactly: startDate/endDate (whole calendar days, inclusive) plus
// optional provinceId/regencyId/healthcareFacilityId. Unlike
// findSummaryByCharacteristics/findWasteSourceSummary above (which only take
// wasteUpdateStart/wasteUpdateEnd/healthcareId), these three keep the
// original's full provinceId/regencyId filter set since the export endpoint
// exposes them as separate query params.
//
// Date filtering: original does CONVERT_TZ(created_at,'+00:00','+07:00')
// BETWEEN 'startDate 00:00:00' AND 'endDate 23:59:59' (MySQL, naive
// datetimes). Ported using the same `(alias.created_at AT TIME ZONE 'UTC' AT
// TIME ZONE 'Asia/Jakarta') BETWEEN ...` idiom already established for this
// exact original pattern in wastebag-monitoring-dashboard.repository.ts's
// buildWhere helper, rather than findTransactionsPaginated's plain-UTC
// comparison above (that one has no such CONVERT_TZ in its own original).
export type WasteTrackingExportFilters = {
  startDate: string;
  endDate: string;
  provinceId?: number;
  regencyId?: number;
  healthcareFacilityId?: number;
};

function wasteTrackingExportConditions(alias: string, params: WasteTrackingExportFilters) {
  const conditions = [
    sql`(${sql.raw(alias)}.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') BETWEEN ${`${params.startDate} 00:00:00`} AND ${`${params.endDate} 23:59:59`}`,
  ];
  if (params.provinceId) conditions.push(sql`${sql.raw(alias)}.province_id = ${params.provinceId}`);
  if (params.regencyId) conditions.push(sql`${sql.raw(alias)}.regency_id = ${params.regencyId}`);
  if (params.healthcareFacilityId) {
    conditions.push(sql`${sql.raw(alias)}.healthcare_facility_id = ${params.healthcareFacilityId}`);
  }
  return conditions;
}

// Ports fetchWasteCharacteristicsSummary — per-characteristic totals/averages
// (avgWeightPerDay/avgWasteBagPerDay divide by the inclusive day-count of the
// range), grouped by healthcare_facility_name + waste_characteristics_id +
// waste_status, ordered by facility desc then type/group/characteristics —
// the facility-desc + per-row ordering the original relies on for its
// "merge repeated facility name cells" Excel step.
export async function findWasteTrackingCharacteristicsSummaryForExport(
  params: WasteTrackingExportFilters
): Promise<Record<string, unknown>[]> {
  const conditions = wasteTrackingExportConditions("a", params);
  const whereSql = sql.join(conditions, sql` and `);
  const daysCount = sql`(DATE(${params.endDate}::date) - DATE(${params.startDate}::date) + 1)`;

  const query = sql<{
    wasteTypeName: string;
    wasteGroupName: string;
    wasteCharacteristicsName: string;
    wasteStatus: string;
    totalWasteBag: string;
    totalWeightInKgs: string | null;
    avgWeightPerDay: string | null;
    avgWasteBagPerDay: string | null;
    healthcareFacilityName: string | null;
  }>`
    select
      wt.name as "wasteTypeName",
      wg.name as "wasteGroupName",
      wh.name as "wasteCharacteristicsName",
      a.waste_status as "wasteStatus",
      count(a.id) as "totalWasteBag",
      sum(a.weight_in_kgs) as "totalWeightInKgs",
      round(sum(a.weight_in_kgs) / ${daysCount}, 2) as "avgWeightPerDay",
      ceil(count(a.id)::numeric / ${daysCount}) as "avgWasteBagPerDay",
      a.healthcare_facility_name as "healthcareFacilityName"
    from waste_bag a
    join waste_classification wc on wc.id = a.waste_classification_id
    join waste_hierarchy wh on wh.id = wc.waste_characteristics_id
    join waste_hierarchy wg on wg.id = wc.waste_group_id
    join waste_hierarchy wt on wt.id = wc.waste_type_id
    where ${whereSql}
    group by a.healthcare_facility_name, wc.waste_characteristics_id, a.waste_status, wt.name, wg.name, wh.name
    order by a.healthcare_facility_name desc, wt.name, wg.name, wh.name
  `;

  const result = await query.execute(db);
  return result.rows as unknown as Record<string, unknown>[];
}

// Ports fetchWasteSourceSummary — per-source totals with the same
// INTERNAL/INTERNAL_TREATMENT/EXTERNAL label CASE used by
// findWasteSourceSummary above, but re-scoped to this export's own
// provinceId/regencyId/healthcareFacilityId/startDate/endDate filter set
// (the original's buildWasteSourceLabelSQL('in') helper, inlined here).
export async function findWasteTrackingSourceSummaryForExport(
  params: WasteTrackingExportFilters
): Promise<Record<string, unknown>[]> {
  const conditions = wasteTrackingExportConditions("wb", params);
  const whereSql = sql.join(conditions, sql` and `);

  const query = sql<{
    wasteSourceName: string | null;
    sourceType: string;
    totalWasteBag: string;
    totalWeightInKgs: string | null;
    healthcareFacilityName: string | null;
  }>`
    select
      case
        when ws.source_type = 'INTERNAL' then ws.internal_source_name
        when ws.source_type = 'INTERNAL_TREATMENT' then ws.internal_treatment_name::text
        else ws.external_healthcare_facility_name
      end as "wasteSourceName",
      ws.source_type as "sourceType",
      count(wb.id) as "totalWasteBag",
      sum(wb.weight_in_kgs) as "totalWeightInKgs",
      wb.healthcare_facility_name as "healthcareFacilityName"
    from waste_bag wb
    join waste_source ws on ws.id = wb.waste_source_id
    where ${whereSql}
    group by wb.waste_source_id, ws.source_type, ws.internal_source_name, ws.internal_treatment_name, ws.external_healthcare_facility_name, wb.healthcare_facility_name
    order by ws.source_type asc
  `;

  const result = await query.execute(db);
  return result.rows as unknown as Record<string, unknown>[];
}

// Ports fetchWasteBags — the per-bag detail sheet. Same join shape as
// findTransactionsPaginated above (waste_source/waste_classification/
// waste_hierarchy x3/partnership), minus pagination (this export always
// returns the full filtered set) and minus the search/wasteTypeId/
// wasteGroupId/wasteCharacteristicsId extra filters that only
// getWasteBagExportForExcel (a different, not-yet-ported export) uses.
export async function findWasteTrackingBagsForExport(
  params: WasteTrackingExportFilters
): Promise<Record<string, unknown>[]> {
  const conditions = wasteTrackingExportConditions("wb", params);
  const whereSql = sql.join(conditions, sql` and `);

  const query = sql<{
    qrCode: string;
    wasteCode: string | null;
    wasteTypeName: string;
    wasteGroupName: string;
    wasteCharacteristicsName: string;
    wasteSource: string | null;
    transporterName: string | null;
    thirdPartyName: string | null;
    checkInDate: Date;
    storageMax: string | null;
    weightInKgs: string | null;
    firstName: string | null;
    wasteStatus: string;
    healthcareFacilityName: string | null;
  }>`
    select
      wb.waste_bag_qr_code_id as "qrCode",
      wcx.waste_code as "wasteCode",
      wt.name as "wasteTypeName",
      wgh.name as "wasteGroupName",
      wc.name as "wasteCharacteristicsName",
      case
        when ws.source_type = 'INTERNAL' then ws.internal_source_name
        when ws.source_type = 'INTERNAL_TREATMENT' then ws.internal_treatment_name::text
        else ws.external_healthcare_facility_name
      end as "wasteSource",
      wb.transporter_name as "transporterName",
      wb.third_party_name as "thirdPartyName",
      wb.created_at as "checkInDate",
      case when wb.waste_status = 'IN_COLD_STORAGE' then round(wcx.cold_storage_max_hours / 24.0)
           else round(wcx.temp_storage_max_hours / 24.0) end as "storageMax",
      wb.weight_in_kgs as "weightInKgs",
      u.firstname as "firstName",
      wb.waste_status as "wasteStatus",
      wb.healthcare_facility_name as "healthcareFacilityName"
    from waste_bag wb
    join waste_source ws on ws.id = wb.waste_source_id
    join waste_classification wcx on wcx.id = wb.waste_classification_id
    join waste_hierarchy wc on wc.id = wcx.waste_characteristics_id
    join waste_hierarchy wt on wt.id = wcx.waste_type_id
    join waste_hierarchy wgh on wgh.id = wcx.waste_group_id
    left join users u on u.user_uuid::text = wb.created_by
    where ${whereSql}
    order by wb.created_at asc
  `;

  const result = await query.execute(db);
  return result.rows as unknown as Record<string, unknown>[];
}
