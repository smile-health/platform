// Postgres columns for table `waste_transportation_request` (mirrors
// infrastructure/database/models/WasteTransportationRequestModel.ts
// field-for-field):
//
//   id                       bigint, unsigned, auto-increment, primary key
//   created_by               varchar(36), not null
//   updated_by               varchar(36), not null
//   request_status           enum('PENDING','ACCEPTED','REJECTED'), nullable
//   transportation_group_id  bigint, not null (FK -> waste_transportation_group.id,
//                             belongsTo `transportationGroup`; that table is being
//                             built in parallel in ../waste-transportation-group/ —
//                             not registered in Kysely yet either, see below)
//   request_creator_id       integer, nullable
//   request_approver_id      integer, nullable
//   created_at               timestamp, not null
//   updated_at               timestamp, not null
//   deleted_at               timestamp, nullable (paranoid soft-delete)
//   deleted_by               bigint, nullable
//
// Joined table `waste_transportation_group` (documented here only for the
// columns this module's getById/getAll joins actually select — see that
// sibling module's own repository.ts for the authoritative column list):
//
//   id, created_by, updated_by, created_at, updated_at, total_bags_count,
//   total_weight_in_kgs, transporter_vehicle_id, transporter_operator_id,
//   handover_lattitude, handover_longitude, transportation_status
//
// Both `waste_transportation_request` and `waste_transportation_group` are
// absent from the Kysely schema right now — expect tsc errors on both
// table names below, ignore them (this module's own table, plus the
// sibling table under active parallel development).

import { db } from "../../db/db";
import type {
  WasteTransportationRequest,
  WasteTransportationGroupSummary,
  PaginationMeta,
} from "./waste-transportation-request.types";

// Zod already validates requestStatus against its enum before this is called
// (see waste-transportation-request.schema.ts) — this cast just tells Kysely
// the wire string is one of the enum's members, same pattern as
// asset-model.repository.ts's toAssetType helper.
function toRequestStatus(value: string | undefined): "PENDING" | "ACCEPTED" | "REJECTED" | null {
  return (value ?? null) as "PENDING" | "ACCEPTED" | "REJECTED" | null;
}

function toGroupSummary(row: {
  transportation_group_id: number;
  group_id?: number | null;
  group_created_by?: string | null;
  group_updated_by?: string | null;
  total_bags_count?: number | null;
  total_weight_in_kgs?: number | null;
  transporter_vehicle_id?: number | null;
  transporter_operator_id?: string | null;
  handover_lattitude?: number | null;
  handover_longitude?: number | null;
  transportation_status?: string | null;
}): WasteTransportationGroupSummary | undefined {
  if (row.group_id === undefined || row.group_id === null) return undefined;
  return {
    id: row.group_id,
    createdBy: row.group_created_by ?? undefined,
    updatedBy: row.group_updated_by ?? undefined,
    totalBagsCount: row.total_bags_count ?? undefined,
    totalWeightInKgs: row.total_weight_in_kgs ?? undefined,
    transporterVehicleId: row.transporter_vehicle_id ?? undefined,
    transporterOperatorId: row.transporter_operator_id ?? undefined,
    handoverLattitude: row.handover_lattitude ?? undefined,
    handoverLongitude: row.handover_longitude ?? undefined,
    transportationStatus: row.transportation_status ?? undefined,
  };
}

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string;
  request_status: string | null;
  transportation_group_id: number;
  request_creator_id: number | null;
  request_approver_id: number | null;
  created_at: Date;
  updated_at: Date;
}): WasteTransportationRequest {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    requestStatus: row.request_status ?? undefined,
    transportationGroupId: row.transportation_group_id,
    requestCreatorId: row.request_creator_id ?? undefined,
    requestApproverId: row.request_approver_id ?? undefined,
  };
}

// Mirrors WasteTransportationRequestRepositoryImpl.getWasteTransportationRequestById's
// join with WasteTransportationGroupModel (required: false -> left join).
export async function findById(id: number): Promise<WasteTransportationRequest | null> {
  const row = await db
    .selectFrom("waste_transportation_request")
    .leftJoin(
      "waste_transportation_group",
      "waste_transportation_group.id",
      "waste_transportation_request.transportation_group_id"
    )
    .select([
      "waste_transportation_request.id",
      "waste_transportation_request.created_by",
      "waste_transportation_request.updated_by",
      "waste_transportation_request.request_status",
      "waste_transportation_request.transportation_group_id",
      "waste_transportation_request.request_creator_id",
      "waste_transportation_request.request_approver_id",
      "waste_transportation_request.created_at",
      "waste_transportation_request.updated_at",
      "waste_transportation_group.id as group_id",
      "waste_transportation_group.created_by as group_created_by",
      "waste_transportation_group.updated_by as group_updated_by",
      "waste_transportation_group.total_bags_count",
      "waste_transportation_group.total_weight_in_kgs",
      "waste_transportation_group.transporter_vehicle_id",
      "waste_transportation_group.transporter_operator_id",
      "waste_transportation_group.handover_lattitude",
      "waste_transportation_group.handover_longitude",
      "waste_transportation_group.transportation_status",
    ])
    .where("waste_transportation_request.id", "=", id)
    .where("waste_transportation_request.deleted_at", "is", null)
    .executeTakeFirst();
  if (!row) return null;
  return {
    ...toEntity(row),
    transportationGroup: toGroupSummary(row),
  };
}

