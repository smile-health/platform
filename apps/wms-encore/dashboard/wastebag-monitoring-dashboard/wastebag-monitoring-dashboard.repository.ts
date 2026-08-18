// ---------------------------------------------------------------------------
// Postgres columns referenced by this module's raw queries below (for a
// later integration step to confirm/migrate — these mirror the original
// wms-service Sequelize/MySQL models field-for-field; names are already
// snake_case and assumed already present via other modules' migrations):
//
//   waste_bag
//     id                          integer, PK
//     waste_classification_id    integer, FK -> waste_classification.id
//     healthcare_facility_id     integer, FK -> entities.id
//     province_id                integer
//     province_name              text  (denormalized — entities has no name columns)
//     regency_id                 integer
//     regency_name               text  (denormalized — entities has no name columns)
//     weight_in_kgs              numeric
//     created_at                 timestamptz
//
//   waste_classification
//     id                          integer, PK
//     waste_type_id               integer, FK -> waste_hierarchy.id
//     waste_group_id              integer, FK -> waste_hierarchy.id
//     waste_characteristics_id    integer, FK -> waste_hierarchy.id
//
//   waste_hierarchy
//     id                          integer, PK
//     name                        varchar
//     name_en                     varchar
//     is_active                   boolean
//
//   entities
//     id                          integer, PK
//     name                        varchar
//     tag                         varchar
//     province_id                text  (id only — no province_name/regency_name here)
//
// NOTE (dialect): the original wms-service repository (WasteBagMonitoringDashboardRepositoryImpl.ts)
// runs on MySQL and uses CONVERT_TZ(...)/DATE_FORMAT(...). wms-encore's db is
// Postgres (see db/db.ts's PostgresDialect) — the queries below are
// translated to Postgres equivalents (`AT TIME ZONE`, `to_char`) while
// preserving the original's exact filter/group/order business logic. This
// translation is the one intentional behavioral adaptation in this port; see
// wastebag-monitoring-dashboard.service.ts for other deviations.
// ---------------------------------------------------------------------------
import { sql } from "kysely";
import { db } from "../db";
import { isValidDateString } from "../../shared/utils/date-range";
import type {
  EntityWasteBagSummaryByGroupRow,
  EntityWasteBagSummaryRow,
} from "./wastebag-monitoring-dashboard.types";

export interface SummaryFilters {
  startDate?: string;
  endDate?: string;
  provinceId?: number;
  regencyId?: number;
  healthcareFacilityId?: number;
  entityTag?: string;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
}

