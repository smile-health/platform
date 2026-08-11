// Postgres columns for table `waste_treatment_external_group` (mirrors
// infrastructure/database/models/WasteTreatmentExternalGroupModel.ts
// field-for-field):
//
//   id                                          bigint, unsigned, auto-increment, primary key
//   created_by                                  varchar(36), not null
//   updated_by                                  varchar(36), not null
//   total_bags_count                            integer, not null, default 1
//   total_weight_in_kgs                         integer, not null
//   treatment_provider_id                       integer, nullable
//   source_external_transportation_group_id     integer, not null (conceptually -> waste_transportation_external_group.id — sibling module "waste-transport-external-group" being ported in parallel)
//   treatment_operator_id                       varchar(36), nullable
//   transportation_status                       enum('STORED_FOR_TREATMENT','READY_FOR_TREATMENT','INCINERATION_IN_PROCESS','STERILIZATION_IN_PROCESS','INCINERATED','STERILISED','LANDFILLED','RECYCLED','DISPOSED','COLLECTED'), not null, default 'STORED_FOR_TREATMENT'
//   is_read_only                                boolean, not null, default false
//   group_id                                    varchar(36), not null (default false in the original model definition — almost certainly a copy-paste bug there since the column is a varchar, preserved as "no application-level default" here rather than guessed at)
//   created_at                                  timestamp, not null
//   updated_at                                  timestamp, not null
//   deleted_at                                  timestamp, nullable (paranoid soft-delete)
//   deleted_by                                  bigint, nullable
//
// Association: hasOne waste_transportation_external_group via
// waste_treatment_external_group_id FK, aliased `transportExternalGroup` in
// the original — that table belongs to the "waste-transport-external-group"
// sibling module being ported in parallel; only the two columns the original
// actually selects off it (transporter_operator_id, transporter_vehicle_id)
// are referenced below.
//
// Joined table `waste_bag` (not ported yet — see waste/waste-bag/, which IS
// ported but whose table isn't registered in the Kysely schema yet either).
// Columns referenced here, per waste-bag.repository.ts's documented list:
//   id, waste_bag_qr_code_id, waste_status, weight_in_kgs, created_at,
//   healthcare_facility_id, healthcare_facility_name, waste_status_updated_at,
//   waste_classification_id, transporter_id, transporter_name, third_party_id,
//   manifest_doc_number, manifest_doc_path, is_treated, waste_treatment_external_group_id
//
// Joined table `waste_classification` (already ported, see
// waste/waste-classification/) — only `id` is used here for the
// role-based `disposal_method` filter (see filterClassificationIdsByRole
// below); the full classification/hierarchy join used by the original for
// display (wasteType/wasteGroup/wasteCharacteristics) is left to the service
// layer to request from waste-classification's own module rather than
// duplicated here, once cross-module calls are wired up.
//
// None of waste_treatment_external_group / waste_transportation_external_group
// / waste_bag / waste_classification is registered in the Kysely schema yet
// — every query below is expected to fail to compile against `db` until
// those tables are wired in. That is the expected, ignorable class of tsc
// error for this file (per the module's task brief).

import { db } from "../../db/db";
import { isValidDate } from "../../shared/utils/date-range";
import type { PaginationMeta, WasteTreatmentExternalGroup, WasteTreatmentExternalGroupBag } from "./waste-treatment-external-group.types";
import * as classificationRepo from "../waste-classification/waste-classification.repository";
import type { WasteClassification } from "../waste-classification/waste-classification.types";

// ---------------------------------------------------------------------------
// Enrichment helpers below port apps/wms-service's shared utils
// (shared/utils/wasteClassificationSummary.ts, shared/utils/countProsessEvent.ts,
// shared/utils/wasteBagLogHistory.ts) which are duplicated verbatim across
// this module, waste-bag-treatment-group and waste-transport-external-group
// rather than factored into a shared file, since this port's task boundary
// restricts each agent to its own module directory.
// ---------------------------------------------------------------------------

