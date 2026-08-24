// Postgres columns for table `waste_transportation_external_group` (mirrors
// infrastructure/database/models/WasteTransportationExternalGroupModel.ts
// field-for-field):
//
//   id                                    bigint, unsigned, auto-increment, primary key
//   created_by                           varchar(36), not null
//   updated_by                           varchar(36), not null
//   total_bags_count                     integer, not null, default 1
//   total_weight_in_kgs                  integer, not null
//   transporter_id                       integer, unsigned, not null (FK -> entities.id)
//   transporter_vehicle_id                integer, unsigned, nullable (FK -> partner_vehicle.id)
//   transporter_operator_id              varchar(36), nullable
//   treatment_provider_id                integer, unsigned, nullable
//   treatment_operator_id                varchar(36), nullable
//   handover_lattitude                   float(10,6), nullable
//   handover_longitude                   float(10,6), nullable
//   handover_timestamp                   timestamp(3), nullable
//   transportation_status                enum('READY_FOR_TRANSPORT','TRANSPORTATION_REQUEST_CREATED','IN_TRANSIT'), not null, default 'READY_FOR_TRANSPORT'
//   is_read_only                         boolean, not null, default false
//   group_id                             varchar(36), not null (prefix encodes provider type: 1EX- TRANSPORTER_TREATMENT, 2EX- TRANSPORTER_LANDFILL, 3EX- TRANSPORTER_RECYCLER, 4EX- SPECIALIZED_TREATMENT_PROVIDER, 5EX- TRANSPORTER_GOVERNMENT, 6EX- TRANSPORTER_GOVERNMENT_WASTE_BANK — see generateWasteGroupId)
//   waste_treatment_external_group_id    integer, nullable (FK -> the sibling waste-treatment-external-group module, built in parallel)
//   pickup_at                            timestamp(3), nullable
//   created_at                           timestamp, not null
//   updated_at                           timestamp, not null
//   deleted_at                           timestamp, nullable (paranoid soft-delete)
//   deleted_by                           bigint, nullable
//
// Columns read (join only, read-only in this module) on `waste_bag` — this
// table isn't ported yet either, same as waste_transportation_external_group
// itself:
//
//   id                                     bigint, unsigned, primary key
//   waste_transportation_external_group_id integer, nullable (FK, the join key used here)
//   waste_bag_qr_code_id                   varchar(36), nullable
//   waste_status                           enum (many values — see allowedStatusValues in .schema.ts), not null
//   waste_status_updated_at                timestamp, nullable
//   weight_in_kgs                          float, nullable
//   healthcare_facility_id                 integer, unsigned, nullable
//   healthcare_facility_name               varchar(255), nullable
//   transporter_id                         integer, unsigned, nullable
//   transporter_name                       varchar(255), nullable
//   third_party_id                         integer, unsigned, nullable
//   waste_classification_id                integer, nullable
//   created_at                             timestamp, not null
//   deleted_at                             timestamp, nullable (paranoid soft-delete)
//
// Neither table is registered in the Kysely schema yet — expect
// table-not-found tsc errors below, same as every other waste/* repository
// ported so far; ignore those specifically.
//
// This module DOES wire up the original's post-query enrichment steps below
// (see toEntity): waste classification summaries, partnership lookups,
// PartnerVehicleModel rows, and provider/consumer entity names — all from
// local tables rather than the original's HTTP round-trips. Per-bag log
// history and presigned manifest URLs aren't applicable here (no
// manifestDocPath field on this module's bags).

import { db } from "../db";
import { isValidDate } from "../../../shared/utils/date-range";
import type { PaginationMeta, TransportationStatus, WasteTransportExternalGroup, WasteTransportExternalGroupBag } from "./waste-transport-external-group.types";
import * as classificationRepo from "../waste-classification/waste-classification.repository";
import type { WasteClassification } from "../waste-classification/waste-classification.types";
import * as partnerVehicleRepo from "../../partnership/partner-vehicle/partner-vehicle.repository";
import { getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId } from "../../partnership/partnership/partnership.service";

function toTransportationStatus(value: string): TransportationStatus {
  return value as TransportationStatus;
}

// ---------------------------------------------------------------------------
// Enrichment helpers ported from apps/wms-service's shared utils — see
// waste-treatment-external-group.repository.ts's copy for full per-function
// commentary (duplicated verbatim across all three sibling modules per this
// port's per-directory task boundary).
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
  wasteType?: Record<string, unknown>;
  wasteGroup?: Record<string, unknown>;
  wasteCharacteristics: Record<string, unknown>[];
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

