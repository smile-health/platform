// Postgres columns for table `waste_transportation_group` (mirrors
// infrastructure/database/models/WasteTransportationGroupModel.ts field-for-field):
//
//   id                       bigint, unsigned, auto-increment, primary key
//   created_by               varchar(36), not null
//   updated_by               varchar(36), not null
//   total_bags_count         integer, not null, default 1
//   total_weight_in_kgs      integer, not null
//   transporter_vehicle_id   integer, unsigned, nullable (conceptually -> partner_vehicle.id,
//                             no FK constraint in the original model; partner_vehicle is
//                             already ported, see partnership/partner-vehicle/)
//   transporter_operator_id  varchar(36), nullable
//   handover_lattitude       float(10,6), nullable (original's misspelling, preserved verbatim)
//   handover_longitude       float(10,6), nullable
//   transportation_status    enum('READY_FOR_TRANSPORT','TRANSPORTATION_REQUEST_CREATED'),
//                             not null, default 'READY_FOR_TRANSPORT'
//   handover_timestamp       timestamp(3), nullable, default null
//   is_read_only             boolean, not null, default false
//   group_id                 varchar(36), not null (despite `defaultValue: false` in the
//                             original model — a copy-paste bug there; a boolean default on a
//                             varchar column. Preserved as documentation only; not replicated
//                             since Kysely writes always supply an explicit value here)
//   created_at                timestamp, not null
//   updated_at                timestamp, not null
//   deleted_at                timestamp, nullable (paranoid soft-delete)
//   deleted_by                bigint, nullable
//
// Related tables (waste_bag, waste_classification, waste_bag_audit_trail,
// partner_vehicle) are now all registered/ported — see findBagsForGroup,
// findClassificationForFirstBag, findVehicleForGroup below, which wire the
// original's waste-bag/waste-classification/vehicle enrichment for real.
//
// One piece of the original's getWasteTransportationGroupById enrichment is
// still NOT ported: presigned manifest_doc_path URLs, via
// InfraRegistry.s3FileServiceRepositoryImpl.getPresignedUrl — no MinIO/S3
// presigned-URL helper has been ported into wms-encore yet. Partnership
// provider/operator-name enrichment IS wired (see
// waste-transportation-group.service.ts), via partnership.service.ts's
// getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId.

import { db } from "../db";
import * as wasteClassificationRepo from "../waste-classification/waste-classification.repository";
import * as partnerVehicleRepo from "../../partnership/partner-vehicle/partner-vehicle.repository";
import type { WasteTransportationGroup, PaginationMeta } from "./waste-transportation-group.types";

// Zod already validates transportationStatus against its (buggy, mismatched)
// enum before this is called (see waste-transportation-group.schema.ts) —
// this cast just tells Kysely the wire string is one of the DB enum's actual
// members, same pattern as asset-model.repository.ts's toAssetType helper.
// NOTE: the DB enum only has 2 members, unrelated to the schema's 11-member
// enum — see schema.ts's note. Values outside these 2 will fail at the DB
// layer once the table/enum is wired; that mismatch is an original bug,
// preserved rather than silently reconciled.
function toTransportationStatus(value: string): "READY_FOR_TRANSPORT" | "TRANSPORTATION_REQUEST_CREATED" {
  return value as "READY_FOR_TRANSPORT" | "TRANSPORTATION_REQUEST_CREATED";
}

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string;
  total_bags_count: number;
  total_weight_in_kgs: number;
  transporter_vehicle_id: number | null;
  transporter_operator_id: string | null;
  handover_lattitude: number | null;
  handover_longitude: number | null;
  transportation_status: string;
  handover_timestamp: Date | null;
  is_read_only: boolean;
  group_id: string;
  created_at: Date;
  updated_at: Date;
}): WasteTransportationGroup {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalBagsCount: row.total_bags_count,
    totalWeightInKgs: row.total_weight_in_kgs,
    transporterVehicleId: row.transporter_vehicle_id ?? undefined,
    transporterOperatorId: row.transporter_operator_id ?? undefined,
    handoverLattitude: row.handover_lattitude ?? undefined,
    handoverLongitude: row.handover_longitude ?? undefined,
    transportationStatus: row.transportation_status,
    handoverTimestamp: row.handover_timestamp ?? undefined,
    isReadOnly: row.is_read_only,
    groupId: row.group_id,
  };
}

