// ---------------------------------------------------------------------------
// This module reads from many tables it does not own — none are yet
// registered in db/db.ts's `Database` interface (same situation as this
// module's siblings, dashboard-activity and wastebag-monitoring-dashboard).
// Column lists below are for a later integration step to wire in
// (types/migrations), reverse-engineered field-for-field from
// apps/wms-service's infrastructure/database/repositories/DashboardRepositoryImpl.ts
// and its underlying Sequelize models. The original ran against MySQL; this
// file's queries are written in Postgres dialect (the target DB), translating
// GROUP_CONCAT/CONVERT_TZ/DATE_FORMAT/backtick-identifiers/LIKE to their
// Postgres equivalents while preserving the original's exact filter/group/
// order business logic — same one intentional dialect adaptation the
// wastebag-monitoring-dashboard sibling documents.
//
// waste_bag (subset of columns referenced by this module):
//   id                                       bigint / serial, PK
//   healthcare_facility_id                   integer, FK -> entities.id
//   healthcare_facility_name                 varchar
//   province_id                              integer
//   province_name                            varchar
//   regency_id                               integer
//   regency_name                             varchar
//   weight_in_kgs                            numeric
//   waste_classification_id                  integer, FK -> waste_classification.id
//   waste_source_id                          integer, FK -> waste_source.id
//   waste_status                             varchar
//   max_storage_hours                        integer / timestamp (storageDateLimit)
//   waste_treatment_group_id                 integer, nullable, FK -> waste_treatment_group.id
//   waste_treatment_external_group_id        integer, nullable, FK -> waste_treatment_external_group.id
//   waste_transportation_external_group_id   integer, nullable, FK -> waste_transportation_external_group.id
//   transporter_id                           integer, FK -> entities.id
//   third_party_id                           integer, FK -> entities.id
//   manifest_doc_number                      varchar
//   waste_bag_qr_code_id                     varchar/bigint (joined by waste_bag_audit_trail.waste_bag_id)
//   created_at                               timestamp
//
// waste_classification:
//   id                          bigint / serial, PK
//   waste_type_id               integer, FK -> waste_hierarchy.id
//   waste_group_id               integer, FK -> waste_hierarchy.id
//   waste_characteristics_id    integer, FK -> waste_hierarchy.id
//   waste_code                  varchar
//   disposal_method             varchar
//
// waste_hierarchy:
//   id            bigint / serial, PK
//   name          varchar
//   name_en       varchar
//   level         integer
//   is_active     boolean
//
// waste_source:
//   id                              bigint / serial, PK
//   source_type                     varchar ('INTERNAL' | 'INTERNAL_TREATMENT' | other/external)
//   internal_source_name            varchar
//   internal_treatment_name         varchar
//   external_healthcare_facility_name varchar
//
// waste_treatment_group:
//   id          bigint / serial, PK
//   group_id    varchar
//
// waste_transportation_external_group:
//   id                          bigint / serial, PK
//   group_id                    varchar
//   total_weight_in_kgs         numeric
//   transporter_operator_id     varchar(36), FK -> users.user_uuid
//   treatment_operator_id       varchar(36), FK -> users.user_uuid
//   transporter_vehicle_id      integer, FK -> partner_vehicle.id
//   transportation_status       varchar ('IN_TRANSIT' | other)
//   updated_at                  timestamp
//   created_at                  timestamp
//
// waste_treatment_external_group:
//   id                          bigint / serial, PK
//   treatment_operator_id       varchar(36), FK -> users.user_uuid
//   updated_at                  timestamp
//
// partner_vehicle:
//   id               bigint / serial, PK
//   transporter_id   integer, FK -> entities.id
//   entity_id        integer, FK -> entities.id
//   vehicle_number   varchar
//
// partnership:
//   id                    bigint / serial, PK
//   provider_id           integer, FK -> entities.id
//   provider_type         varchar
//   partnership_status    varchar ('ACTIVE' | other)
//
// users:
//   user_uuid    varchar(36), PK
//   firstname    varchar
//
// waste_bag_audit_trail (already registered in db.ts as WasteBagAuditTrailTable,
// repeated here for this module's join context — the original also joins on
// a `waste_bag_status`/`is_group` pair not present in that table's current
// registration):
//   waste_bag_id    bigint, FK -> waste_bag.waste_bag_qr_code_id
//   waste_bag_status varchar
//   is_group         boolean
//   created_at       timestamp
//
// entity_location:
//   entity_id     integer, FK -> entities.id
//   province_id   integer
//   city_id       integer
//
// entities (already registered in db.ts as EntitiesTable — repeated here
// only for this module's join context):
//   id            bigint / serial, PK
//   name          varchar
// ---------------------------------------------------------------------------