// Mirrors getEntityDetail()'s local-table path (infrastructure/external-apis/
// thirdPartyClient.ts): the original checks a Redis cache, then
// `EntitiesModel.findByPk(entityId)` against the local `entities` table (also
// registered in wms-encore's Kysely schema, see db.ts's EntitiesTable), and
// only falls back to an HTTP call to apps/core
// (`${SMILE_BE_URL}/core/entities/${entityId}`) if the row isn't found
// locally. This port implements the local-table path (skips the Redis cache —
// a pure performance optimization, not behavior — and the HTTP fallback,
// which needs a cross-service client this codebase doesn't have yet, see
// task brief). If entityId isn't present in the local `entities` table, this
// returns undefined rather than reaching out to apps/core.
export async function getEntityName(entityId?: number): Promise<string | undefined> {
  if (!entityId) return undefined;
  const row = await db.selectFrom("entities").select("name").where("id", "=", entityId).executeTakeFirst();
  return row?.name ?? undefined;
}

// Mirrors PartnerVehicleModel.findAll({ where: { entityId, transporterId } })
// — queries the already-registered `partner_vehicle` table directly (see
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

export { classificationRepo };

interface GroupRow {
  id: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
  total_bags_count: number;
  total_weight_in_kgs: number;
  transporter_id: number;
  transporter_vehicle_id: number | null;
  transporter_operator_id: string | null;
  treatment_provider_id: number | null;
  treatment_operator_id: string | null;
  handover_lattitude: number | null;
  handover_longitude: number | null;
  handover_timestamp: Date | null;
  transportation_status: string;
  is_read_only: boolean;
  group_id: string;
  waste_treatment_external_group_id: number | null;
  pickup_at: Date | null;
}

interface BagRow {
  id: number;
  waste_bag_qr_code_id: string | null;
  waste_status: string;
  weight_in_kgs: number | null;
  created_at: Date;
  healthcare_facility_id: number | null;
  healthcare_facility_name: string | null;
  transporter_id: number | null;
  transporter_name: string | null;
  third_party_id: number | null;
  waste_classification_id: number | null;
  is_treated: boolean | null;
  waste_group_ids: string | null;
}

function toBagEntity(row: BagRow): WasteTransportExternalGroupBag & { isTreated?: boolean; wasteGroupIds?: string } {
  return {
    id: row.id,
    wasteBagQrCodeId: row.waste_bag_qr_code_id ?? undefined,
    wasteStatus: row.waste_status,
    weightInKgs: row.weight_in_kgs ?? undefined,
    createdAt: row.created_at,
    healthcareFacilityId: row.healthcare_facility_id ?? undefined,
    healthcareFacilityName: row.healthcare_facility_name ?? undefined,
    transporterId: row.transporter_id ?? undefined,
    transporterName: row.transporter_name ?? undefined,
    thirdPartyId: row.third_party_id ?? undefined,
    wasteClassificationId: row.waste_classification_id ?? undefined,
    isTreated: row.is_treated ?? undefined,
    wasteGroupIds: row.waste_group_ids ?? undefined,
  };
}

