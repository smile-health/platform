import { sql } from "kysely";
import { db } from "./db";

export interface BelowProjectionRow {
  healthcareFacilityId: number;
  regencyId: number | null;
  provinceId: number | null;
  provinceName: string | null;
  regencyName: string | null;
  entityName: string | null;
  wasteFullname: string | null;
  wasteFullnameEn: string | null;
  totalWeight: number;
  projectionWeight: number;
  avgWeight: number;
}

// Mirrors wasteGenerationBelowMonthlyProjectionScheduler.ts's main query.
// avgWeightPrev3Months is computed in WIB (+07:00, via Postgres's `AT TIME
// ZONE` — the CONVERT_TZ equivalent) over the 3 full months preceding the
// current month; projection_weight halves that average (hardcoded /2,
// because it's compared only against days 1-15 of the current month, also
// in WIB). Facilities/waste-characteristics whose first-half-month actual
// total_weight is below that projection are flagged.
export async function findBagsBelowMonthlyProjection(
  startDate: string,
  endDate: string,
  entityIds: number[] | undefined,
  limit: number,
  offset: number,
): Promise<BelowProjectionRow[]> {
  const entityFilter =
    entityIds && entityIds.length > 0
      ? sql`AND wb.healthcare_facility_id = ANY(${entityIds})`
      : sql``;

  const result = await sql<BelowProjectionRow>`
    WITH monthly AS (
      SELECT wb2.healthcare_facility_id, wc2.waste_characteristics_id,
             TO_CHAR(wb2.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM') AS month_label,
             COALESCE(SUM(wb2.weight_in_kgs), 0) AS total_weight
      FROM waste_bag wb2
      JOIN waste_classification wc2 ON wc2.id = wb2.waste_classification_id
      WHERE (wb2.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') >= (${startDate}::timestamp - INTERVAL '3 month')
        AND (wb2.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') < ${startDate}::timestamp
      GROUP BY wb2.healthcare_facility_id, wc2.waste_characteristics_id, month_label
    ),
    prev AS (
      SELECT healthcare_facility_id, waste_characteristics_id, AVG(total_weight) AS avg_weight_prev_3_months
      FROM monthly
      GROUP BY healthcare_facility_id, waste_characteristics_id
    )
    SELECT
      wb.healthcare_facility_id AS "healthcareFacilityId",
      wb.regency_id AS "regencyId", wb.province_id AS "provinceId",
      et.province_name AS "provinceName", et.regency_name AS "regencyName", et.name AS "entityName",
      CONCAT(wt.name, ' - ', wg.name, ' - ', wch.name) AS "wasteFullname",
      CONCAT(wt.name_en, ' - ', wg.name_en, ' - ', wch.name_en) AS "wasteFullnameEn",
      COALESCE(SUM(wb.weight_in_kgs), 0) AS "totalWeight",
      COALESCE(ROUND((prev.avg_weight_prev_3_months / 2)::numeric, 2), 0) AS "projectionWeight",
      COALESCE(ROUND(prev.avg_weight_prev_3_months::numeric, 2), 0) AS "avgWeight"
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
    JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
    JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
    LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
    LEFT JOIN prev ON prev.healthcare_facility_id = wb.healthcare_facility_id
      AND prev.waste_characteristics_id = wc.waste_characteristics_id
    WHERE (wb.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp
    ${entityFilter}
    GROUP BY wb.healthcare_facility_id, wb.regency_id, wb.province_id, et.province_name,
      et.regency_name, et.name, wt.name, wg.name, wch.name, wt.name_en, wg.name_en, wch.name_en,
      prev.avg_weight_prev_3_months
    HAVING COALESCE(SUM(wb.weight_in_kgs), 0) < COALESCE(ROUND((prev.avg_weight_prev_3_months / 2)::numeric, 2), 0)
    ORDER BY et.province_name ASC, et.name ASC
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  return result.rows;
}
