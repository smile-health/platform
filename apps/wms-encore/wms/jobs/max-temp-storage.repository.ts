import { sql } from "kysely";
import { db } from "./db";

export interface OverThresholdBag {
  id: number;
  wasteBagQrCodeId: string;
  createdAt: Date;
  healthcareFacilityId: number;
  healthcareFacilityName: string | null;
  provinceId: number | null;
  provinceName: string | null;
  regencyId: number | null;
  regencyName: string | null;
  tempStorageMaxHours: number | null;
  diffHours: number;
}

// Mirrors maximumTemporaryStorageDurationScheduler.ts's main query: bags
// still IN_TEMPORARY_STORAGE whose classification defines a max storage
// duration, and whose elapsed hours since created_at strictly EXCEEDS it
// (`>`, not `>=` — a bag exactly at the boundary is not yet flagged, same as
// the original).
export async function findBagsOverTempStorageThreshold(
  entityIds: number[] | undefined,
  limit: number,
  offset: number,
): Promise<OverThresholdBag[]> {
  const entityFilter =
    entityIds && entityIds.length > 0
      ? sql`AND wb.healthcare_facility_id = ANY(${entityIds})`
      : sql``;

  const result = await sql<OverThresholdBag>`
    SELECT
      wb.id, wb.waste_bag_qr_code_id AS "wasteBagQrCodeId", wb.created_at AS "createdAt",
      wb.healthcare_facility_id AS "healthcareFacilityId",
      wb.healthcare_facility_name AS "healthcareFacilityName",
      wb.province_id AS "provinceId", wb.province_name AS "provinceName",
      wb.regency_id AS "regencyId", wb.regency_name AS "regencyName",
      wc.temp_storage_max_hours AS "tempStorageMaxHours",
      DATE_PART('hour', NOW() - wb.created_at)::int AS "diffHours"
    FROM waste_bag wb
    LEFT JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    WHERE wb.waste_status = 'IN_TEMPORARY_STORAGE'
    AND wc.temp_storage_max_hours IS NOT NULL
    AND DATE_PART('hour', NOW() - wb.created_at)::int > wc.temp_storage_max_hours
    ${entityFilter}
    ORDER BY wb.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  return result.rows;
}

export interface BroadUser {
  id: number;
  mobilePhone: string | null;
  entityId: number;
  provinceId: string | null;
  regencyId: string | null;
  type: number | null;
}

// Mirrors getUserToNotify's broadened WHERE (entity match OR regency match OR
// province match), shared verbatim by jobs 3 and 4 in the original.
export async function findUsersInScope(
  entityIds: number[],
  regencyIds: number[],
  provinceIds: number[],
  limit: number,
  offset: number,
): Promise<BroadUser[]> {
  if (entityIds.length === 0 && regencyIds.length === 0 && provinceIds.length === 0) return [];

  const result = await sql<BroadUser>`
    SELECT u.id, u.mobile_phone AS "mobilePhone", u.entity_id AS "entityId",
           e.province_id AS "provinceId", e.regency_id AS "regencyId", e.type
    FROM users u
    LEFT JOIN entities e ON u.entity_id = e.id
    WHERE (
      u.entity_id = ANY(${entityIds})
      OR e.regency_id = ANY(${regencyIds.map(String)})
      OR e.province_id = ANY(${provinceIds.map(String)})
    )
    AND e.type IN (1, 2, 3)
    AND u.is_active = true
    AND u.deleted_at IS NULL
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  return result.rows;
}