// Mirrors getWasteTransportExternalGroupByIdWithWasteBags/
// getAllWasteTransportExternalGroup's full enrichment pass: per-bag
// wasteClassification (buildBagWasteClassification), group-level
// wasteType/wasteGroup/wasteCharacteristics (buildGroupWasteClassificationSummary),
// providerName/consumerName (getEntityDetail, here the local-`entities`-table
// path — see getEntityName above), vehicle list (PartnerVehicleModel.findAll),
// transporterVehicleNumber (the `partnerVehicle` association -> vehicleNumber),
// and processWastebagEnd (handleAnalisisProcessCount, sourced from the
// *first* bag exactly like the original). partnership comes from
// partnership.service.ts's getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId,
// backed by the local `entities`/`users`/`partnership` tables.
async function toEntity(row: GroupRow, bags: WasteTransportExternalGroupBag[]): Promise<WasteTransportExternalGroup> {
  const firstBag = bags[0] as (WasteTransportExternalGroupBag & { isTreated?: boolean; wasteGroupIds?: string }) | undefined;

  const classificationIds = [...new Set(bags.map((b) => b.wasteClassificationId).filter((id): id is number => Boolean(id)))];
  const classifications = await Promise.all(classificationIds.map((id) => classificationRepo.findById(id)));
  const classificationById = new Map(classifications.filter(Boolean).map((c) => [c!.id, c!]));

  const wasteBags = bags.map((bag) => ({
    ...bag,
    wasteClassification: buildBagWasteClassification(classificationById.get(bag.wasteClassificationId ?? -1)),
  }));

  const summary = buildGroupWasteClassificationSummary([...classificationById.values()]);

  const [providerName, consumerName, vehicle, partnerVehicle, partnership] = await Promise.all([
    getEntityName(firstBag?.healthcareFacilityId),
    getEntityName(firstBag?.transporterId),
    findVehiclesByEntityAndTransporter(firstBag?.healthcareFacilityId, firstBag?.transporterId),
    // Original: the `partnerVehicle` association on the group row itself
    // (attrs: ['vehicleNumber']), keyed by transporter_vehicle_id.
    row.transporter_vehicle_id ? partnerVehicleRepo.findById(row.transporter_vehicle_id) : Promise.resolve(null),
    firstBag?.healthcareFacilityId && firstBag?.wasteClassificationId
      ? getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId({
          healthcareFacilityId: firstBag.healthcareFacilityId,
          wasteClassificationId: firstBag.wasteClassificationId,
          transporterId: firstBag.transporterId,
          thirdPartyId: firstBag.thirdPartyId,
        })
      : Promise.resolve(null),
  ]);

  const primaryClassification = classificationById.get(firstBag?.wasteClassificationId ?? -1);
  const processWastebagEnd = firstBag
    ? handleAnalisisProcessCount(
        primaryClassification?.disposalMethod ?? undefined,
        primaryClassification?.treatmentMethod ?? undefined,
        firstBag.isTreated,
        firstBag.wasteGroupIds,
        firstBag.wasteStatus
      )
    : undefined;

  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalBagsCount: row.total_bags_count,
    totalWeightInKgs: row.total_weight_in_kgs,
    transporterId: row.transporter_id,
    transporterVehicleId: row.transporter_vehicle_id ?? undefined,
    transporterVehicleNumber: partnerVehicle?.vehicleNumber,
    transporterOperatorId: row.transporter_operator_id ?? undefined,
    treatmentProviderId: row.treatment_provider_id ?? undefined,
    treatmentOperatorId: row.treatment_operator_id ?? undefined,
    handoverLattitude: row.handover_lattitude ?? undefined,
    handoverLongitude: row.handover_longitude ?? undefined,
    transportationStatus: toTransportationStatus(row.transportation_status),
    handoverTimestamp: row.handover_timestamp ?? undefined,
    isReadOnly: row.is_read_only,
    groupId: row.group_id,
    wasteTreatmentExternalGroupId: row.waste_treatment_external_group_id ?? undefined,
    pickupAt: row.pickup_at ?? undefined,
    // Original: providerName from the healthcare facility's entity name,
    // consumerName from the transporter's entity name (`getEntityDetail(hf).name`
    // / `getEntityDetail(transporter).name`) — this port's earlier scaffold
    // had these swapped (and stood in with the bag's own denormalized
    // transporterName/healthcareFacilityName columns rather than a real
    // entity lookup); fixed here to match the original's hf->provider,
    // transporter->consumer direction, now backed by a real (local-table)
    // entities lookup instead of the placeholder swap.
    providerName,
    consumerName,
    wasteBags,
    wasteType: summary.wasteType,
    wasteGroup: summary.wasteGroup,
    wasteCharacteristics: summary.wasteCharacteristics,
    partnership: (partnership ?? undefined) as unknown as Record<string, unknown> | undefined,
    vehicle,
    processWastebagEnd,
  };
}

// Mirrors getAllWasteTransportExternalGroup's groupIdPattern switch, used to
// filter by group_id prefix when `treatment` (externalTreatment) is given.
function groupIdPatternFor(externalTreatment?: string): string | undefined {
  switch (externalTreatment) {
    case "TRANSPORTER_LANDFILL":
      return "2EX-";
    case "TRANSPORTER_RECYCLER":
      return "3EX-";
    case "SPECIALIZED_TREATMENT_PROVIDER":
      return "4EX-";
    case "TRANSPORTER_GOVERNMENT":
      return "5EX-";
    case "TRANSPORTER_GOVERNMENT_WASTE_BANK":
      return "6EX-";
    case "TRANSPORTER_TREATMENT":
      return "1EX-";
    default:
      return undefined;
  }
}