// Mirrors buildBagWasteClassification(classification) from
// shared/utils/wasteClassificationSummary.ts. Our ported WasteClassification
// (see waste-classification.types.ts) already carries wasteCharacteristics as
// a full WasteHierarchySummary rather than the original's raw Sequelize
// association, so the nested object below is a subset projection of it
// (id/name/isActive/nameEn), matching the original's shape exactly —
// `isActive` is hardcoded true because waste-classification's join only ever
// attaches an already-`is_active = true`-filtered characteristics row (see
// that repository's baseSelectWithHierarchy comment).
function buildBagWasteClassification(classification?: WasteClassification | null): Record<string, unknown> | undefined {
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

// Mirrors buildGroupWasteClassificationSummary(classifications) — wasteType /
// wasteGroup come from the *first* valid classification in the list (not a
// dedup/merge across all of them); wasteCharacteristics is deduped by id
// across every classification in the group.
function buildGroupWasteClassificationSummary(classifications: Array<WasteClassification | null | undefined>): {
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
// preserved verbatim (including the unused `status` parameter and every
// literal rule/typo from the original — e.g. "goverment" spelling elsewhere
// in this port's role handling is a separate, unrelated occurrence).
function handleAnalisisProcessCount(
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

// Mirrors shared/utils/wasteBagLogHistory.ts's getWasteBagLogHistory, joined
// on the new (dual-write) waste_bag_qr_code column added by
// 20260703000002-rename_waste_bag_audit_trail_qr_code_column.js rather than
// the legacy waste_bag_id column (see db.ts's WasteBagAuditTrailTable
// comment) — both are varchar-compatible with waste_bag.waste_bag_qr_code_id,
// but waste_bag_qr_code is the column the migration intends reads to settle
// on once the expand/contract rename completes.
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

// Mirrors PartnerVehicleModel.findAll({ where: { entityId, transporterId } })
// used for the `vehicle` list in getWasteTreatmentExternalGroupByIdWithWasteBags.
// Queries the already-registered `partner_vehicle` table directly (see
// partnership/partner-vehicle/) rather than adding a findAll export there,
// since this port is restricted to its own module directory.
export async function findVehiclesByEntityAndTransporter(
  entityId?: number,
  transporterId?: number
): Promise<Record<string, unknown>[]> {
  if (!entityId || !transporterId) return [];
  const rows = await db
    .selectFrom("partner_vehicle")
    .selectAll()
    .where("entity_id", "=", entityId)
    .where("transporter_id", "=", transporterId)
    .where("deleted_at", "is", null)
    .execute();
  return rows.map((r) => ({
    id: r.id,
    entityId: r.entity_id,
    vehicleType: r.vehicle_type,
    vehicleNumber: r.vehicle_number,
    capacityInKgs: r.capacity_in_kgs,
    transporterId: r.transporter_id ?? undefined,
  }));
}

export { buildBagWasteClassification, buildGroupWasteClassificationSummary, handleAnalisisProcessCount };

// Zod already validates transportationStatus against its enum before this is
// called (see waste-treatment-external-group.schema.ts) — this cast just
// tells Kysely the wire string is one of the enum's members, same pattern as
// asset-model.repository.ts's toAssetType helper.
function toTransportationStatus(
  value: string
): "STORED_FOR_TREATMENT" | "READY_FOR_TREATMENT" | "INCINERATION_IN_PROCESS" | "STERILIZATION_IN_PROCESS" | "INCINERATED" | "STERILISED" | "LANDFILLED" | "RECYCLED" | "DISPOSED" | "COLLECTED" {
  return value as never;
}

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string;
  total_bags_count: number;
  total_weight_in_kgs: number;
  treatment_provider_id: number | null;
  source_external_transportation_group_id: number;
  treatment_operator_id: string | null;
  transportation_status: string;
  is_read_only: boolean;
  group_id: string;
  created_at: Date;
  updated_at: Date;
}): WasteTreatmentExternalGroup {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalBagsCount: row.total_bags_count,
    totalWeightInKgs: row.total_weight_in_kgs,
    treatmentProviderId: row.treatment_provider_id ?? undefined,
    sourceExternalTransportationGroupId: row.source_external_transportation_group_id,
    treatmentOperatorId: row.treatment_operator_id ?? undefined,
    transportationStatus: row.transportation_status,
    isReadOnly: row.is_read_only,
    groupId: row.group_id,
  };
}

