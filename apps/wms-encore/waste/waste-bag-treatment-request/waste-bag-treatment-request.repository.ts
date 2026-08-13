// Postgres columns for table `waste_treatment_request` (mirrors
// infrastructure/database/models/WasteBagTreatmentRequestModel.ts
// field-for-field — note the model's `tableName` is `waste_treatment_request`,
// NOT `waste_bag_treatment_request`, despite the entity/use-case/controller
// naming):
//
//   id                    bigint, unsigned, auto-increment, primary key
//   created_by            varchar(36), not null
//   updated_by            varchar(36), not null
//   request_status        enum('PENDING','ACCEPTED','REJECTED'), nullable
//   treatment_group_id    bigint, not null (FK -> waste_bag_treatment_group.id,
//                         belongsTo WasteBagTreatmentGroupModel as
//                         'wasteTreatmentGroup' — that table is being built in
//                         parallel by another agent, see
//                         waste/waste-bag-treatment-group/)
//   request_creator_id    integer, nullable
//   request_approver_id   integer, nullable
//   created_at            timestamp, not null
//   updated_at            timestamp, not null
//   deleted_at            timestamp, nullable (paranoid soft-delete)
//   deleted_by            bigint, nullable
//
// Note: WasteBagTreatmentRequestAttributes (the Sequelize model's TS
// attributes interface) also declares a `treatmentOperatorId` field, but
// there is NO corresponding column in the model's `init()` call — it is not
// a real column, just dead/unused type surface in the original. Not ported.
//
// This table is not registered in the Kysely schema yet — expect
// table-not-registered tsc errors below, same as every other in-flight
// module. waste_bag_treatment_group (referenced for the existence guard) is
// also not registered yet since it's being built in parallel.

import { db } from "../../db/db";
import type { WasteBagTreatmentRequest, PaginationMeta } from "./waste-bag-treatment-request.types";

// Zod already validates requestStatus against its enum before this is called
// (see waste-bag-treatment-request.schema.ts) — this cast just tells Kysely
// the wire string is one of the enum's members, same pattern as
// asset-model.repository.ts's toAssetType helper.
function toRequestStatus(value: string | undefined): "PENDING" | "ACCEPTED" | "REJECTED" | null {
  return (value ?? null) as "PENDING" | "ACCEPTED" | "REJECTED" | null;
}

// NOTE on a bug found (not reproduced): the original repository impl's
// getWasteBagTreatmentRequestById and getAllWasteBagTreatmentRequests both
// swap request_creator_id <-> request_approver_id when mapping DB rows back
// onto the entity (e.g. `requestApproverId: existingData.get('request_creator_id')`),
// while the create/update write paths map both fields straight (no swap).
// This looks like an unintentional copy-paste bug rather than deliberate
// behavior — writes are internally consistent, only the two read mappings
// disagree with them. Ported straight (no swap) below so writes and reads
// agree; flagging here in case the original's read behavior was actually
// relied upon somewhere downstream.
function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string;
  request_status: string | null;
  treatment_group_id: number;
  request_creator_id: number | null;
  request_approver_id: number | null;
  created_at: Date;
  updated_at: Date;
}): WasteBagTreatmentRequest {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    requestStatus: row.request_status ?? undefined,
    treatmentGroupId: row.treatment_group_id,
    requestCreatorId: row.request_creator_id ?? undefined,
    requestApproverId: row.request_approver_id ?? undefined,
  };
}

export async function findById(id: number): Promise<WasteBagTreatmentRequest | null> {
  const row = await db
    .selectFrom("waste_treatment_request")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors WasteBagTreatmentGroupModel existence check done inline by
// CreateWasteBagTreatmentRequest / UpdateWasteBagTreatmentRequest use-cases
// via checkExistingData(WasteBagTreatmentGroupModel, treatmentGroupId) — a
// plain non-paranoid-aware findByPk-style lookup in the original (paranoid
// defaults still exclude soft-deleted rows via Sequelize's default scope).
export async function existsTreatmentGroup(treatmentGroupId: number): Promise<boolean> {
  const row = await db
    .selectFrom("waste_treatment_group")
    .select("id")
    .where("id", "=", treatmentGroupId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return !!row;
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  search?: string;
}): Promise<{ data: WasteBagTreatmentRequest[]; pagination: PaginationMeta }> {
  // NOTE on `search`: in the original, GetAllWasteBagTreatmentRequestUseCase's
  // execute(limit, page, entity_id, search) takes `entity_id` as its 3rd
  // positional param, but the controller only ever calls
  // `useCase.execute(Number(limit), Number(page), search?.toString())` — i.e.
  // it passes the search string into the `entity_id` slot, leaving the
  // use-case's own `search` param permanently undefined. Even if it weren't
  // for that, the repository impl's where-clause filters on a `name` column
  // (`Op.like` on `name`) that does not exist anywhere on this model — so the
  // `search` query param has never actually filtered anything end-to-end.
  // Preserved verbatim: `search` is accepted here (for API-shape parity) but
  // intentionally not applied to the query.
  const query = db.selectFrom("waste_treatment_request").where("deleted_at", "is", null);

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
  requestStatus?: string;
  treatmentGroupId: number;
  requestCreatorId?: number;
  requestApproverId?: number;
}): Promise<WasteBagTreatmentRequest> {
  // Mirrors the original: updated_by set to createdBy on create, not a
  // separately-supplied value (there isn't one at creation time).
  const row = await db
    .insertInto("waste_treatment_request")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      request_status: toRequestStatus(payload.requestStatus),
      treatment_group_id: payload.treatmentGroupId,
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
    treatmentGroupId: number;
    requestCreatorId?: number;
    requestApproverId?: number;
  }
): Promise<WasteBagTreatmentRequest | null> {
  const existing = await findById(id);
  if (!existing) return null;

  const row = await db
    .updateTable("waste_treatment_request")
    .set({
      updated_at: new Date(),
      updated_by: payload.updatedBy,
      request_status: toRequestStatus(payload.requestStatus),
      treatment_group_id: payload.treatmentGroupId,
      request_creator_id: payload.requestCreatorId ?? null,
      request_approver_id: payload.requestApproverId ?? null,
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

  await db
    .updateTable("waste_treatment_request")
    .set({ deleted_at: new Date(), deleted_by: deletedBy ?? null })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return true;
}
