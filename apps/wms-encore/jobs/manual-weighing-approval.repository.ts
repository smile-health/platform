import { sql } from "kysely";
import { db } from "../db/db";

export interface ExpiredApprovalRow {
  id: number;
  validUntil: Date | null;
  entityId: number;
  userId: number | null;
  fullname: string | null;
  status: string;
}

// Mirrors updateStatusManualWeighingApprovalScheduler.ts's main query.
// `valid_until < CURDATE()` (here: < CURRENT_DATE) is a date-only, strict
// comparison — a request whose valid_until is TODAY is not yet expired; it
// only becomes eligible for expiry the day after. Preserved as-is.
export async function findExpiredManualScaleRequests(
  entityIds: number[] | undefined,
  limit: number,
  offset: number,
): Promise<ExpiredApprovalRow[]> {
  const entityFilter =
    entityIds && entityIds.length > 0 ? sql`AND mcr.entity_id = ANY(${entityIds})` : sql``;

  const result = await sql<ExpiredApprovalRow>`
    SELECT mcr.id, mcr.valid_until AS "validUntil", mcr.entity_id AS "entityId",
           u.id AS "userId", CONCAT_WS(' ', u.firstname, u.lastname) AS "fullname",
           mcr.status
    FROM manual_scale_request mcr
    LEFT JOIN users u ON u.user_uuid::text = mcr.requested_by
    WHERE mcr.status = 'WAITING_FOR_APPROVAL'
    AND mcr.valid_until < CURRENT_DATE
    ${entityFilter}
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  return result.rows;
}

// Mirrors updateStatusManualWeighingApproval(rows): batch-expires exactly
// the page of requests just fetched (not the full unpaginated set) — same
// per-page write pattern as the original's while-loop.
export async function markManualScaleRequestsExpired(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  await db
    .updateTable("manual_scale_request")
    .set({ status: "EXPIRED", is_active: false })
    .where("id", "in", ids)
    .execute();
}

export interface ExactEntityUser {
  id: number;
  mobilePhone: string | null;
  entityId: number;
}

// Mirrors getUserToNotify for this job: unlike jobs 3/4's broadened
// province/regency/facility OR-match, this one only matches on exact
// entity_id (no type-based scope widening) — same as the original.
export async function findUsersForEntities(
  entityIds: number[],
  limit: number,
  offset: number,
): Promise<ExactEntityUser[]> {
  if (entityIds.length === 0) return [];

  const result = await sql<ExactEntityUser>`
    SELECT u.id, u.mobile_phone AS "mobilePhone", u.entity_id AS "entityId"
    FROM users u
    WHERE u.entity_id = ANY(${entityIds})
    AND u.is_active = true
    AND u.deleted_at IS NULL
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  return result.rows;
}
