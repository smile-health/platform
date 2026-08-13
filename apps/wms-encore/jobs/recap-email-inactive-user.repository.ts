import { sql } from "kysely";
import { db } from "../db/db";
import { INACTIVE_AGE_DAYS } from "./inactive-user.repository";

// Same 56-day hard cutoff as inactive-user.repository.ts — see that file's
// header comment for why anything inactive >56 days silently drops out.
const MAX_TRACKED_AGE_DAYS = 56;

export interface RecapUser {
  id: number;
  username: string | null;
  email: string | null;
  mobilePhone: string | null;
  entityId: number;
  entityName: string | null;
  regencyName: string | null;
  provinceId: string | null;
  regencyId: string | null;
  entityType: number | null;
}

// Mirrors recapEmailInActiveUserScheduler.ts's user page query. Note: unlike
// inactive-user.repository.ts's findActiveUsersForEntities, this is NOT
// scoped to specific entityIds by default — every active user is a
// candidate, and the per-user waste-bag query below (findInactiveForUser)
// is what actually narrows down what (if anything) that user is told about.
export async function findRecapCandidateUsers(
  entityIds: number[] | undefined,
  limit: number,
  offset: number,
): Promise<RecapUser[]> {
  const entityFilter =
    entityIds && entityIds.length > 0 ? sql`AND u.entity_id = ANY(${entityIds})` : sql``;

  const result = await sql<RecapUser>`
    SELECT u.id, u.username, u.email, u.mobile_phone AS "mobilePhone",
           u.entity_id AS "entityId", e.name AS "entityName", e.regency_name AS "regencyName",
           e.province_id AS "provinceId", e.regency_id AS "regencyId", e.type AS "entityType"
    FROM users u
    LEFT JOIN entities e ON u.entity_id = e.id
    WHERE u.is_active = true
    AND u.deleted_at IS NULL
    ${entityFilter}
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  return result.rows;
}

export interface InactiveForUserRow {
  provinceId: number | null;
  regencyId: number | null;
  districtId: number | null;
  healthcareFacilityId: number;
  lastCreatedAt: Date;
  ageDays: number;
  entityName: string | null;
  regencyName: string | null;
}

// Mirrors getDataInactiveUsers's per-entity_type condition + the inactive
// waste-bag query (same 56-day/[7,14,...,56] shape as inactive-user
// .repository.ts's findInactiveFacilities, scoped down to this one user's
// admin area instead of every facility).
export async function findInactiveForUser(
  entityType: number | null,
  provinceId: string | null,
  regencyId: string | null,
  entityId: number,
  limit: number,
  offset: number,
): Promise<InactiveForUserRow[]> {
  // Mirrors conditionDataInactiveUsers: entity_type outside 1/2/3 gets no
  // condition at all in the original, and the function returns early with
  // no email sent — same behavior reproduced by returning [] here.
  let scopeFilter;
  if (entityType === 1) scopeFilter = sql`AND wb.province_id = ${Number(provinceId)}`;
  else if (entityType === 2) scopeFilter = sql`AND wb.regency_id = ${Number(regencyId)}`;
  else if (entityType === 3) scopeFilter = sql`AND wb.healthcare_facility_id = ${entityId}`;
  else return [];

  const result = await sql<InactiveForUserRow>`
    SELECT wb.province_id AS "provinceId", wb.regency_id AS "regencyId",
           wb.district_id AS "districtId", wb.healthcare_facility_id AS "healthcareFacilityId",
           MAX(wb.created_at) AS "lastCreatedAt",
           DATE_PART('day', NOW() - MAX(wb.created_at))::int AS "ageDays",
           e.name AS "entityName", e.regency_name AS "regencyName"
    FROM waste_bag wb
    LEFT JOIN entities e ON wb.healthcare_facility_id = e.id
    WHERE wb.created_at >= NOW() - (${MAX_TRACKED_AGE_DAYS} || ' DAY')::interval
    ${scopeFilter}
    GROUP BY wb.province_id, wb.regency_id, wb.district_id, wb.healthcare_facility_id, e.name, e.regency_name
    HAVING DATE_PART('day', NOW() - MAX(wb.created_at))::int = ANY(${[...INACTIVE_AGE_DAYS]})
    ORDER BY wb.healthcare_facility_id ASC
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  return result.rows;
}