export interface FindPaginatedParams {
  limit: number;
  page: number;
  entityId?: number;
  healthcareFacilityId?: number;
  startDate?: Date;
  endDate?: Date;
  transportationStatus?: string;
  externalTreatment?: string;
  wasteStatuses: string[];
}

export async function findPaginated(
  params: FindPaginatedParams
): Promise<{ data: WasteTransportExternalGroup[]; pagination: PaginationMeta }> {
  const groupIdPattern = groupIdPatternFor(params.externalTreatment);

  let idQuery = db
    .selectFrom("waste_transportation_external_group as wtpeg")
    .innerJoin("waste_bag as wb", "wb.waste_transportation_external_group_id", "wtpeg.id")
    .where("wtpeg.deleted_at", "is", null)
    .where("wb.deleted_at", "is", null);

  if (params.entityId) {
    idQuery = idQuery.where((eb) =>
      eb.or([
        eb("wb.healthcare_facility_id", "=", params.entityId!),
        eb("wb.transporter_id", "=", params.entityId!),
        eb("wb.third_party_id", "=", params.entityId!),
      ])
    );
  }
  if (params.healthcareFacilityId) {
    idQuery = idQuery.where("wb.healthcare_facility_id", "=", params.healthcareFacilityId);
  }
  if (params.wasteStatuses.length > 0) {
    idQuery = idQuery.where("wb.waste_status", "in", params.wasteStatuses);
  }
  if (isValidDate(params.startDate) && isValidDate(params.endDate)) {
    idQuery = idQuery.where("wtpeg.created_at", ">=", params.startDate).where("wtpeg.created_at", "<", params.endDate);
  }
  if (groupIdPattern) {
    idQuery = idQuery.where("wtpeg.group_id", "like", `${groupIdPattern}%`);
  }
  if (params.transportationStatus) {
    idQuery = idQuery.where("wtpeg.transportation_status", "=", toTransportationStatus(params.transportationStatus));
  }

  const countRow = await idQuery
    .select((eb) => eb.fn.count<string>("wtpeg.id").distinct().as("count"))
    .executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  if (total === 0) {
    return { data: [], pagination: { total: 0, pages: 0, currentPage: params.page, perPage: params.limit } };
  }

  const idRows = await idQuery
    .select("wtpeg.id")
    .groupBy("wtpeg.id")
    .orderBy("wtpeg.updated_at", "desc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();
  const ids = idRows.map((r) => r.id);

  const groups = await db
    .selectFrom("waste_transportation_external_group")
    .selectAll()
    .where("id", "in", ids)
    .where("deleted_at", "is", null)
    .orderBy("updated_at", "desc")
    .execute();

  const bags = await db
    .selectFrom("waste_bag")
    .selectAll()
    .where("waste_transportation_external_group_id", "in", ids)
    .where("deleted_at", "is", null)
    .execute();

  const bagsByGroup = new Map<number, WasteTransportExternalGroupBag[]>();
  for (const bag of bags as unknown as (BagRow & { waste_transportation_external_group_id: number })[]) {
    const list = bagsByGroup.get(bag.waste_transportation_external_group_id) ?? [];
    list.push(toBagEntity(bag));
    bagsByGroup.set(bag.waste_transportation_external_group_id, list);
  }

  const data = await Promise.all(
    (groups as unknown as GroupRow[]).map((row) => toEntity(row, bagsByGroup.get(row.id) ?? []))
  );

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

export async function findByIdWithBags(params: { id?: number; qrCodeId?: string }): Promise<WasteTransportExternalGroup | null> {
  let query = db.selectFrom("waste_transportation_external_group").selectAll().where("deleted_at", "is", null);
  if (params.id) {
    query = query.where("id", "=", params.id);
  }

  const row = (await query.executeTakeFirst()) as GroupRow | undefined;
  if (!row) return null;

  let bagQuery = db
    .selectFrom("waste_bag")
    .selectAll()
    .where("waste_transportation_external_group_id", "=", row.id)
    .where("deleted_at", "is", null);
  if (params.qrCodeId) {
    bagQuery = bagQuery.where("waste_bag_qr_code_id", "=", params.qrCodeId);
  }
  const bagRows = (await bagQuery.execute()) as unknown as BagRow[];

  // Original requires at least one matching bag (Sequelize `include`
  // `required: true`) — a group with no bags matching the qrCodeId filter is
  // treated as not found.
  if (bagRows.length === 0) return null;

  return toEntity(row, bagRows.map(toBagEntity));
}
