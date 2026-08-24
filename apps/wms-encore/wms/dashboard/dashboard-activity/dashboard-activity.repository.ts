// This module reads from three tables it does not own — none are yet
// registered in db/db.ts's `Database` interface. Column lists below are for a
// later integration step to wire in (types/migrations), reverse-engineered
// from apps/wms-service's raw SQL in
// infrastructure/database/repositories/DashboardActivityRepositoryImpl.ts.
// The original ran against MySQL; the columns are unchanged but this file's
// queries are written in Postgres dialect (the target DB), since porting the
// dialect is required for correctness, not just table registration.
//
// waste_bag (subset of columns referenced by this module):
//   id                                       bigint / serial, PK
//   healthcare_facility_id                   integer, FK -> entities.id
//   healthcare_facility_name                 varchar
//   province_id                              integer
//   province_name                            varchar
//   regency_id                               integer
//   regency_name                             varchar
//   waste_classification_id                  integer, FK -> waste_classification.id
//   waste_treatment_group_id                 integer, nullable
//   waste_treatment_external_group_id        integer, nullable
//   waste_transportation_external_group_id   integer, nullable
//   scale_method                             varchar  ('MANUAL' | other)
//   created_at                               timestamp
//
// waste_classification (subset of columns referenced by this module):
//   id                 bigint / serial, PK
//   waste_type_id      integer
//   waste_group_id     integer
//
// entities (subset of columns referenced by this module, already registered
// in db.ts as EntitiesTable — repeated here only for this module's join
// context):
//   id            bigint / serial, PK
//   type          integer   (this module filters `type in (1,2,3,4,5)`)
//   province_id   integer
//   regency_id    integer
//   tag           varchar

import { sql } from "kysely";
import { db } from "../db";
import { isValidDateString } from "../../../shared/utils/date-range";
import type { ActivitySummaryRow, UserActivitySummary } from "./dashboard-activity.types";

export interface ActivityQueryFilters {
  startDate?: string;
  endDate?: string;
  provinceId?: number;
  regencyId?: number;
  healthcareFacilityId?: number;
  wasteTypeId?: number;
  wasteGroupId?: number;
  entityTag?: string;
  typeOfProcessing?: string;
}

export interface DayNum {
  dayNum: number;
}

// Default period: the current calendar month — mirrors the original's
// `startMonth`/`endMonth` fallback exactly (same Y/M, first/last day of month).
function defaultMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startMonth = new Date(year, month, 1).toLocaleDateString("en-CA");
  const endMonth = new Date(year, month + 1, 0).toLocaleDateString("en-CA");
  return { startDate: startMonth, endDate: endMonth };
}

