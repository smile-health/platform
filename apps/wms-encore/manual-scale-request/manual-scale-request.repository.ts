// Postgres columns for table `manual_scale_request` (mirrors
// infrastructure/database/models/ManualScaleRequestModel.ts field-for-field,
// Sequelize `paranoid: true` soft-delete -> deleted_at/deleted_by here).
//
//   id             bigserial, primary key
//   requested_by   text, not null
//   processed_by   text, nullable
//   is_active      boolean, not null, default true
//   status         text, not null, default 'PENDING'
//                  ('PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_FOR_APPROVAL')
//   approval_type  text, nullable ('TIME_BOUND' | 'COUNT_BASED')
//   valid_until    timestamptz, nullable
//   count_limit    integer, nullable
//   entity_id      integer, not null
//   created_at     timestamptz, not null
//   updated_at     timestamptz, not null
//   deleted_at     timestamptz, nullable (paranoid soft-delete)
//   deleted_by     bigint, nullable
//
// See db/migrations/12_create_manual_scale_request.up.sql for the CREATE TABLE.

import { db } from "../db/db";
import { isValidDateString } from "../shared/utils/date-range";
import type { ManualScaleRequest, PaginationMeta } from "./manual-scale-request.types";

function toStatus(value: string): ManualScaleRequest["status"] {
  return value as ManualScaleRequest["status"];
}

function toApprovalType(value: string | null): ManualScaleRequest["approvalType"] {
  return (value ?? undefined) as ManualScaleRequest["approvalType"];
}