export async function findById(id: number): Promise<WasteTreatmentExternalGroup | null> {
  const row = await db
    .selectFrom("waste_treatment_external_group")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors getWasteTreatmentExternalGroupByIdWithWasteBags's `include:
// { model: WasteBagModel, required: true, where: { wasteBagQrCodeId: qrCodeId
// (if given) } }` — an inner join, so a group with no matching bags (or none
// at all) yields no row, same as the original's findOne returning null.
export async function findGroupBagRows(params: {
  groupId?: number;
  qrCodeId?: string;
}): Promise<
  Array<{
    group: WasteTreatmentExternalGroup;
    transporterOperatorId?: string;
    transporterVehicleId?: number;
    bag: WasteTreatmentExternalGroupBag & {
      wasteClassificationId: number;
      healthcareFacilityId: number;
      transporterId?: number;
      isTreated?: boolean;
      wasteGroupIds?: string;
      treatmentLocationId?: number;
    };
  }>
> {
  let query = db
    .selectFrom("waste_treatment_external_group as wteg")
    .innerJoin("waste_bag as wb", "wb.waste_treatment_external_group_id", "wteg.id")
    .leftJoin("waste_transportation_external_group as wteg_transport", "wteg_transport.waste_treatment_external_group_id", "wteg.id")
    .where("wteg.deleted_at", "is", null);

  if (params.groupId) {
    query = query.where("wteg.id", "=", params.groupId);
  }
  if (params.qrCodeId) {
    query = query.where("wb.waste_bag_qr_code_id", "=", params.qrCodeId);
  }

  const rows = await query
    .select([
      "wteg.id as group_id_col",
      "wteg.created_by",
      "wteg.updated_by",
      "wteg.total_bags_count",
      "wteg.total_weight_in_kgs",
      "wteg.treatment_provider_id",
      "wteg.source_external_transportation_group_id",
      "wteg.treatment_operator_id",
      "wteg.transportation_status",
      "wteg.is_read_only",
      "wteg.group_id",
      "wteg.created_at",
      "wteg.updated_at",
      "wteg_transport.transporter_operator_id",
      "wteg_transport.transporter_vehicle_id",
      "wb.id as bag_id",
      "wb.waste_bag_qr_code_id",
      "wb.waste_status",
      "wb.weight_in_kgs",
      "wb.created_at as bag_created_at",
      "wb.healthcare_facility_id",
      "wb.healthcare_facility_name",
      "wb.waste_status_updated_at",
      "wb.waste_classification_id",
      "wb.transporter_id",
      "wb.third_party_id",
      "wb.manifest_doc_number",
      "wb.manifest_doc_path",
      "wb.is_treated",
      "wb.waste_group_ids",
      "wb.treatment_location_id",
    ])
    .execute();

  return rows.map((row: any) => ({
    group: toEntity({
      id: row.group_id_col,
      created_by: row.created_by,
      updated_by: row.updated_by,
      total_bags_count: row.total_bags_count,
      total_weight_in_kgs: row.total_weight_in_kgs,
      treatment_provider_id: row.treatment_provider_id,
      source_external_transportation_group_id: row.source_external_transportation_group_id,
      treatment_operator_id: row.treatment_operator_id,
      transportation_status: row.transportation_status,
      is_read_only: row.is_read_only,
      group_id: row.group_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
    transporterOperatorId: row.transporter_operator_id ?? undefined,
    transporterVehicleId: row.transporter_vehicle_id ?? undefined,
    bag: {
      id: row.bag_id,
      wasteBagQrCodeId: row.waste_bag_qr_code_id,
      wasteStatus: row.waste_status,
      weightInKgs: row.weight_in_kgs ?? undefined,
      createdAt: row.bag_created_at,
      healthcareFacilityId: row.healthcare_facility_id,
      healthcareFacilityName: row.healthcare_facility_name ?? undefined,
      wasteStatusUpdatedAt: row.waste_status_updated_at ?? undefined,
      wasteClassificationId: row.waste_classification_id,
      transporterId: row.transporter_id ?? undefined,
      thirdPartyId: row.third_party_id ?? undefined,
      manifestDocNumber: row.manifest_doc_number ?? undefined,
      manifestDocPath: row.manifest_doc_path ?? null,
      isTreated: row.is_treated ?? undefined,
      wasteGroupIds: row.waste_group_ids ?? undefined,
      treatmentLocationId: row.treatment_location_id ?? undefined,
    },
  }));
}

// Role-based disposal_method filter on waste_classification, mirroring the
// original's `wasteClassificationWhere` switch (operator_landfill ->
// disposalMethod LIKE '%TRANSPORTER_LANDFILL%'; operator_treatment ->
// '%TRANSPORTER_TREATMENT%' OR '%TRANSPORTER%'; operator_recycler ->
// '%TRANSPORTER_RECYCLER%'; operator_waste_bank ->
// '%TRANSPORTER_GOVERNMENT_WASTE_BANK%' — reachable in the domain's type but
// NOT in the controller's allow-list, so effectively dead in practice, same
// as upstream). Ported to Postgres ILIKE per convention (original used
// Sequelize Op.like against MySQL, case-insensitive there by default).
export async function findClassificationIdsByRole(
  role: "operator_landfill" | "operator_treatment" | "operator_recycler" | "operator_waste_bank"
): Promise<number[]> {
  const patterns: Record<string, string[]> = {
    operator_landfill: ["%TRANSPORTER_LANDFILL%"],
    operator_treatment: ["%TRANSPORTER_TREATMENT%", "%TRANSPORTER%"],
    operator_recycler: ["%TRANSPORTER_RECYCLER%"],
    operator_waste_bank: ["%TRANSPORTER_GOVERNMENT_WASTE_BANK%"],
  };
  const terms = patterns[role] ?? [];
  if (terms.length === 0) return [];

  const rows = await db
    .selectFrom("waste_classification")
    .select("id")
    .where((eb) => eb.or(terms.map((term) => eb("disposal_method", "ilike", term))))
    .execute();
  return rows.map((r: any) => r.id as number);
}

export async function findAllPaginated(params: {
  limit: number;
  page: number;
  startDate?: Date;
  endDate?: Date;
  entityId?: number;
  healthcareFacilityId?: number;
  wasteStatuses: string[];
  wasteClassificationIds: number[];
  transportationStatus?: string;
}): Promise<{
  data: Array<{
    group: WasteTreatmentExternalGroup;
    bags: Array<WasteTreatmentExternalGroupBag & { wasteClassificationId: number; healthcareFacilityId: number; transporterId?: number; transporterName?: string }>;
  }>;
  pagination: PaginationMeta;
}> {
  let query = db.selectFrom("waste_treatment_external_group as wteg").where("wteg.deleted_at", "is", null);

  if (isValidDate(params.startDate) && isValidDate(params.endDate)) {
    // Original: created_at >= startDate AND created_at < endDate + 1 day.
    const endExclusive = new Date(params.endDate);
    endExclusive.setDate(endExclusive.getDate() + 1);
    query = query.where("wteg.created_at", ">=", params.startDate).where("wteg.created_at", "<", endExclusive);
  }
  if (params.transportationStatus) {
    query = query.where("wteg.transportation_status", "=", toTransportationStatus(params.transportationStatus));
  }

  // The required (inner-join) waste_bag relation carries the entityId /
  // healthcareFacilityId / wasteStatus / wasteClassificationId filters in the
  // original — mirrored here as an EXISTS-style inner join rather than a
  // subquery, then counted with DISTINCT on the group id (matches
  // findAndCountAll's `distinct: true`).
  let joined = query.innerJoin("waste_bag as wb", "wb.waste_treatment_external_group_id", "wteg.id");

  if (params.entityId) {
    joined = joined.where((eb) =>
      eb.or([
        eb("wb.healthcare_facility_id", "=", params.entityId!),
        eb("wb.transporter_id", "=", params.entityId!),
        eb("wb.third_party_id", "=", params.entityId!),
      ])
    );
  }
  if (params.healthcareFacilityId) {
    joined = joined.where("wb.healthcare_facility_id", "=", params.healthcareFacilityId);
  }
  if (params.wasteStatuses.length > 0) {
    joined = joined.where("wb.waste_status", "in", params.wasteStatuses);
  }
  if (params.wasteClassificationIds.length > 0) {
    joined = joined.where("wb.waste_classification_id", "in", params.wasteClassificationIds);
  }

  const countRow = await joined
    .select((eb) => eb.fn.count<string>("wteg.id").distinct().as("count"))
    .executeTakeFirst();
  const total = Number((countRow as any)?.count ?? 0);

  const groupIdRows = await joined
    .select("wteg.id")
    .distinct()
    .orderBy("wteg.updated_at", "desc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();
  const groupIds = groupIdRows.map((r: any) => r.id as number);

  if (groupIds.length === 0) {
    return { data: [], pagination: { total: 0, pages: 0, currentPage: params.page, perPage: params.limit } };
  }

  const rows = await db
    .selectFrom("waste_treatment_external_group as wteg")
    .innerJoin("waste_bag as wb", "wb.waste_treatment_external_group_id", "wteg.id")
    .where("wteg.id", "in", groupIds)
    .select([
      "wteg.id as group_id_col",
      "wteg.created_by",
      "wteg.updated_by",
      "wteg.total_bags_count",
      "wteg.total_weight_in_kgs",
      "wteg.treatment_provider_id",
      "wteg.source_external_transportation_group_id",
      "wteg.treatment_operator_id",
      "wteg.transportation_status",
      "wteg.is_read_only",
      "wteg.group_id",
      "wteg.created_at",
      "wteg.updated_at",
      "wb.id as bag_id",
      "wb.waste_bag_qr_code_id",
      "wb.waste_status",
      "wb.weight_in_kgs",
      "wb.created_at as bag_created_at",
      "wb.healthcare_facility_id",
      "wb.healthcare_facility_name",
      "wb.waste_status_updated_at",
      "wb.waste_classification_id",
      "wb.transporter_id",
      "wb.transporter_name",
      "wb.third_party_id",
    ])
    .execute();

  const groupsById = new Map<number, { group: WasteTreatmentExternalGroup; bags: any[] }>();
  for (const row of rows as any[]) {
    const existing = groupsById.get(row.group_id_col);
    const bag = {
      id: row.bag_id,
      wasteBagQrCodeId: row.waste_bag_qr_code_id,
      wasteStatus: row.waste_status,
      weightInKgs: row.weight_in_kgs ?? undefined,
      createdAt: row.bag_created_at,
      healthcareFacilityId: row.healthcare_facility_id,
      healthcareFacilityName: row.healthcare_facility_name ?? undefined,
      wasteStatusUpdatedAt: row.waste_status_updated_at ?? undefined,
      wasteClassificationId: row.waste_classification_id,
      transporterId: row.transporter_id ?? undefined,
      transporterName: row.transporter_name ?? undefined,
      thirdPartyId: row.third_party_id ?? undefined,
    };
    if (existing) {
      existing.bags.push(bag);
    } else {
      groupsById.set(row.group_id_col, {
        group: toEntity({
          id: row.group_id_col,
          created_by: row.created_by,
          updated_by: row.updated_by,
          total_bags_count: row.total_bags_count,
          total_weight_in_kgs: row.total_weight_in_kgs,
          treatment_provider_id: row.treatment_provider_id,
          source_external_transportation_group_id: row.source_external_transportation_group_id,
          treatment_operator_id: row.treatment_operator_id,
          transportation_status: row.transportation_status,
          is_read_only: row.is_read_only,
          group_id: row.group_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }),
        bags: [bag],
      });
    }
  }

  // Preserve the DISTINCT groupIds ordering (by updated_at desc) that drove
  // the LIMIT/OFFSET page window above.
  const data = groupIds.map((id) => groupsById.get(id)!).filter(Boolean);

  return {
    data,
    pagination: {
      total,
      pages: Math.ceil(total / params.limit),
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}