// Mirrors the original's per-endpoint hand-rolled `whereClauses`/`replacements`
// building — reproduced here as a single shared helper (the original
// duplicates this block verbatim in nearly every repository method).
function buildWhere(f: SummaryFilters, alias = "wb") {
  const clauses: ReturnType<typeof sql>[] = [];
  if (f.provinceId) clauses.push(sql`${sql.raw(alias)}.province_id = ${f.provinceId}`);
  if (f.regencyId) clauses.push(sql`${sql.raw(alias)}.regency_id = ${f.regencyId}`);
  if (f.healthcareFacilityId)
    clauses.push(sql`${sql.raw(alias)}.healthcare_facility_id = ${f.healthcareFacilityId}`);
  if (isValidDateString(f.startDate) && isValidDateString(f.endDate)) {
    clauses.push(
      sql`(${sql.raw(alias)}.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') BETWEEN ${`${f.startDate} 00:00:00`} AND ${`${f.endDate} 23:59:59`}`,
    );
  }
  if (f.entityTag) {
    const tags = f.entityTag
      .split(",")
      .map((v) => v.replace(/['"`]/g, "").trim())
      .filter(Boolean);
    if (tags.length) clauses.push(sql`et.tag IN (${sql.join(tags)})`);
  }
  if (f.wasteTypeId) clauses.push(sql`wc.waste_type_id = ${f.wasteTypeId}`);
  if (f.wasteGroupId) clauses.push(sql`wc.waste_group_id = ${f.wasteGroupId}`);
  if (f.wasteCharacteristicsId)
    clauses.push(sql`wc.waste_characteristics_id = ${f.wasteCharacteristicsId}`);
  return clauses;
}

function whereSql(clauses: ReturnType<typeof sql>[], prefix: "WHERE" | "AND" = "WHERE") {
  if (!clauses.length) return sql``;
  return sql`${sql.raw(prefix)} ${sql.join(clauses, sql` AND `)}`;
}

export async function getWasteGroupSummaryChart(
  filters: SummaryFilters,
): Promise<{ totalBags: number; totalWeight: number; wasteTypeName: string; wasteTypeNameEn: string; wasteGroupName: string; wasteGroupNameEn: string }[]> {
  const clauses = [sql`wg.is_active = true`, ...buildWhere(filters)];
  const query = sql<{
    wasteTypeName: string;
    wasteTypeNameEn: string;
    wasteGroupName: string;
    wasteGroupNameEn: string;
    totalBags: string;
    totalWeight: string;
  }>`
    SELECT
      wt.name AS "wasteTypeName",
      wt.name_en AS "wasteTypeNameEn",
      wg.name AS "wasteGroupName",
      wg.name_en AS "wasteGroupNameEn",
      COUNT(*) AS "totalBags",
      COALESCE(SUM(wb.weight_in_kgs), 0) AS "totalWeight"
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
    JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
    LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
    ${whereSql(clauses)}
    GROUP BY wg.id, wt.id
    ORDER BY wt.name, wg.name
  `;
  const { rows } = await query.execute(db);
  return rows.map((r) => ({
    wasteTypeName: r.wasteTypeName,
    wasteTypeNameEn: r.wasteTypeNameEn,
    wasteGroupName: r.wasteGroupName,
    wasteGroupNameEn: r.wasteGroupNameEn,
    totalBags: Number(r.totalBags) || 0,
    totalWeight: Number(r.totalWeight) || 0,
  }));
}

export async function getWasteCharacteristicsSummaryChart(
  filters: SummaryFilters,
  isBags?: boolean,
): Promise<{ wasteTypeName: string; wasteTypeNameEn: string; totalBags: number; totalWeight: number }[]> {
  const clauses = [sql`wch.is_active = true`, ...buildWhere(filters)];
  const orderCol = isBags ? sql.raw(`"totalBags"`) : sql.raw(`"totalWeight"`);
  const query = sql<{
    wasteTypeName: string;
    wasteTypeNameEn: string;
    totalBags: string;
    totalWeight: string;
  }>`
    SELECT * FROM (
      SELECT
        wch.name AS "wasteTypeName",
        wch.name_en AS "wasteTypeNameEn",
        COUNT(*) AS "totalBags",
        COALESCE(SUM(wb.weight_in_kgs), 0) AS "totalWeight"
      FROM waste_bag wb
      JOIN waste_classification wc ON wc.id = wb.waste_classification_id
      JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
      LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
      ${whereSql(clauses)}
      GROUP BY wch.id
    ) wb
    ORDER BY ${orderCol} DESC
  `;
  const { rows } = await query.execute(db);
  return rows.map((r) => ({
    wasteTypeName: r.wasteTypeName,
    wasteTypeNameEn: r.wasteTypeNameEn,
    totalBags: Number(r.totalBags) || 0,
    totalWeight: Number(r.totalWeight) || 0,
  }));
}

export async function getMonthlyWasteBagSummaryChart(
  filters: SummaryFilters,
): Promise<{ labelMonth: string; totalBags: number; totalWeight: number }[]> {
  const clauses = buildWhere(filters);
  const query = sql<{ labelMonth: string; totalBags: string; totalWeight: string }>`
    SELECT
      to_char(date_trunc('month', wb.created_at), 'MM-YYYY') AS "labelMonth",
      COUNT(*) AS "totalBags",
      COALESCE(SUM(wb.weight_in_kgs), 0) AS "totalWeight"
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
    ${whereSql(clauses)}
    GROUP BY date_trunc('month', wb.created_at)
    ORDER BY date_trunc('month', wb.created_at)
  `;
  const { rows } = await query.execute(db);
  return rows.map((r) => ({
    labelMonth: r.labelMonth,
    totalBags: Number(r.totalBags) || 0,
    totalWeight: Number(r.totalWeight) || 0,
  }));
}

export async function getRegencyWasteBagSummaryChart(
  filters: SummaryFilters,
  isBags?: boolean,
  orderDirection?: string,
): Promise<{ regencyName: string; totalBags: number; totalWeight: number }[]> {
  const clauses = buildWhere(filters);
  let orderClause = isBags ? sql`ORDER BY wb."totalBags" DESC` : sql`ORDER BY wb."totalWeight" DESC`;
  if (orderDirection) {
    const dir = orderDirection.toUpperCase() === "DESC" ? sql.raw("DESC") : sql.raw("ASC");
    orderClause = sql`ORDER BY wb."provinceId" ${dir}`;
  }
  const query = sql<{ regencyName: string; totalBags: string; totalWeight: string }>`
    SELECT * FROM (
      SELECT
        et.province_id AS "provinceId",
        wb.regency_name AS "regencyName",
        COUNT(*) AS "totalBags",
        COALESCE(SUM(wb.weight_in_kgs), 0) AS "totalWeight"
      FROM waste_bag wb
      JOIN waste_classification wc ON wc.id = wb.waste_classification_id
      LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
      ${whereSql(clauses)}
      GROUP BY wb.regency_id, et.province_id, wb.regency_name
    ) wb
    ${orderClause}
  `;
  const { rows } = await query.execute(db);
  return rows.map((r) => ({
    regencyName: r.regencyName,
    totalBags: Number(r.totalBags) || 0,
    totalWeight: Number(r.totalWeight) || 0,
  }));
}

export async function getProvinceWasteBagSummaryChart(
  filters: SummaryFilters,
  isBags?: boolean,
  orderDirection?: string,
): Promise<{ provinceName: string; totalBags: number; totalWeight: number }[]> {
  const clauses = buildWhere(filters);
  let orderClause = isBags ? sql`ORDER BY wb."totalBags" DESC` : sql`ORDER BY wb."totalWeight" DESC`;
  if (orderDirection) {
    const dir = orderDirection.toUpperCase() === "DESC" ? sql.raw("DESC") : sql.raw("ASC");
    orderClause = sql`ORDER BY wb.province_id ${dir}`;
  }
  const query = sql<{ provinceName: string; totalBags: string; totalWeight: string }>`
    SELECT * FROM (
      SELECT
        et.province_id,
        wb.province_name AS "provinceName",
        COUNT(*) AS "totalBags",
        COALESCE(SUM(wb.weight_in_kgs), 0) AS "totalWeight"
      FROM waste_bag wb
      JOIN waste_classification wc ON wc.id = wb.waste_classification_id
      LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
      ${whereSql(clauses)}
      GROUP BY wb.province_id, et.province_id, wb.province_name
    ) wb
    ${orderClause}
  `;
  const { rows } = await query.execute(db);
  return rows.map((r) => ({
    provinceName: r.provinceName,
    totalBags: Number(r.totalBags) || 0,
    totalWeight: Number(r.totalWeight) || 0,
  }));
}

export interface PaginatedRaw<T> {
  data: T[];
  total: number;
}

export async function getEntityWasteBagSummaryChart(
  filters: SummaryFilters,
  limit: number,
  page: number,
  orderBy?: string,
): Promise<PaginatedRaw<EntityWasteBagSummaryRow & { totalBags: number; totalWeight: number }>> {
  const clauses = buildWhere(filters);
  const offset = (page - 1) * limit;
  const orderDirection = orderBy?.toUpperCase() === "DESC" ? sql.raw("DESC") : sql.raw("ASC");

  const baseFrom = sql`
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
    ${whereSql(clauses)}
  `;

  const dataQuery = sql<{
    provinceName: string | null;
    regencyName: string | null;
    healthcareFacilityName: string;
    totalBags: string;
    totalWeight: string;
  }>`
    SELECT
      wb.province_name AS "provinceName",
      wb.regency_name AS "regencyName",
      et.name AS "healthcareFacilityName",
      COUNT(*) AS "totalBags",
      COALESCE(SUM(wb.weight_in_kgs), 0) AS "totalWeight"
    ${baseFrom}
    GROUP BY wb.healthcare_facility_id, wb.province_name, wb.regency_name, et.name, et.province_id
    ORDER BY et.province_id ${orderDirection}, et.name ASC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countQuery = sql<{ total: string }>`
    SELECT COUNT(*) AS total FROM (
      SELECT 1 ${baseFrom} GROUP BY wb.healthcare_facility_id
    ) grouped
  `;

  const [{ rows }, countResult] = await Promise.all([dataQuery.execute(db), countQuery.execute(db)]);
  const total = Number(countResult.rows[0]?.total) || 0;

  return {
    data: rows.map((r) => ({
      provinceName: r.provinceName ?? undefined,
      regencyName: r.regencyName ?? undefined,
      healthcareFacilityName: r.healthcareFacilityName,
      totalBags: Number(r.totalBags) || 0,
      totalWeight: Number(r.totalWeight) || 0,
      value: 0,
    })),
    total,
  };
}

export async function getEntityWasteBagSummaryByGroup(
  filters: SummaryFilters,
  limit: number,
  page: number,
  orderBy?: string,
): Promise<
  PaginatedRaw<
    EntityWasteBagSummaryByGroupRow & {
      totalBags: number;
      totalWeight: number;
      wasteGroupNameEn: string;
    }
  >
> {
  const clauses = buildWhere(filters);
  const offset = (page - 1) * limit;
  const orderDirection = orderBy?.toUpperCase() === "DESC" ? sql.raw("DESC") : sql.raw("ASC");

  const baseFrom = sql`
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
    LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
    ${whereSql(clauses)}
  `;

  const dataQuery = sql<{
    provinceName: string | null;
    regencyName: string | null;
    healthcareFacilityName: string;
    wasteGroupName: string;
    wasteGroupNameEn: string;
    totalBags: string;
    totalWeight: string;
  }>`
    SELECT
      wb.province_name AS "provinceName",
      wb.regency_name AS "regencyName",
      et.name AS "healthcareFacilityName",
      wg.name AS "wasteGroupName",
      wg.name_en AS "wasteGroupNameEn",
      COUNT(*) AS "totalBags",
      COALESCE(SUM(wb.weight_in_kgs), 0) AS "totalWeight"
    ${baseFrom}
    GROUP BY wb.healthcare_facility_id, wc.waste_group_id, wb.province_name, wb.regency_name, et.name, et.province_id, wg.name, wg.name_en
    ORDER BY et.province_id ${orderDirection}, et.name ASC, wg.name ASC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countQuery = sql<{ total: string }>`
    SELECT COUNT(*) AS total FROM (
      SELECT 1 ${baseFrom} GROUP BY wb.healthcare_facility_id, wc.waste_group_id
    ) grouped
  `;

  const [{ rows }, countResult] = await Promise.all([dataQuery.execute(db), countQuery.execute(db)]);
  const total = Number(countResult.rows[0]?.total) || 0;

  return {
    data: rows.map((r) => ({
      provinceName: r.provinceName ?? undefined,
      regencyName: r.regencyName ?? undefined,
      healthcareFacilityName: r.healthcareFacilityName,
      wasteGroupName: r.wasteGroupName,
      wasteGroupNameEn: r.wasteGroupNameEn,
      totalBags: Number(r.totalBags) || 0,
      totalWeight: Number(r.totalWeight) || 0,
      value: 0,
    })),
    total,
  };
}

export interface CharacteristicsRawRow {
  provinceName: string | null;
  regencyName: string | null;
  healthcareFacilityName: string;
  wasteFullName: string;
  wasteFullNameEn: string;
  totalBagsCurrentMonth: string;
  totalWeightCurrentMonth: string;
  avgBagsPrev3Months: string;
  avgWeightPrev3Months: string;
  maxBagsPrev3Months: string;
  maxWeightPrev3Months: string;
  gapTimbulanBags: string;
  gapTimbulanWeight: string;
}

function buildCharacteristicsQuery(filters: SummaryFilters) {
  const clauses = buildWhere(filters, "wb");
  const currentStart = `${filters.startDate} 00:00:00`;
  const currentEnd = `${filters.endDate} 23:59:59`;

  // Mirrors buildWasteBagSummaryQuery()/buildPrev3MonthsSubquery() in the
  // original repository — the "gap timbulan" (waste-generation gap) figure
  // compares the current period's totals against the max of the prior 3
  // months for the same healthcare facility + waste characteristic.
  const prev3MonthsSubquery = sql`
    SELECT
      monthly.healthcare_facility_id,
      monthly.waste_characteristics_id,
      AVG(monthly."totalBags") AS "avgBagsPrev3Months",
      AVG(monthly."totalWeight") AS "avgWeightPrev3Months",
      MAX(monthly."totalBags") AS "maxBagsPrev3Months",
      MAX(monthly."totalWeight") AS "maxWeightPrev3Months"
    FROM (
      SELECT
        wb2.healthcare_facility_id,
        wc2.waste_characteristics_id,
        to_char(wb2.created_at, 'YYYY-MM') AS "monthLabel",
        COUNT(*) AS "totalBags",
        COALESCE(SUM(wb2.weight_in_kgs), 0) AS "totalWeight"
      FROM waste_bag wb2
      JOIN waste_classification wc2 ON wc2.id = wb2.waste_classification_id
      WHERE (wb2.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') >= (${currentStart}::timestamp - INTERVAL '3 months')
        AND (wb2.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') < ${currentStart}::timestamp
      GROUP BY wb2.healthcare_facility_id, wc2.waste_characteristics_id, "monthLabel"
    ) monthly
    GROUP BY monthly.healthcare_facility_id, monthly.waste_characteristics_id
  `;

  const baseFrom = sql`
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
    JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
    JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
    LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
    LEFT JOIN (${prev3MonthsSubquery}) prev
      ON prev.healthcare_facility_id = wb.healthcare_facility_id
     AND prev.waste_characteristics_id = wc.waste_characteristics_id
    WHERE (wb.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') BETWEEN ${currentStart}::timestamp AND ${currentEnd}::timestamp
    ${whereSql(clauses, "AND")}
  `;

  const selectCols = sql`
    SELECT
      wb.province_name AS "provinceName",
      wb.regency_name AS "regencyName",
      et.name AS "healthcareFacilityName",
      CONCAT(wt.name, ' - ', wg.name, ' - ', wch.name) AS "wasteFullName",
      CONCAT(wt.name_en, ' - ', wg.name_en, ' - ', wch.name_en) AS "wasteFullNameEn",
      COUNT(*) AS "totalBagsCurrentMonth",
      COALESCE(SUM(wb.weight_in_kgs), 0) AS "totalWeightCurrentMonth",
      COALESCE(ROUND(AVG(prev."avgBagsPrev3Months"), 2), 0) AS "avgBagsPrev3Months",
      COALESCE(ROUND(AVG(prev."avgWeightPrev3Months"), 2), 0) AS "avgWeightPrev3Months",
      COALESCE(MAX(prev."maxBagsPrev3Months"), 0) AS "maxBagsPrev3Months",
      COALESCE(MAX(prev."maxWeightPrev3Months"), 0) AS "maxWeightPrev3Months",
      COUNT(*) - COALESCE(MAX(prev."maxBagsPrev3Months"), 0) AS "gapTimbulanBags",
      COALESCE(SUM(wb.weight_in_kgs), 0) - COALESCE(MAX(prev."maxWeightPrev3Months"), 0) AS "gapTimbulanWeight"
  `;

  const groupBy = sql`GROUP BY wb.healthcare_facility_id, wc.waste_characteristics_id, wb.province_name, wb.regency_name, et.name, wt.name, wt.name_en, wg.name, wg.name_en, wch.name, wch.name_en`;

  return { selectCols, baseFrom, groupBy };
}

export async function getEntityWasteBagSummaryByCharacteristics(
  filters: SummaryFilters,
  limit: number,
  page: number,
): Promise<PaginatedRaw<CharacteristicsRawRow>> {
  const offset = (page - 1) * limit;
  const { selectCols, baseFrom, groupBy } = buildCharacteristicsQuery(filters);

  const dataQuery = sql<CharacteristicsRawRow>`
    ${selectCols}
    ${baseFrom}
    ${groupBy}
    ORDER BY wb.province_name ASC, et.name ASC, "wasteFullName" ASC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const countQuery = sql<{ total: string }>`
    SELECT COUNT(*) AS total FROM (
      SELECT 1 ${baseFrom} ${groupBy}
    ) grouped
  `;
  const [{ rows }, countResult] = await Promise.all([dataQuery.execute(db), countQuery.execute(db)]);
  return { data: rows, total: Number(countResult.rows[0]?.total) || 0 };
}

// Used only by the export endpoint — no LIMIT/OFFSET pagination metadata
// needed, just the raw rows to stream into the xlsx workbook.
export async function getEntityWasteBagSummaryByCharacteristicsExport(
  filters: SummaryFilters,
  limit: number,
  page: number,
): Promise<CharacteristicsRawRow[]> {
  const offset = (page - 1) * limit;
  const { selectCols, baseFrom, groupBy } = buildCharacteristicsQuery(filters);
  const dataQuery = sql<CharacteristicsRawRow>`
    ${selectCols}
    ${baseFrom}
    ${groupBy}
    ORDER BY wb.province_name ASC, et.name ASC, "wasteFullName" ASC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const { rows } = await dataQuery.execute(db);
  return rows;
}