function toEntity(row: {
  id: number;
  requested_by: string;
  processed_by: string | null;
  is_active: boolean;
  status: string;
  approval_type: string | null;
  valid_until: Date | null;
  count_limit: number | null;
  entity_id: number;
  created_at: Date;
  updated_at: Date;
}): ManualScaleRequest {
  // operatorName/processedName/entityName: original enriches these via
  // getUsersDetail/getEntityDetail (thirdPartyClient) — populated in
  // manual-scale-request.service.ts from local tables instead. Always
  // undefined at this layer (repository rows only).
  return {
    id: row.id,
    requestedBy: row.requested_by,
    processedBy: row.processed_by ?? undefined,
    isActive: row.is_active,
    status: toStatus(row.status),
    approvalType: toApprovalType(row.approval_type),
    validUntil: row.valid_until ?? undefined,
    countLimit: row.count_limit ?? undefined,
    entityId: row.entity_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Mirrors checkDataIsExist: same UTC calendar day, approvalType TIME_BOUND,
// status in (PENDING, WAITING_FOR_APPROVAL, APPROVED). createManualScaleRequest
// uses this as a same-day dedup guard before inserting a new row.
export async function findExistingTimeBoundRequestToday(
  requestedBy: string
): Promise<ManualScaleRequest | null> {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);

  const row = await db
    .selectFrom("manual_scale_request")
    .selectAll()
    .where("requested_by", "=", requestedBy)
    .where("approval_type", "=", "TIME_BOUND")
    .where("created_at", ">=", startOfDay)
    .where("created_at", "<", endOfDay)
    .where("status", "in", ["PENDING", "WAITING_FOR_APPROVAL", "APPROVED"])
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors getOneActiveRequest: today's UTC calendar day, isActive, status
// APPROVED. Consumed by apps/wms-service's WasteBagRepositoryImpl (waste-bag
// domain, out of scope for this migration phase) — exported here for that
// future caller, unused within this module today.
export async function findActiveApprovedRequestToday(requestedBy: string): Promise<ManualScaleRequest | null> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const row = await db
    .selectFrom("manual_scale_request")
    .selectAll()
    .where("requested_by", "=", requestedBy)
    .where("created_at", ">=", startOfDay)
    .where("created_at", "<", endOfDay)
    .where("is_active", "=", true)
    .where("status", "=", "APPROVED")
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function findById(id: number): Promise<ManualScaleRequest | null> {
  const row = await db
    .selectFrom("manual_scale_request")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  entityId?: number;
  status?: string;
  isActive?: boolean;
  provinceId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
}): Promise<{ data: ManualScaleRequest[]; pagination: PaginationMeta }> {
  // Original: `entities` include has `required: true` (Sequelize inner join),
  // so a row without a matching (or province/city-filtered) entities row is
  // excluded — mirrored here with an inner join even when provinceId/cityId
  // aren't supplied, since the join itself (not just its where-clause) is
  // unconditional in the original.
  let query = db
    .selectFrom("manual_scale_request")
    .innerJoin("entities", "entities.id", "manual_scale_request.entity_id")
    .where("manual_scale_request.deleted_at", "is", null);

  if (params.status) {
    query = query.where("manual_scale_request.status", "=", params.status);
  }
  // Original: `...(isActive && { isActive })` — a falsy isActive (including
  // `false` itself) is silently dropped, so filtering for inactive rows via
  // this param has never actually worked end-to-end. Preserved verbatim.
  if (params.isActive) {
    query = query.where("manual_scale_request.is_active", "=", params.isActive);
  }
  if (params.entityId) {
    query = query.where("manual_scale_request.entity_id", "=", params.entityId);
  }
  if (params.provinceId) {
    query = query.where("entities.province_id", "=", String(params.provinceId));
  }
  if (params.cityId) {
    query = query.where("entities.regency_id", "=", String(params.cityId));
  }
  if (isValidDateString(params.startDate) && isValidDateString(params.endDate)) {
    const startOfDay = new Date(params.startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(params.endDate);
    endOfDay.setHours(23, 59, 59, 999);
    query = query
      .where("manual_scale_request.created_at", ">=", startOfDay)
      .where("manual_scale_request.created_at", "<=", endOfDay);
  }

  const countRow = await query
    .select((eb) => eb.fn.countAll<string>().as("count"))
    .executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .selectAll("manual_scale_request")
    .orderBy("manual_scale_request.updated_at", "desc")
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

// Mirrors waitingApprovalManualScaleRequest: flips a row to
// isActive=true/status=WAITING_FOR_APPROVAL. Called from apps/wms-service's
// ProcessScheduledEventUseCase (the scheduled-event dispatch job, out of
// scope for this migration phase) — exported here for that future caller
// (scheduled-event-dispatcher/), unused within this module today.
export async function markWaitingForApproval(id: number): Promise<ManualScaleRequest | null> {
  const row = await db
    .updateTable("manual_scale_request")
    .set({ is_active: true, status: "WAITING_FOR_APPROVAL", updated_at: new Date() })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors activateManualScaleRequest: only rows currently WAITING_FOR_APPROVAL
// can transition to APPROVED/REJECTED — returns the sentinel string (not
// throwing) exactly like the original, so callers can map it the same way.
export async function activate(
  id: number,
  processedBy: string,
  action: "APPROVED" | "REJECTED"
): Promise<ManualScaleRequest | string | null> {
  const existing = await findById(id);
  if (!existing) return null;

  if (existing.status !== "WAITING_FOR_APPROVAL") {
    return "Only requests with status WAITING_FOR_APPROVAL can be processed";
  }

  const row = await db
    .updateTable("manual_scale_request")
    .set({ is_active: true, status: action, processed_by: processedBy, updated_at: new Date() })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function create(payload: {
  requestedBy: string;
  processedBy?: string;
  isActive: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WAITING_FOR_APPROVAL";
  approvalType: "TIME_BOUND" | "COUNT_BASED";
  validUntil?: Date;
  countLimit?: number;
  entityId: number;
}): Promise<ManualScaleRequest> {
  const row = await db
    .insertInto("manual_scale_request")
    .values({
      requested_by: payload.requestedBy,
      processed_by: payload.processedBy ?? null,
      is_active: payload.isActive,
      status: payload.status,
      approval_type: payload.approvalType,
      valid_until: payload.validUntil ?? null,
      count_limit: payload.countLimit ?? null,
      entity_id: payload.entityId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}