// Existence-only guard used by create/update (mirrors the use-cases' call to
// WasteTransportationGroupRepository.getWasteTransportationGroupById before
// writing — the group module lives in ../waste-transportation-group/, this
// is a direct existence check against its table rather than importing that
// module's repository, so this module doesn't take on a hard compile-time
// dependency on work being built in parallel).
export async function transportationGroupExists(transportationGroupId: number): Promise<boolean> {
  const row = await db
    .selectFrom("waste_transportation_group")
    .select("id")
    .where("id", "=", transportationGroupId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return !!row;
}

// Original's getAllWasteTransportationRequests builds its `where` with a
// dead, commented-out search clause (`// name: { [Op.like]: ... }` under a
// key that doesn't even exist on this model) — search is effectively
// unimplemented upstream. Ported faithfully: `search` is accepted for
// interface parity but not applied to the query.
export async function findPaginated(params: {
  limit: number;
  page: number;
  search?: string;
}): Promise<{ data: WasteTransportationRequest[]; pagination: PaginationMeta }> {
  const query = db
    .selectFrom("waste_transportation_request")
    .leftJoin(
      "waste_transportation_group",
      "waste_transportation_group.id",
      "waste_transportation_request.transportation_group_id"
    )
    .where("waste_transportation_request.deleted_at", "is", null);

  const countRow = await query
    .select((eb) => eb.fn.countAll<string>().as("count"))
    .executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .select([
      "waste_transportation_request.id",
      "waste_transportation_request.created_by",
      "waste_transportation_request.updated_by",
      "waste_transportation_request.request_status",
      "waste_transportation_request.transportation_group_id",
      "waste_transportation_request.request_creator_id",
      "waste_transportation_request.request_approver_id",
      "waste_transportation_request.created_at",
      "waste_transportation_request.updated_at",
      "waste_transportation_group.id as group_id",
      "waste_transportation_group.created_by as group_created_by",
      "waste_transportation_group.updated_by as group_updated_by",
      "waste_transportation_group.total_bags_count",
      "waste_transportation_group.total_weight_in_kgs",
      "waste_transportation_group.transporter_vehicle_id",
      "waste_transportation_group.transporter_operator_id",
      "waste_transportation_group.handover_lattitude",
      "waste_transportation_group.handover_longitude",
      "waste_transportation_group.transportation_status",
    ])
    .orderBy("waste_transportation_request.updated_at", "desc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  return {
    data: rows.map((row) => ({ ...toEntity(row), transportationGroup: toGroupSummary(row) })),
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
  requestStatus?: string;
  transportationGroupId: number;
  requestCreatorId?: number;
  requestApproverId?: number;
}): Promise<WasteTransportationRequest> {
  // Mirrors the original: updated_by set to createdBy on create, not a
  // separately-supplied value (there isn't one at creation time).
  const row = await db
    .insertInto("waste_transportation_request")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      request_status: toRequestStatus(payload.requestStatus),
      transportation_group_id: payload.transportationGroupId,
      request_creator_id: payload.requestCreatorId ?? null,
      request_approver_id: payload.requestApproverId ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

export async function update(
  id: number,
  payload: {
    updatedBy: string;
    requestStatus?: string;
    transportationGroupId: number;
    requestCreatorId?: number;
    requestApproverId?: number;
  }
): Promise<WasteTransportationRequest | null> {
  const existing = await findById(id);
  if (!existing) return null;

  const row = await db
    .updateTable("waste_transportation_request")
    .set({
      updated_at: new Date(),
      updated_by: payload.updatedBy,
      // Mirrors UpdateWasteTransportationRequest.ts: each field falls back to
      // the existing value when not supplied.
      request_status: toRequestStatus(payload.requestStatus ?? existing.requestStatus),
      transportation_group_id: payload.transportationGroupId ?? existing.transportationGroupId,
      request_creator_id: payload.requestCreatorId ?? existing.requestCreatorId ?? null,
      request_approver_id: payload.requestApproverId ?? existing.requestApproverId ?? null,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  if (!row) return null;
  // Original re-fetches (with the transportationGroup join) after the update
  // rather than trusting the plain update's return value — mirrored here by
  // delegating to findById instead of toEntity(row) directly.
  return findById(id);
}

export async function softDelete(id: number, deletedBy?: number): Promise<boolean> {
  const existing = await db
    .selectFrom("waste_transportation_request")
    .select("id")
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  if (!existing) return false;

  // Mirrors the original: deletedBy is written in a separate update call
  // before the (paranoid) destroy sets deleted_at — preserved as two
  // statements rather than merged into one `set`, matching the two
  // sequential writes upstream.
  if (deletedBy) {
    await db
      .updateTable("waste_transportation_request")
      .set({ deleted_by: deletedBy })
      .where("id", "=", id)
      .execute();
  }
  await db
    .updateTable("waste_transportation_request")
    .set({ deleted_at: new Date() })
    .where("id", "=", id)
    .execute();
  return true;
}