// Splits a comma-separated tag list into a cleaned string[] the same way the
// original did (strip quotes/backticks, trim) — used with a parameterized
// `= ANY($1)` instead of the original's string-concatenated `IN (...)`.
function cleanTagList(entityTag: string): string[] {
  return entityTag
    .split(",")
    .map((v) => v.replace(/['"`]/g, "").trim())
    .filter((v) => v.length > 0);
}

async function getDateRange(startDate: string, endDate: string): Promise<DayNum[]> {
  const result = await sql<DayNum>`
    WITH RECURSIVE dates AS (
      SELECT ${startDate}::date AS dt
      UNION ALL
      SELECT (dt + INTERVAL '1 day')::date
      FROM dates
      WHERE dt < ${endDate}::date
    )
    SELECT EXTRACT(DAY FROM dt)::int AS "dayNum" FROM dates
  `.execute(db);
  return result.rows;
}

async function runActivitySummariesQuery(
  filters: ActivityQueryFilters,
  limit: number,
  offset: number,
): Promise<{ rows: ActivitySummaryRow[]; total: number }> {
  const fallback = defaultMonthRange();
  const finalStartDate =
    isValidDateString(filters.startDate) && isValidDateString(filters.endDate) ? filters.startDate : fallback.startDate;
  const finalEndDate =
    isValidDateString(filters.startDate) && isValidDateString(filters.endDate) ? filters.endDate : fallback.endDate;
  const startTs = `${finalStartDate} 00:00:00`;
  const endTs = `${finalEndDate} 23:59:59`;

  const dates = await getDateRange(finalStartDate, finalEndDate);

  const whereFragments = [sql`wb.created_at BETWEEN ${startTs}::timestamp AND ${endTs}::timestamp`];
  if (filters.healthcareFacilityId) {
    whereFragments.push(sql`wb.healthcare_facility_id = ${filters.healthcareFacilityId}`);
  } else if (filters.regencyId) {
    whereFragments.push(sql`wb.regency_id = ${filters.regencyId}`);
  } else if (filters.provinceId) {
    whereFragments.push(sql`wb.province_id = ${filters.provinceId}`);
  }
  if (filters.wasteTypeId) {
    whereFragments.push(sql`wc.waste_type_id = ${filters.wasteTypeId}`);
  }
  if (filters.wasteGroupId) {
    whereFragments.push(sql`wc.waste_group_id = ${filters.wasteGroupId}`);
  }
  if (filters.entityTag) {
    whereFragments.push(sql`et.tag = ANY(${cleanTagList(filters.entityTag)})`);
  }
  if (filters.typeOfProcessing) {
    if (filters.typeOfProcessing === "IN") {
      whereFragments.push(sql`wb.waste_treatment_group_id IS NOT NULL`);
    } else {
      whereFragments.push(sql`wb.waste_treatment_external_group_id IS NOT NULL`);
    }
  }
  const whereSql = sql.join(whereFragments, sql` AND `);

  const dayCols = dates.map(
    (d) =>
      sql`COALESCE(SUM(CASE WHEN wb.created_at BETWEEN ${startTs}::timestamp AND ${endTs}::timestamp AND EXTRACT(DAY FROM wb.created_at) = ${d.dayNum} THEN 1 ELSE 0 END), 0) AS ${sql.raw(`"${d.dayNum}"`)}`,
  );
  const dayColsSql = dates.length > 0 ? sql.join([sql``, ...dayCols], sql`, `) : sql``;

  const dataResult = await sql<ActivitySummaryRow>`
    SELECT wb.province_id AS "provinceId", wb.province_name AS "provinceName",
      wb.regency_id AS "regencyId", wb.regency_name AS "regencyName",
      wb.healthcare_facility_id AS "healthcareFacilityId",
      wb.healthcare_facility_name AS "healthcareFacilityName" ${dayColsSql}
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
    WHERE ${whereSql}
    GROUP BY wb.healthcare_facility_id, wb.province_id, wb.province_name,
      wb.regency_id, wb.regency_name, wb.healthcare_facility_name
    ORDER BY wb.province_id, wb.healthcare_facility_id
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  const countResult = await sql<{ total: string | number }>`
    SELECT COUNT(DISTINCT wb.healthcare_facility_id) AS total
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
    WHERE ${whereSql}
  `.execute(db);

  const total = Number(countResult.rows[0]?.total ?? 0);
  return { rows: dataResult.rows, total };
}

export async function getActivitySummariesForEntities(params: {
  limit: number;
  page: number;
  filters: ActivityQueryFilters;
}): Promise<{ data: ActivitySummaryRow[]; total: number }> {
  const offset = (params.page - 1) * params.limit;
  const { rows, total } = await runActivitySummariesQuery(params.filters, params.limit, offset);
  return { data: rows, total };
}

// Used by the export path — same query, effectively unpaginated (limit 99999).
export async function getActivitySummariesForEntitiesRaw(
  filters: ActivityQueryFilters,
): Promise<ActivitySummaryRow[]> {
  const { rows } = await runActivitySummariesQuery(filters, 99999, 0);
  return rows;
}

async function runManualScaleQuery(
  filters: ActivityQueryFilters,
  limit: number,
  offset: number,
): Promise<{ rows: ActivitySummaryRow[]; total: number }> {
  const today = new Date().toLocaleDateString("en-CA");
  const finalStartDate = isValidDateString(filters.startDate) ? filters.startDate : today;
  const finalEndDate = isValidDateString(filters.endDate) ? filters.endDate : today;
  const startTs = `${finalStartDate} 00:00:00`;
  const endTs = `${finalEndDate} 23:59:59`;

  const dates = await getDateRange(finalStartDate, finalEndDate);

  const whereFragments = [sql`wb.created_at BETWEEN ${startTs}::timestamp AND ${endTs}::timestamp`];
  if (filters.healthcareFacilityId) {
    whereFragments.push(sql`wb.healthcare_facility_id = ${filters.healthcareFacilityId}`);
  } else if (filters.regencyId) {
    whereFragments.push(sql`wb.regency_id = ${filters.regencyId}`);
  } else if (filters.provinceId) {
    whereFragments.push(sql`wb.province_id = ${filters.provinceId}`);
  }
  if (filters.wasteTypeId) {
    whereFragments.push(sql`wc.waste_type_id = ${filters.wasteTypeId}`);
  }
  if (filters.wasteGroupId) {
    whereFragments.push(sql`wc.waste_group_id = ${filters.wasteGroupId}`);
  }
  if (filters.entityTag) {
    whereFragments.push(sql`et.tag = ANY(${cleanTagList(filters.entityTag)})`);
  }
  const whereSql = sql.join(whereFragments, sql` AND `);

  const pivotCols = dates.map(
    (d) =>
      sql`COALESCE(SUM(CASE WHEN EXTRACT(DAY FROM d.dt) = ${d.dayNum} THEN scale_method ELSE 0 END), 0) AS ${sql.raw(`"${d.dayNum}"`)}`,
  );
  const pivotColsSql = dates.length > 0 ? sql.join([sql``, ...pivotCols], sql`, `) : sql``;

  const dataResult = await sql<ActivitySummaryRow>`
    WITH daily AS (
      SELECT
        wb.healthcare_facility_id AS "healthcareFacilityId",
        wb.healthcare_facility_name AS "healthcareFacilityName",
        wb.province_id AS "provinceId",
        DATE(wb.created_at) AS dt,
        CASE WHEN wb.scale_method = 'MANUAL' THEN 1 ELSE 0 END AS scale_method
      FROM waste_bag wb
      JOIN waste_classification wc ON wc.id = wb.waste_classification_id
      LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
      WHERE ${whereSql}
      GROUP BY wb.healthcare_facility_id, wb.healthcare_facility_name, wb.province_id,
        DATE(wb.created_at), wb.scale_method
    )
    SELECT "healthcareFacilityId", "healthcareFacilityName", "provinceId" ${pivotColsSql}
    FROM daily d
    GROUP BY "provinceId", "healthcareFacilityId", "healthcareFacilityName"
    ORDER BY "provinceId"
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  const countResult = await sql<{ total: string | number }>`
    SELECT COUNT(DISTINCT wb.healthcare_facility_id) AS total
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
    WHERE ${whereSql}
  `.execute(db);

  const total = Number(countResult.rows[0]?.total ?? 0);
  return { rows: dataResult.rows, total };
}

export async function getActivityManualScaleForEntities(params: {
  limit: number;
  page: number;
  filters: ActivityQueryFilters;
}): Promise<{ data: ActivitySummaryRow[]; total: number }> {
  const offset = (params.page - 1) * params.limit;
  const { rows, total } = await runManualScaleQuery(params.filters, params.limit, offset);
  return { data: rows, total };
}

// Used by the export path — same query, effectively unpaginated (limit 99999).
export async function getActivityManualScaleForEntitiesRaw(
  filters: ActivityQueryFilters,
): Promise<ActivitySummaryRow[]> {
  const { rows } = await runManualScaleQuery(filters, 99999, 0);
  return rows;
}

export async function getUserActivitySummary(
  filters: ActivityQueryFilters,
): Promise<UserActivitySummary> {
  const whereEntity = [sql`e.type in (1,2,3,4,5)`];
  if (filters.provinceId) whereEntity.push(sql`e.province_id = ${filters.provinceId}`);
  if (filters.regencyId) whereEntity.push(sql`e.regency_id = ${filters.regencyId}`);
  if (filters.healthcareFacilityId) {
    whereEntity.push(sql`e.id = ${filters.healthcareFacilityId}`);
  }
  const whereEntitySql = sql.join(whereEntity, sql` AND `);

  const fallback = defaultMonthRange();
  const finalStartDate =
    isValidDateString(filters.startDate) && isValidDateString(filters.endDate) ? filters.startDate : fallback.startDate;
  const finalEndDate =
    isValidDateString(filters.startDate) && isValidDateString(filters.endDate) ? filters.endDate : fallback.endDate;

  const whereWasteBag = [];
  if (filters.startDate) {
    whereWasteBag.push(sql`wb.created_at >= ${`${finalStartDate} 00:00:00`}::timestamp`);
  }
  if (filters.endDate) {
    whereWasteBag.push(sql`wb.created_at <= ${`${finalEndDate} 23:59:59`}::timestamp`);
  }
  if (filters.wasteTypeId) whereWasteBag.push(sql`wc.waste_type_id = ${filters.wasteTypeId}`);
  if (filters.wasteGroupId) whereWasteBag.push(sql`wc.waste_group_id = ${filters.wasteGroupId}`);
  if (filters.entityTag) {
    whereWasteBag.push(sql`et.tag = ANY(${cleanTagList(filters.entityTag)})`);
  }
  const whereWasteBagSql =
    whereWasteBag.length > 0 ? sql`WHERE ${sql.join(whereWasteBag, sql` AND `)}` : sql``;

  if (filters.typeOfProcessing) {
    const activeExpr =
      filters.typeOfProcessing === "IN"
        ? sql`SUM(wb.hasTreatmentGroup) AS "activeEntities", COUNT(*) - SUM(wb.hasTreatmentGroup) AS "inactiveEntities"`
        : sql`SUM(wb.hasTransportationGroup) AS "activeEntities", COUNT(*) - SUM(wb.hasTransportationGroup) AS "inactiveEntities"`;

    const result = await sql<{
      totalEntities: string | number;
      activeEntities: string | number | null;
      inactiveEntities: string | number | null;
    }>`
      SELECT COUNT(*) AS "totalEntities", ${activeExpr}
      FROM entities e
      JOIN (
        SELECT
          wb.healthcare_facility_id,
          CASE WHEN SUM(CASE WHEN wb.waste_treatment_group_id IS NOT NULL THEN 1 ELSE 0 END) > 0 THEN 1 ELSE 0 END AS "hasTreatmentGroup",
          CASE WHEN SUM(CASE WHEN wb.waste_transportation_external_group_id IS NOT NULL THEN 1 ELSE 0 END) > 0 THEN 1 ELSE 0 END AS "hasTransportationGroup"
        FROM waste_bag wb
        JOIN waste_classification wc ON wc.id = wb.waste_classification_id
        LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
        ${whereWasteBagSql}
        GROUP BY wb.healthcare_facility_id
      ) wb ON wb.healthcare_facility_id = e.id
      WHERE ${whereEntitySql}
    `.execute(db);

    const row = result.rows[0];
    return {
      totalEntities: Number(row?.totalEntities ?? 0),
      activeEntities: Number(row?.activeEntities ?? 0),
      inactiveEntities: Number(row?.inactiveEntities ?? 0),
    };
  }

  const result = await sql<{
    totalEntities: string | number;
    activeEntities: string | number | null;
    inactiveEntities: string | number | null;
  }>`
    SELECT
      COUNT(e.id) AS "totalEntities",
      SUM(CASE WHEN wb.healthcare_facility_id IS NOT NULL THEN 1 ELSE 0 END) AS "activeEntities",
      SUM(CASE WHEN wb.healthcare_facility_id IS NULL THEN 1 ELSE 0 END) AS "inactiveEntities"
    FROM entities e
    LEFT JOIN (
      SELECT DISTINCT wb.healthcare_facility_id
      FROM waste_bag wb
      JOIN waste_classification wc ON wc.id = wb.waste_classification_id
      LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
      ${whereWasteBagSql}
    ) wb ON wb.healthcare_facility_id = e.id
    WHERE ${whereEntitySql}
  `.execute(db);

  const row = result.rows[0];
  return {
    totalEntities: Number(row?.totalEntities ?? 0),
    activeEntities: Number(row?.activeEntities ?? 0),
    inactiveEntities: Number(row?.inactiveEntities ?? 0),
  };
}