import { sql } from "kysely";
import { db } from "../db";
import { isValidDateString } from "../../shared/utils/date-range";
import type {
  DashboardHealthcareRow,
  DashboardThirdPartyRow,
  DashboardWasteCharacteristicsSummaryRow,
  DashboardWasteGroupDetailsByActionRow,
  SummaryPerDayData,
  WasteHierarchyPivotRow,
} from "./dashboard.types";

function todayStr(): string {
  return new Date().toLocaleDateString("en-CA");
}

// Postgres column identifiers can't contain a double quote; the original's
// MySQL backtick-quoted alias had the equivalent restriction on backticks.
function sanitizeIdentifierPart(s: string): string {
  return s.replace(/"/g, "'");
}

interface PivotWasteType {
  wasteTypeId: number;
  name: string;
}

// Mirrors the original's GROUP_CONCAT-built dynamic pivot-column SQL
// fragment (one SUM(CASE...) column per distinct waste_type_id/name found in
// the matched rows) — reproduced here as a two-step query (distinct types,
// then pivot), the same pattern dashboard-activity.repository.ts uses for its
// day-of-month pivot columns, since Postgres has no GROUP_CONCAT-into-SQL
// equivalent worth hand-rolling.
async function getDistinctWasteTypes(
  dateClause: ReturnType<typeof sql>,
  extraClauses: ReturnType<typeof sql>[],
): Promise<PivotWasteType[]> {
  const clauses = [
    sql`wt.level = 0`,
    sql`wb.weight_in_kgs > 0`,
    sql`wt.is_active = true`,
    dateClause,
    ...extraClauses,
  ];
  const result = await sql<{ wasteTypeId: number; name: string }>`
    SELECT DISTINCT wc.waste_type_id AS "wasteTypeId", wt.name AS name
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
    WHERE ${sql.join(clauses, sql` AND `)}
    ORDER BY wt.name
  `.execute(db);
  return result.rows;
}

function pivotColumns(types: PivotWasteType[]) {
  return types.map(
    (t) =>
      sql`, SUM(CASE WHEN wc.waste_type_id = ${t.wasteTypeId} THEN wb.weight_in_kgs ELSE 0 END) AS ${sql.raw(
        `"${t.wasteTypeId}_${sanitizeIdentifierPart(t.name)}"`,
      )}`,
  );
}

export async function getSummaryWasteHierarchy(
  limit: number,
  page: number,
  startDate?: string,
  endDate?: string,
): Promise<{ data: WasteHierarchyPivotRow[]; total: number }> {
  const offset = (page - 1) * limit;
  const today = todayStr();
  const finalStartDate = isValidDateString(startDate) ? startDate : today;
  const finalEndDate = isValidDateString(endDate) ? endDate : today;
  const startTs = `${finalStartDate} 00:00:00`;
  const endTs = `${finalEndDate} 23:59:59`;
  const dateClause = sql`wb.created_at BETWEEN ${startTs}::timestamp AND ${endTs}::timestamp`;

  const types = await getDistinctWasteTypes(dateClause, []);
  const pivotColsSql = sql.join(pivotColumns(types), sql``);

  const dataResult = await sql<WasteHierarchyPivotRow>`
    SELECT wb.province_id AS "provinceId", wb.province_name AS "provinceName",
      COUNT(wb.id) AS "totalWasteBag", COALESCE(SUM(wb.weight_in_kgs), 0) AS "totalWeight"
      ${pivotColsSql}
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
    WHERE wb.weight_in_kgs > 0 AND wt.level = 0 AND ${dateClause}
    GROUP BY wb.province_id, wb.province_name
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  const countResult = await sql<{ total: string | number }>`
    SELECT COUNT(DISTINCT wb.province_id) AS total
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
    WHERE wt.level = 0 AND wb.weight_in_kgs > 0 AND ${dateClause}
  `.execute(db);

  return { data: dataResult.rows, total: Number(countResult.rows[0]?.total ?? 0) };
}

export async function getSummaryWasteHierarchyByProvince(
  limit: number,
  page: number,
  provinceId: number,
  startDate?: string,
  endDate?: string,
): Promise<{ data: WasteHierarchyPivotRow[]; total: number }> {
  const offset = (page - 1) * limit;
  const today = todayStr();
  const finalStartDate = isValidDateString(startDate) ? startDate : today;
  const finalEndDate = isValidDateString(endDate) ? endDate : today;
  const startTs = `${finalStartDate} 00:00:00`;
  const endTs = `${finalEndDate} 23:59:59`;
  const dateClause = sql`wb.created_at BETWEEN ${startTs}::timestamp AND ${endTs}::timestamp`;
  const provinceClause = sql`wb.province_id = ${provinceId}`;

  const types = await getDistinctWasteTypes(dateClause, [provinceClause]);
  const pivotColsSql = sql.join(pivotColumns(types), sql``);

  const dataResult = await sql<WasteHierarchyPivotRow>`
    SELECT wb.regency_id AS "cityId", wb.regency_name AS "cityName", wb.province_id AS "provinceId",
      COALESCE(SUM(wb.weight_in_kgs), 0) AS "totalWeight", COUNT(wb.id) AS "totalWasteBag"
      ${pivotColsSql}
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
    WHERE wt.level = 0 AND wb.weight_in_kgs > 0 AND ${dateClause} AND ${provinceClause}
    GROUP BY wb.regency_id, wb.regency_name, wb.province_id
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  const countResult = await sql<{ total: string | number }>`
    SELECT COUNT(DISTINCT wb.regency_id) AS total
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
    WHERE wt.level = 0 AND wb.weight_in_kgs > 0 AND ${dateClause} AND ${provinceClause}
  `.execute(db);

  return { data: dataResult.rows, total: Number(countResult.rows[0]?.total ?? 0) };
}

export async function getSummaryWasteHierarchyByCity(
  limit: number,
  page: number,
  cityId: number,
  startDate?: string,
  endDate?: string,
  healthcareFacilityId?: number,
): Promise<{ data: WasteHierarchyPivotRow[]; total: number }> {
  const offset = (page - 1) * limit;
  const today = todayStr();
  const finalStartDate = isValidDateString(startDate) ? startDate : today;
  const finalEndDate = isValidDateString(endDate) ? endDate : today;
  const startTs = `${finalStartDate} 00:00:00`;
  const endTs = `${finalEndDate} 23:59:59`;
  const dateClause = sql`wb.created_at BETWEEN ${startTs}::timestamp AND ${endTs}::timestamp`;
  const extraClauses = [sql`wb.regency_id = ${cityId}`];
  if (healthcareFacilityId) {
    extraClauses.push(sql`wb.healthcare_facility_id = ${healthcareFacilityId}`);
  }
  const extraSql = sql.join(extraClauses, sql` AND `);

  const types = await getDistinctWasteTypes(dateClause, extraClauses);
  const pivotColsSql = sql.join(pivotColumns(types), sql``);

  const dataResult = await sql<WasteHierarchyPivotRow>`
    SELECT wb.healthcare_facility_id AS "healthcareFacilityId",
      wb.healthcare_facility_name AS "healthcareName",
      wb.province_id AS "provinceId", wb.regency_id AS "cityId",
      COALESCE(SUM(wb.weight_in_kgs), 0) AS "totalWeight", COUNT(wb.id) AS "totalWasteBag"
      ${pivotColsSql}
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
    WHERE wt.level = 0 AND wb.weight_in_kgs > 0 AND ${dateClause} AND ${extraSql}
    GROUP BY wb.healthcare_facility_id, wb.healthcare_facility_name, wb.province_id, wb.regency_id
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  const countResult = await sql<{ total: string | number }>`
    SELECT COUNT(DISTINCT wb.healthcare_facility_id) AS total
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
    WHERE wt.level = 0 AND wb.weight_in_kgs > 0 AND ${dateClause} AND ${extraSql}
  `.execute(db);

  return { data: dataResult.rows, total: Number(countResult.rows[0]?.total ?? 0) };
}

export interface AdminHealthcareFilters {
  wasteTypeId?: number;
  healthcareFacilityId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
  wasteStatus?: string;
  search?: string;
}

export async function getWasteGroupByAdminHealthcareFacility(
  limit: number,
  page: number,
  filters: AdminHealthcareFilters,
): Promise<{ data: DashboardHealthcareRow[]; total: number }> {
  const offset = (page - 1) * limit;
  const clauses: ReturnType<typeof sql>[] = [];
  if (filters.wasteTypeId) clauses.push(sql`wc.waste_type_id = ${filters.wasteTypeId}`);
  if (filters.healthcareFacilityId) {
    clauses.push(sql`wb.healthcare_facility_id = ${filters.healthcareFacilityId}`);
  }
  if (filters.wasteGroupId) clauses.push(sql`wc.waste_group_id = ${filters.wasteGroupId}`);
  if (filters.wasteCharacteristicsId) {
    clauses.push(sql`wc.waste_characteristics_id = ${filters.wasteCharacteristicsId}`);
  }
  if (filters.wasteStatus) clauses.push(sql`wb.waste_status = ${filters.wasteStatus}`);
  if (filters.search) {
    // Postgres equivalent of the original's
    // `CONCAT(wb.id, '-', DATE_FORMAT(wb.created_at, '%d-%m-%Y')) LIKE :search`
    // — case-insensitive per convention (ILIKE), unlike the original's
    // case-sensitive MySQL LIKE (a deliberate improvement, not a behavior gap).
    clauses.push(
      sql`(wb.id || '-' || to_char(wb.created_at, 'DD-MM-YYYY')) ILIKE ${`%${filters.search}%`}`,
    );
  }
  const whereSql = clauses.length ? sql`WHERE ${sql.join(clauses, sql` AND `)}` : sql``;

  // Postgres has no MySQL-style "pick an arbitrary non-aggregated column
  // per group" behavior, so the per-group aggregate (totalWeightInKgs) is
  // computed with a window function and one representative row per group
  // (the most recently created waste bag) is selected via DISTINCT ON,
  // keyed on the same columns the original GROUP BY used.
  const dataResult = await sql<DashboardHealthcareRow>`
    SELECT DISTINCT ON (
      wb.waste_treatment_external_group_id, wb.waste_treatment_group_id, wb.healthcare_facility_id
    )
      CASE WHEN wb.waste_treatment_group_id IS NOT NULL THEN wtg.group_id ELSE wteg.group_id END AS "wasteGroupNumber",
      c.name AS "wasteTypeName",
      d.name AS "wasteGroupName",
      e.name AS "wasteCharacteristicsName",
      c.name_en AS "wasteTypeNameEn",
      d.name_en AS "wasteGroupNameEn",
      e.name_en AS "wasteCharacteristicsNameEn",
      CASE
        WHEN ws.source_type = 'INTERNAL' THEN ws.internal_source_name
        WHEN ws.source_type = 'INTERNAL_TREATMENT' THEN ws.internal_treatment_name
        ELSE ws.external_healthcare_facility_name
      END AS "wasteSource",
      wb.created_at AS "wasteInDate",
      wb.max_storage_hours AS "storageDateLimit",
      SUM(wb.weight_in_kgs) OVER (
        PARTITION BY wb.waste_treatment_external_group_id, wb.waste_treatment_group_id, wb.healthcare_facility_id
      ) AS "totalWeightInKgs",
      NULL AS "lastFollowUp",
      wb.waste_status AS "wasteStatus",
      wc.disposal_method AS "disposalMethod",
      wb.healthcare_facility_id AS "healthcareFacilityId",
      wc.waste_type_id AS "wasteTypeId",
      wc.waste_group_id AS "wasteGroupId",
      wc.waste_characteristics_id AS "wasteCharacteristicsId",
      wteg.transporter_operator_id AS "transporterOperatorId",
      wteg.treatment_operator_id AS "treatmentOperatorId",
      CASE WHEN wb.waste_treatment_group_id IS NOT NULL THEN wb.waste_treatment_group_id ELSE wb.waste_treatment_external_group_id END AS "groupId",
      CASE WHEN wb.waste_treatment_group_id IS NOT NULL THEN 'IN' ELSE 'EX' END AS "treatmentType",
      uto.firstname AS "transporterOperatorName",
      uteo.firstname AS "treatmentOperatorName"
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy c ON c.id = wc.waste_type_id
    JOIN waste_hierarchy d ON d.id = wc.waste_group_id
    JOIN waste_hierarchy e ON e.id = wc.waste_characteristics_id
    JOIN waste_source ws ON ws.id = wb.waste_source_id
    LEFT JOIN waste_treatment_group wtg ON wtg.id = wb.waste_treatment_group_id
    LEFT JOIN waste_transportation_external_group wteg ON wteg.id = wb.waste_transportation_external_group_id
    LEFT JOIN users uto ON uto.user_uuid::text = wteg.transporter_operator_id
    LEFT JOIN users uteo ON uteo.user_uuid::text = wteg.treatment_operator_id
    ${whereSql}
    ORDER BY wb.waste_treatment_external_group_id, wb.waste_treatment_group_id, wb.healthcare_facility_id, wb.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  // Cross-service operator-name enrichment (getUsersDetail against apps/core
  // in the original) is populated above from the local `users` table
  // instead, same join pattern as this file's other transporter/treatment
  // operator name lookups (e.g. getWasteGroupByTransporter below).

  const countResult = await sql<{ total: string | number }>`
    SELECT COUNT(DISTINCT
      COALESCE(wb.waste_treatment_external_group_id::text, 'extnull') || '-' ||
      COALESCE(wb.waste_treatment_group_id::text, 'grpnull') || '-' ||
      wb.healthcare_facility_id
    ) AS total
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy c ON c.id = wc.waste_type_id
    JOIN waste_hierarchy d ON d.id = wc.waste_group_id
    JOIN waste_hierarchy e ON e.id = wc.waste_characteristics_id
    JOIN waste_source ws ON ws.id = wb.waste_source_id
    ${whereSql}
  `.execute(db);

  return { data: dataResult.rows, total: Number(countResult.rows[0]?.total ?? 0) };
}

export interface TransporterFilters {
  healthcareFacilityId?: number;
  provinceId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export async function getWasteGroupByTransporter(
  limit: number,
  page: number,
  entityId: number,
  filters: TransporterFilters,
): Promise<{ data: DashboardThirdPartyRow[]; total: number }> {
  const offset = (page - 1) * limit;
  const clauses: ReturnType<typeof sql>[] = [sql`wb.transporter_id = ${entityId}`];
  if (filters.healthcareFacilityId) {
    clauses.push(sql`wb.healthcare_facility_id = ${filters.healthcareFacilityId}`);
  }
  if (filters.provinceId) clauses.push(sql`wb.province_id = ${filters.provinceId}`);
  if (filters.cityId) clauses.push(sql`wb.regency_id = ${filters.cityId}`);
  if (isValidDateString(filters.startDate) && isValidDateString(filters.endDate)) {
    clauses.push(
      sql`wteg.created_at BETWEEN ${`${filters.startDate} 00:00:00`}::timestamp AND ${`${filters.endDate} 23:59:59`}::timestamp`,
    );
  }
  if (filters.search) {
    const like = `%${filters.search}%`;
    clauses.push(
      sql`(wb.healthcare_facility_name ILIKE ${like} OR wteg.group_id ILIKE ${like} OR ut.firstname ILIKE ${like} OR pv.vehicle_number ILIKE ${like})`,
    );
  }
  const whereSql = sql`WHERE ${sql.join(clauses, sql` AND `)}`;

  const dataResult = await sql<DashboardThirdPartyRow>`
    SELECT wteg.id AS "wasteGroupId", wteg.group_id AS "wasteGroupNumber",
      wb.healthcare_facility_id AS "healthcareFacilityId", wteg.total_weight_in_kgs AS "totalWeightInKgs",
      wteg.transporter_operator_id AS "transporterOperatorId",
      COALESCE(pvwteg.vehicle_number, pv.vehicle_number) AS "vehicleNumber",
      wteg.treatment_operator_id AS "treatmentOperatorId", wb.province_id AS "provinceId", wb.regency_id AS "cityId",
      wb.healthcare_facility_name AS "healthcareName", wb.manifest_doc_number AS "manifestNumber",
      ut.firstname AS "transporterOperatorName",
      wteg.updated_at AS "handOverTime"
    FROM waste_bag wb
    JOIN waste_transportation_external_group wteg
      ON wteg.id = wb.waste_transportation_external_group_id AND wteg.transportation_status = 'IN_TRANSIT'
    JOIN partner_vehicle pv ON pv.transporter_id = wb.transporter_id AND pv.entity_id = wb.healthcare_facility_id
    LEFT JOIN partner_vehicle pvwteg ON pvwteg.id = wteg.transporter_vehicle_id
    LEFT JOIN users ut ON ut.user_uuid::text = wteg.transporter_operator_id
    ${whereSql}
    GROUP BY wb.waste_transportation_external_group_id, wb.healthcare_facility_id,
      wteg.id, wteg.group_id, wteg.total_weight_in_kgs, wteg.transporter_operator_id,
      pvwteg.vehicle_number, pv.vehicle_number, wteg.treatment_operator_id, wb.province_id,
      wb.regency_id, wb.healthcare_facility_name, wb.manifest_doc_number, ut.firstname, wteg.updated_at
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  const countResult = await sql<{ total: string | number }>`
    SELECT COUNT(*) AS total FROM (
      SELECT wteg.id
      FROM waste_bag wb
      JOIN waste_transportation_external_group wteg
        ON wteg.id = wb.waste_transportation_external_group_id AND wteg.transportation_status = 'IN_TRANSIT'
      JOIN partner_vehicle pv ON pv.transporter_id = wb.transporter_id AND pv.entity_id = wb.healthcare_facility_id
      LEFT JOIN users ut ON ut.user_uuid::text = wteg.transporter_operator_id
      ${whereSql}
      GROUP BY wb.waste_transportation_external_group_id, wb.healthcare_facility_id, wteg.id
    ) a
  `.execute(db);

  return { data: dataResult.rows, total: Number(countResult.rows[0]?.total ?? 0) };
}

export interface TreatmentFilters {
  healthcareFacilityId?: number;
  provinceId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export async function getWasteGroupByTreatmentAll(
  limit: number,
  page: number,
  entityId: number,
  disposalTreatment: string,
  filters: TreatmentFilters,
): Promise<{ data: DashboardThirdPartyRow[]; total: number }> {
  const offset = (page - 1) * limit;
  const clauses: ReturnType<typeof sql>[] = [];
  if (filters.healthcareFacilityId) {
    clauses.push(sql`wb.healthcare_facility_id = ${filters.healthcareFacilityId}`);
  }
  if (filters.provinceId) clauses.push(sql`wb.province_id = ${filters.provinceId}`);
  if (filters.cityId) clauses.push(sql`wb.regency_id = ${filters.cityId}`);
  if (isValidDateString(filters.startDate) && isValidDateString(filters.endDate)) {
    // Original: CONVERT_TZ(wteg.created_at, '+00:00', '+07:00') BETWEEN ...
    // (MySQL) -> Postgres AT TIME ZONE translation, same as
    // wastebag-monitoring-dashboard.repository.ts's buildWhere.
    clauses.push(
      sql`(wteg.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') BETWEEN ${`${filters.startDate} 00:00:00`} AND ${`${filters.endDate} 23:59:59`}`,
    );
  }

  let joinTreatmentExternal = sql``;
  let extraSelect = sql``;
  if (disposalTreatment === "TREATMENT") {
    clauses.push(sql`p.provider_type IN ('TREATMENT')`);
    clauses.push(sql`wb.waste_status IN ('RECYCLED', 'LANDFILLED')`);
    clauses.push(sql`wb.third_party_id = ${entityId}`);
    joinTreatmentExternal = sql`JOIN waste_treatment_external_group wtrg ON wtrg.id = wb.waste_treatment_external_group_id
      LEFT JOIN users u ON u.user_uuid::text = wtrg.treatment_operator_id`;
    extraSelect = sql`, u.firstname AS "treatmentOperatorName", to_char(wtrg.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.000"Z"') AS "handOverTime"`;
  } else if (disposalTreatment === "LANDFILLER") {
    clauses.push(sql`wb.waste_status = 'LANDFILLED'`);
    clauses.push(sql`p.provider_type IN ('LANDFILLER')`);
    clauses.push(sql`wb.third_party_id = ${entityId}`);
    joinTreatmentExternal = sql`JOIN waste_treatment_external_group wtrg ON wtrg.id = wb.waste_treatment_external_group_id
      LEFT JOIN users u ON u.user_uuid::text = wtrg.treatment_operator_id`;
    extraSelect = sql`, u.firstname AS "treatmentOperatorName", to_char(wtrg.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.000"Z"') AS "handOverTime"`;
  } else if (disposalTreatment === "RECYCLER") {
    clauses.push(sql`wb.waste_status = 'RECYCLED'`);
    clauses.push(sql`p.provider_type IN ('TRANSPORTER_RECYCLER', 'RECYCLER')`);
    clauses.push(sql`wb.transporter_id = ${entityId}`);
    extraSelect = sql`, ut.firstname AS "treatmentOperatorName", to_char(wteg.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.000"Z"') AS "handOverTime"`;
  } else if (disposalTreatment === "SPECIALIZED") {
    clauses.push(sql`wb.waste_status IN ('COLLECTED')`);
    clauses.push(sql`p.provider_type IN ('SPECIALIZED_TREATMENT_PROVIDER', 'TREATMENT')`);
    clauses.push(sql`wb.transporter_id = ${entityId}`);
    extraSelect = sql`, ut.firstname AS "treatmentOperatorName", to_char(wteg.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.000"Z"') AS "handOverTime"`;
  } else if (disposalTreatment === "GOVERNMENT") {
    clauses.push(sql`wb.waste_status IN ('DISPOSED')`);
    clauses.push(sql`p.provider_type IN ('TRANSPORTER_GOVERNMENT', 'TREATMENT')`);
    clauses.push(sql`wb.transporter_id = ${entityId}`);
    extraSelect = sql`, ut.firstname AS "treatmentOperatorName", to_char(wteg.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.000"Z"') AS "handOverTime"`;
  } else if (disposalTreatment === "GOVERNMENT_WASTE_BANK") {
    clauses.push(sql`wb.waste_status IN ('DISPOSED')`);
    clauses.push(sql`p.provider_type IN ('TREATMENT', 'LANDFILLER', 'RECYCLER')`);
    clauses.push(sql`wb.third_party_id = ${entityId}`);
    joinTreatmentExternal = sql`JOIN waste_treatment_external_group wtrg ON wtrg.id = wb.waste_treatment_external_group_id
      LEFT JOIN users u ON u.user_uuid::text = wtrg.treatment_operator_id`;
    extraSelect = sql`, u.firstname AS "treatmentOperatorName", to_char(wtrg.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.000"Z"') AS "handOverTime"`;
  }
  // Any other disposalTreatment value: no extra clauses/joins/select — mirrors
  // the original's silent fall-through (no `else` branch there either).

  if (filters.search) {
    const like = `%${filters.search}%`;
    clauses.push(
      sql`(wb.healthcare_facility_name ILIKE ${like} OR wteg.group_id ILIKE ${like} OR ut.firstname ILIKE ${like} OR pv.vehicle_number ILIKE ${like})`,
    );
  }
  const whereSql = clauses.length ? sql`WHERE ${sql.join(clauses, sql` AND `)}` : sql``;

  const dataResult = await sql<DashboardThirdPartyRow>`
    SELECT wteg.id AS "wasteGroupId", wteg.group_id AS "wasteGroupNumber",
      wb.healthcare_facility_id AS "healthcareFacilityId", wteg.total_weight_in_kgs AS "totalWeightInKgs",
      wteg.transporter_operator_id AS "transporterOperatorId", pv.vehicle_number AS "vehicleNumber",
      wb.province_id AS "provinceId", wb.regency_id AS "cityId",
      wb.manifest_doc_number AS "manifestNumber", wb.healthcare_facility_name AS "healthcareName",
      ut.firstname AS "transporterOperatorName",
      et.name AS "transporterName", e.name AS "thirdPartyName"
      ${extraSelect}
    FROM waste_bag wb
    JOIN waste_transportation_external_group wteg
      ON wteg.id = wb.waste_transportation_external_group_id AND wteg.transportation_status = 'IN_TRANSIT'
    JOIN partnership p ON p.provider_id = wb.third_party_id AND p.partnership_status = 'ACTIVE'
    JOIN partner_vehicle pv ON pv.transporter_id = wb.transporter_id AND pv.entity_id = wb.healthcare_facility_id
    ${joinTreatmentExternal}
    LEFT JOIN users ut ON ut.user_uuid::text = wteg.transporter_operator_id
    LEFT JOIN entities et ON et.id = wb.transporter_id
    LEFT JOIN entities e ON e.id = wb.third_party_id
    ${whereSql}
    GROUP BY wb.waste_transportation_external_group_id, wb.healthcare_facility_id,
      wteg.id, wteg.group_id, wteg.total_weight_in_kgs, wteg.transporter_operator_id, pv.vehicle_number,
      wb.province_id, wb.regency_id, wb.manifest_doc_number, wb.healthcare_facility_name, ut.firstname,
      et.name, e.name
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  const countResult = await sql<{ total: string | number }>`
    SELECT COUNT(DISTINCT wb.waste_transportation_external_group_id || '-' || wb.healthcare_facility_id) AS total
    FROM waste_bag wb
    JOIN waste_transportation_external_group wteg
      ON wteg.id = wb.waste_transportation_external_group_id AND wteg.transportation_status = 'IN_TRANSIT'
    JOIN partnership p ON p.provider_id = wb.third_party_id AND p.partnership_status = 'ACTIVE'
    JOIN partner_vehicle pv ON pv.transporter_id = wb.transporter_id AND pv.entity_id = wb.healthcare_facility_id
    ${joinTreatmentExternal}
    ${whereSql}
  `.execute(db);

  return { data: dataResult.rows, total: Number(countResult.rows[0]?.total ?? 0) };
}

export async function getWasteGroupDetailsByAction(
  limit: number,
  page: number,
  wasteGroupId: number,
  treatmentType: string,
): Promise<{ data: DashboardWasteGroupDetailsByActionRow[]; total: number }> {
  const offset = (page - 1) * limit;
  const whereClause =
    treatmentType === "IN"
      ? sql`wb.waste_treatment_external_group_id = ${wasteGroupId}`
      : sql`wb.waste_transportation_external_group_id = ${wasteGroupId}`;

  const dataResult = await sql<DashboardWasteGroupDetailsByActionRow>`
    SELECT wba.waste_bag_status AS "wasteBagStatus", MAX(wba.created_at) AS "updatedAtStatus"
    FROM waste_bag wb
    JOIN waste_bag_audit_trail wba ON wba.waste_bag_id = wb.waste_bag_qr_code_id
    WHERE ${whereClause} AND wba.is_group = true
    GROUP BY wb.waste_transportation_external_group_id, wba.waste_bag_status
    ORDER BY MAX(wba.created_at) ASC
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  const countResult = await sql<{ total: string | number }>`
    SELECT COUNT(*) AS total FROM (
      SELECT 1
      FROM waste_bag wb
      JOIN waste_bag_audit_trail wba ON wba.waste_bag_id = wb.waste_bag_qr_code_id
      WHERE ${whereClause} AND wba.is_group = true
      GROUP BY wb.waste_transportation_external_group_id, wba.waste_bag_status
    ) sub
  `.execute(db);

  return { data: dataResult.rows, total: Number(countResult.rows[0]?.total ?? 0) };
}

export async function getWasteCharacteristicsSummary(
  wasteTypeId: number,
  startDate: string,
  endDate: string,
  provinceId?: number,
  cityId?: number,
  healthcareFacilityId?: number,
): Promise<DashboardWasteCharacteristicsSummaryRow[]> {
  const clauses: ReturnType<typeof sql>[] = [
    sql`wc.waste_type_id = ${wasteTypeId}`,
    sql`wb.created_at BETWEEN ${`${startDate} 00:00:00`}::timestamp AND ${`${endDate} 23:59:59`}::timestamp`,
  ];
  if (provinceId) clauses.push(sql`el.province_id = ${provinceId}`);
  if (cityId) clauses.push(sql`el.city_id = ${cityId}`);
  if (healthcareFacilityId) {
    clauses.push(sql`wb.healthcare_facility_id = ${healthcareFacilityId}`);
  }

  const result = await sql<DashboardWasteCharacteristicsSummaryRow>`
    SELECT
      wg.name AS "wasteGroupName",
      wch.name AS "wasteCharacteristicsName",
      wc.waste_code AS "wasteCode",
      COUNT(*) AS "totalWasteBag",
      SUM(wb.weight_in_kgs) AS "totalWeight"
    FROM waste_bag wb
    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
    JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
    JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
    JOIN entity_location el ON el.entity_id = wb.healthcare_facility_id
    WHERE ${sql.join(clauses, sql` AND `)}
    GROUP BY wc.waste_characteristics_id, wc.waste_group_id, wc.waste_code, wg.name, wch.name
  `.execute(db);

  return result.rows.map((r) => ({
    wasteGroupName: r.wasteGroupName,
    wasteCharacteristicsName: r.wasteCharacteristicsName,
    wasteCode: r.wasteCode,
    totalWasteBag: Number(r.totalWasteBag) || 0,
    totalWeight: Number(r.totalWeight) || 0,
  }));
}

export async function getSummaryPerDay(entityId: number): Promise<SummaryPerDayData> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Mirrors WasteTransportationExternalGroupModel.findAll(...) filtered by
  // transportationStatus='IN_TRANSIT' + an include on wasteBags where
  // healthcareFacilityId = entityId, created_at between start/end of today —
  // reproduced as a join + aggregate rather than app-side reduce.
  const outResult = await sql<{ totalBags: string | number | null; totalWeight: string | number | null }>`
    SELECT COALESCE(SUM(wteg.total_bags_count), 0) AS "totalBags",
      COALESCE(SUM(wteg.total_weight_in_kgs), 0) AS "totalWeight"
    FROM waste_transportation_external_group wteg
    JOIN waste_bag wb ON wb.waste_transportation_external_group_id = wteg.id
    WHERE wteg.transportation_status = 'IN_TRANSIT'
      AND wteg.created_at BETWEEN ${startOfDay} AND ${endOfDay}
      AND wb.healthcare_facility_id = ${entityId}
  `.execute(db);

  const thisDayResult = await sql<{ totalBags: string | number | null; totalWeight: string | number | null }>`
    SELECT COUNT(*) AS "totalBags", COALESCE(SUM(wb.weight_in_kgs), 0) AS "totalWeight"
    FROM waste_bag wb
    WHERE wb.created_at BETWEEN ${startOfDay} AND ${endOfDay}
      AND wb.healthcare_facility_id = ${entityId}
  `.execute(db);

  const out = outResult.rows[0];
  const thisDay = thisDayResult.rows[0];

  return {
    // The original floors the out-group total and appends the literal
    // string ' Kg' to both totals — a display-formatting quirk baked into
    // the repository return type (`totalWeight: string`), preserved
    // verbatim rather than "fixed" into a number.
    wasteBagOutResult: {
      totalBags: Math.trunc(Number(out?.totalBags ?? 0)),
      totalWeight: `${Math.floor(Number(out?.totalWeight ?? 0))} Kg`,
    },
    wasteBagThisDay: {
      totalBags: Math.trunc(Number(thisDay?.totalBags ?? 0)),
      totalWeight: `${Number(thisDay?.totalWeight ?? 0)} Kg`,
    },
  };
}
