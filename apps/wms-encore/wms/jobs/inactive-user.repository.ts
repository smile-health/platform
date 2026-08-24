import { sql } from "kysely";
import { db } from "./db";

// Mirrors inActiveUserScheduler.ts's hardcoded weekly milestones.
export const INACTIVE_AGE_DAYS = [7, 14, 21, 28, 35, 42, 49, 56] as const;

// Mirrors the original's `WHERE created_at >= NOW() - INTERVAL 56 DAY`
// combined with `GROUP BY ... MAX(created_at)`: a facility whose most recent
// waste bag is older than 56 days simply disappears from this query — there
// is no alert once a facility has been inactive for more than 8 weeks. This
// is a real quirk of the original (not a bug we're fixing), preserved as-is.
const MAX_TRACKED_AGE_DAYS = 56;

export interface InactiveFacilityRow {
  provinceId: number | null;
  regencyId: number | null;
  districtId: number | null;
  healthcareFacilityId: number;
  lastCreatedAt: Date;
  ageDays: number;
}

// Mirrors inActiveUserScheduler.ts's main paginated query.
export async function findInactiveFacilities(
  entityIds: number[] | undefined,
  limit: number,
  offset: number,
): Promise<InactiveFacilityRow[]> {
  const entityFilter =
    entityIds && entityIds.length > 0
      ? sql`AND healthcare_facility_id = ANY(${entityIds})`
      : sql``;

  const result = await sql<{
    provinceId: number | null;
    regencyId: number | null;
    districtId: number | null;
    healthcareFacilityId: number;
    lastCreatedAt: Date;
    ageDays: number;
  }>`
    SELECT
      province_id AS "provinceId",
      regency_id AS "regencyId",
      district_id AS "districtId",
      healthcare_facility_id AS "healthcareFacilityId",
      MAX(created_at) AS "lastCreatedAt",
      DATE_PART('day', NOW() - MAX(created_at))::int AS "ageDays"
    FROM waste_bag
    WHERE created_at >= NOW() - (${MAX_TRACKED_AGE_DAYS} || ' DAY')::interval
    ${entityFilter}
    GROUP BY province_id, regency_id, district_id, healthcare_facility_id
    HAVING DATE_PART('day', NOW() - MAX(created_at))::int = ANY(${[...INACTIVE_AGE_DAYS]})
    ORDER BY healthcare_facility_id ASC
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  return result.rows;
}

export interface UserWithFcmToken {
  id: number;
  username: string | null;
  email: string | null;
  mobilePhone: string | null;
  entityId: number;
  entityName: string | null;
  regencyName: string | null;
  provinceId: string | null;
  regencyId: string | null;
  type: number | null;
  fcmToken: string | null;
}

// Mirrors the "latest FCM token per user" self-join pattern shared by jobs 1,
// 3, 4 and 5 in the original (MAX(created_at) per user_id+entity_id, joined
// back to user_fcm_token to get that single latest row).
export async function findActiveUsersForEntities(
  entityIds: number[],
  limit: number,
  offset: number,
): Promise<UserWithFcmToken[]> {
  if (entityIds.length === 0) return [];

  const result = await sql<UserWithFcmToken>`
    SELECT u.id, u.username, u.email, u.mobile_phone AS "mobilePhone",
           u.entity_id AS "entityId", e.name AS "entityName", e.regency_name AS "regencyName",
           e.province_id AS "provinceId", e.regency_id AS "regencyId", e.type,
           uft.token AS "fcmToken"
    FROM users u
    LEFT JOIN entities e ON u.entity_id = e.id
    LEFT JOIN (
      SELECT t1.* FROM user_fcm_token t1
      INNER JOIN (
        SELECT user_id, entity_id, MAX(created_at) AS max_created_at
        FROM user_fcm_token GROUP BY user_id, entity_id
      ) t2 ON t1.user_id = t2.user_id AND t1.entity_id = t2.entity_id AND t1.created_at = t2.max_created_at
    ) uft ON u.id = uft.user_id AND u.entity_id = uft.entity_id
    WHERE u.entity_id = ANY(${entityIds})
    AND u.is_active = true
    AND u.deleted_at IS NULL
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  return result.rows;
}