export async function findById(id: number): Promise<WasteTransportationGroup | null> {
  const row = await db
    .selectFrom("waste_transportation_group")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors WasteBagTransportGroupImpl.createWasteTransportationGroup. The
// totalBagsCount/totalWeightInKgs/groupId are now computed in service.ts from
// the actual waste bags fetched via findBagsByQrCodeIdsForGroup (mirroring
// the original), so this insert just persists whatever the caller passes in.
export async function create(payload: {
  createdBy: string;
  totalBagsCount: number;
  totalWeightInKgs: number;
  transporterVehicleId?: number;
  transporterOperatorId?: string;
  handoverLattitude?: number;
  handoverLongitude?: number;
  transportationStatus: string;
  handoverTimestamp?: Date;
  groupId: string;
}): Promise<WasteTransportationGroup> {
  // Mirrors the original: updated_by set to createdBy on create, not a
  // separately-supplied value (there isn't one at creation time).
  const row = await db
    .insertInto("waste_transportation_group")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      total_bags_count: payload.totalBagsCount,
      total_weight_in_kgs: payload.totalWeightInKgs,
      transporter_vehicle_id: payload.transporterVehicleId ?? null,
      transporter_operator_id: payload.transporterOperatorId ?? null,
      handover_lattitude: payload.handoverLattitude ?? null,
      handover_longitude: payload.handoverLongitude ?? null,
      // Original hardcodes 'READY_FOR_TRANSPORT' on create regardless of the
      // payload's transportationStatus — preserved verbatim.
      transportation_status: toTransportationStatus("READY_FOR_TRANSPORT"),
      handover_timestamp: payload.handoverTimestamp ?? null,
      group_id: payload.groupId,
      is_read_only: false,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

// Mirrors WasteBagTransportGroupImpl.createWasteTransportationGroup's own
// waste-bag lookup (InfraRegistry.wasteBagRepositoryImpl.getWasteBagsByIds),
// which queries WasteBagModel by `wasteBagQrCodeId: { [Op.in]: ids }` — i.e.
// despite the parameter's name ("wasteBagIds") and this port's zod schema
// validating them as positive integers, the original actually matches them
// against the *qr-code string* column, not the numeric primary key. Ported
// verbatim: the (numeric, per zod) ids are stringified and matched against
// waste_bag_qr_code_id.
export async function findBagsByQrCodeIdsForGroup(qrCodeIds: string[]): Promise<
  { id: number; weightInKgs: number | null; healthcareFacilityId: number; wasteClassificationId: number }[]
> {
  if (qrCodeIds.length === 0) return [];
  const rows = await db
    .selectFrom("waste_bag")
    .select(["id", "weight_in_kgs", "healthcare_facility_id", "waste_classification_id"])
    .where("waste_bag_qr_code_id", "in", qrCodeIds)
    .execute();
  return rows.map((row) => ({
    id: row.id,
    weightInKgs: row.weight_in_kgs != null ? Number(row.weight_in_kgs) : null,
    healthcareFacilityId: row.healthcare_facility_id,
    wasteClassificationId: row.waste_classification_id,
  }));
}

// Mirrors getWasteTransportationGroupById's waste_bag include (required:
// qrCodeId ? true : false, filtered by wasteBagQrCodeId = qrCodeId when
// given) plus its per-bag waste_bag_audit_trail "logHistory" include.
// Partnership enrichment happens in the service layer (see
// waste-transportation-group.service.ts), not here. manifestDocPath
// presigned-URL resolution (s3FileServiceRepositoryImpl) is still NOT
// ported — no S3/MinIO client exists in wms-encore yet.
export async function findBagsForGroup(
  groupId: number,
  qrCodeId?: string
): Promise<
  {
    id: number;
    wasteBagQrCodeId: string;
    healthcareFacilityId: number;
    wasteClassificationId: number;
    weightInKgs: number | null;
    manifestDocPath: string | null;
    logHistory: { id: number; previousStatus: string; newStatus: string; createdAt: Date }[];
  }[]
> {
  let query = db.selectFrom("waste_bag").where("waste_transportation_group_id", "=", groupId);
  if (qrCodeId) {
    query = query.where("waste_bag_qr_code_id", "=", qrCodeId);
  }
  const bags = await query
    .select([
      "id",
      "waste_bag_qr_code_id",
      "healthcare_facility_id",
      "waste_classification_id",
      "weight_in_kgs",
      "manifest_doc_path",
    ])
    .execute();
  if (bags.length === 0) return [];

  const bagIds = bags.map((bag) => bag.id);
  const auditRows = await db
    .selectFrom("waste_bag_audit_trail")
    .selectAll()
    .where("waste_bag_id", "in", bagIds)
    .execute();
  const auditByBagId = new Map<number, typeof auditRows>();
  for (const row of auditRows) {
    const list = auditByBagId.get(row.waste_bag_id) ?? [];
    list.push(row);
    auditByBagId.set(row.waste_bag_id, list);
  }

  return bags.map((bag) => ({
    id: bag.id,
    wasteBagQrCodeId: bag.waste_bag_qr_code_id,
    healthcareFacilityId: bag.healthcare_facility_id,
    wasteClassificationId: bag.waste_classification_id,
    weightInKgs: bag.weight_in_kgs != null ? Number(bag.weight_in_kgs) : null,
    manifestDocPath: bag.manifest_doc_path,
    logHistory: (auditByBagId.get(bag.id) ?? []).map((row) => ({
      id: row.id,
      previousStatus: row.previous_status,
      newStatus: row.new_status,
      createdAt: row.created_at,
    })),
  }));
}

// Mirrors the original's per-bag `treatmentMethod` lookup (a
// WasteClassificationModel.findAll({ attributes: ['id','treatmentMethod'] })
// over the group's distinct wasteClassificationIds) plus the single
// `WasteClassificationModel.findOne` (with wasteType/wasteGroup/
// wasteCharacteristics includes) keyed off the *first* bag's
// wasteClassificationId, reusing waste-classification's own
// findById/findTreatmentMethods query patterns rather than duplicating them.
export async function findClassificationForFirstBag(wasteClassificationId: number) {
  return wasteClassificationRepo.findById(wasteClassificationId);
}

export async function findTreatmentMethodsByClassificationIds(
  ids: number[]
): Promise<Map<number, string | null>> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .selectFrom("waste_classification")
    .select(["id", "treatment_method"])
    .where("id", "in", ids)
    .execute();
  return new Map(rows.map((row) => [row.id, row.treatment_method]));
}

// Mirrors `PartnerVehicleModel.findByPk(firstBag[0].transporterVehicleId)` —
// NOTE (deviation, documented): the original looks up the vehicle by a
// `transporterVehicleId` field read off the *waste bag* row, but WasteBagModel
// has no such column (see waste-bag.repository.ts's column list) — that
// lookup is dead code in the original (always `findByPk(undefined)` -> null).
// This port instead resolves the vehicle from the *group's own*
// transporter_vehicle_id column (the field that's actually meaningful here),
// reusing partner-vehicle's own findById.
export async function findVehicleForGroup(transporterVehicleId: number | null) {
  if (transporterVehicleId == null) return null;
  return partnerVehicleRepo.findById(transporterVehicleId);
}

// Mirrors getAllWasteTransportationGroups' pagination surface, including the
// original's join to `waste_bag` (required: true — i.e. only groups that
// have at least one matching bag) filtered by entityId
// (healthcare_facility_id OR transporter_id OR third_party_id) and status
// (waste_status), plus the created_at date-range filter applied to the
// group itself.
export async function findPaginated(params: {
  limit: number;
  page: number;
  date?: Date;
  entityId?: number;
  status?: string;
}): Promise<{ data: WasteTransportationGroup[]; pagination: PaginationMeta }> {
  let query = db.selectFrom("waste_transportation_group").where("deleted_at", "is", null);

  if (params.date) {
    const start = new Date(params.date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    query = query.where("created_at", ">=", start).where("created_at", "<", end);
  }

  // required: true join to waste_bag — only groups with >=1 matching bag are
  // returned, mirrored here via a WHERE EXISTS correlated subquery.
  if (params.entityId || params.status) {
    query = query.where((eb) =>
      eb.exists(
        eb
          .selectFrom("waste_bag")
          .select("waste_bag.id")
          .whereRef("waste_bag.waste_transportation_group_id", "=", "waste_transportation_group.id")
          .$if(!!params.entityId, (qb) =>
            qb.where((eb2) =>
              eb2.or([
                eb2("waste_bag.healthcare_facility_id", "=", params.entityId!),
                eb2("waste_bag.transporter_id", "=", params.entityId!),
                eb2("waste_bag.third_party_id", "=", params.entityId!),
              ])
            )
          )
          .$if(!!params.status, (qb) => qb.where("waste_bag.waste_status", "=", params.status as any))
      )
    );
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

export async function update(
  id: number,
  payload: {
    updatedBy: string;
    totalWeightInKgs: number;
    transporterVehicleId?: number;
    transporterOperatorId?: string;
    handoverLattitude?: number;
    handoverLongitude?: number;
    transportationStatus: string;
    handoverTimestamp?: Date;
  }
): Promise<WasteTransportationGroup | null> {
  const existing = await findById(id);
  if (!existing) return null;

  const row = await db
    .updateTable("waste_transportation_group")
    .set({
      updated_at: new Date(),
      updated_by: payload.updatedBy,
      // Original always re-persists the *existing* row's totalWeightInKgs
      // (`existingData.get('totalWeightInKgs') ?? existingData.totalWeightInKgs`)
      // rather than the incoming payload's — i.e. totalWeightInKgs can never
      // actually be updated via this endpoint, despite the schema requiring
      // it in the body. Preserved verbatim.
      total_weight_in_kgs: existing.totalWeightInKgs ?? payload.totalWeightInKgs,
      transporter_vehicle_id: payload.transporterVehicleId ?? null,
      transporter_operator_id: payload.transporterOperatorId ?? null,
      handover_lattitude: payload.handoverLattitude ?? null,
      handover_longitude: payload.handoverLongitude ?? null,
      transportation_status: toTransportationStatus(payload.transportationStatus),
      handover_timestamp: payload.handoverTimestamp ?? null,
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

  // Mirrors deleteWasteTransportationGroup: a plain (non-paranoid-aware)
  // `.update({ deletedBy })` followed by `.destroy()` — i.e. deletedBy is
  // persisted via a separate UPDATE, then the paranoid destroy sets
  // deleted_at. Equivalent single UPDATE here.
  await db
    .updateTable("waste_transportation_group")
    .set({ deleted_at: new Date(), deleted_by: deletedBy ?? null })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return true;
}
