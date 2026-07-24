import { ActiveRateQueryParams } from "./active-rate.schema.js"

export class ActiveRateQuery {
  private readonly tableName = "dashboard_wms_active_rate"
  private readonly weeklyTableName = "dashboard_wms_active_rate_week"

  private buildWhereClause(
    params: ActiveRateQueryParams,
    extraConditions: string[] = []
  ): string {
    const conditions: string[] = [...extraConditions]

    if (params.province_id) {
      conditions.push(`hf_province_id = '${params.province_id}'`)
    }

    if (params.period) {
      conditions.push(`period = '${params.period}'`)
    }

    if (params.entity_tag_id) {
      conditions.push(`hf_tag_id = '${params.entity_tag_id}'`)
    }

    return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
  }

  getLatestPeriodQuery(): string {
    return `
      SELECT MAX(period) as period
      FROM ${this.tableName}
    `
  }

  getLatestWeeklyPeriodQuery(): string {
    return `
      SELECT MAX(period) as period
      FROM ${this.weeklyTableName}
    `
  }

  getLastUpdatedQuery(): string {
    return `
      SELECT formatDateTime(MAX(last_updated), '%Y-%m-%d %H:%i:%s') as last_updated
      FROM ${this.tableName}
    `
  }

  getMapDataQuery(params: ActiveRateQueryParams, latestPeriod: string): string {
    const periodCondition = params.period
      ? `period = '${params.period}'`
      : `period = '${latestPeriod}'`

    const tagCondition = params.entity_tag_id
      ? `AND hf_tag_id = '${params.entity_tag_id}'`
      : "AND hf_tag_id IN (9, 11)"

    if (params.province_id) {
      // Drill to city level
      return `
        SELECT
          hf_province_id,
          anyLast(hf_province_name) AS hf_province_name,
          hf_city_id,
          hf_city_name,
          SUM(active_entities) AS total_active,
          SUM(registerd_entities) AS total_registered
        FROM ${this.tableName}
        WHERE ${periodCondition}
          AND hf_province_id = '${params.province_id}'
          ${tagCondition}
        GROUP BY hf_province_id, hf_city_id, hf_city_name
        ORDER BY hf_city_id
      `
    }

    // National level - show by province
    return `
      SELECT
        hf_province_id,
        hf_province_name,
        SUM(active_entities) AS total_active,
        SUM(registerd_entities) AS total_registered
      FROM ${this.tableName}
      WHERE ${periodCondition}
        ${tagCondition}
      GROUP BY hf_province_id, hf_province_name
      ORDER BY hf_province_id
    `
  }

  getMapDataWeeklyQuery(
    params: ActiveRateQueryParams,
    startPeriod: string,
    endPeriod: string
  ): string {
    const periodCondition = `period BETWEEN '${startPeriod}' AND '${endPeriod}'`

    const tagCondition = params.entity_tag_id
      ? `AND hf_tag_id = '${params.entity_tag_id}'`
      : "AND hf_tag_id IN (9, 11)"

    if (params.province_id) {
      return `
        SELECT
          hf_province_id,
          anyLast(hf_province_name) AS hf_province_name,
          hf_city_id,
          hf_city_name,
          SUM(active_entities) AS total_active,
          SUM(registerd_entities) AS total_registered
        FROM ${this.weeklyTableName}
        WHERE ${periodCondition}
          AND hf_province_id = '${params.province_id}'
          ${tagCondition}
        GROUP BY hf_province_id, hf_city_id, hf_city_name
        ORDER BY hf_city_id
      `
    }

    return `
      SELECT
        hf_province_id,
        hf_province_name,
        SUM(active_entities) AS total_active,
        SUM(registerd_entities) AS total_registered
      FROM ${this.weeklyTableName}
      WHERE ${periodCondition}
        ${tagCondition}
      GROUP BY hf_province_id, hf_province_name
      ORDER BY hf_province_id
    `
  }

  getAvgQuery(params: ActiveRateQueryParams, latestPeriod: string): string {
    const periodCondition = params.period
      ? `period = '${params.period}'`
      : `period = '${latestPeriod}'`

    const provinceCondition = params.province_id
      ? `AND hf_province_id = '${params.province_id}'`
      : ""

    const tagCondition = params.entity_tag_id
      ? `AND hf_tag_id = '${params.entity_tag_id}'`
      : "AND hf_tag_id IN (9, 11)"

    return `
      SELECT
        SUM(active_entities) AS total_active,
        SUM(registerd_entities) AS total_registered
      FROM ${this.tableName}
      WHERE ${periodCondition} ${provinceCondition} ${tagCondition}
    `
  }

  getMonthlyComparisonQuery(
    params: ActiveRateQueryParams,
    periods: string[]
  ): string {
    const periodList = periods.map((p) => `'${p}'`).join(", ")
    const provinceCondition = params.province_id
      ? `AND hf_province_id = '${params.province_id}'`
      : ""

    const tagCondition = params.entity_tag_id
      ? `AND hf_tag_id = '${params.entity_tag_id}'`
      : "AND hf_tag_id IN (9, 11)"

    return `
      SELECT
        period,
        SUM(active_entities) AS total_active,
        SUM(registerd_entities) AS total_registered
      FROM ${this.tableName}
      WHERE period IN (${periodList}) ${provinceCondition} ${tagCondition}
      GROUP BY period
      HAVING total_registered > 0
        AND total_active > 0
      ORDER BY period ASC
    `
  }

  getAvailablePeriodsQuery(): string {
    return `
      SELECT DISTINCT period
      FROM ${this.tableName}
      ORDER BY period DESC
      LIMIT 12
    `
  }

  getRankingByProvinceQuery(
    params: ActiveRateQueryParams,
    latestPeriod: string
  ): string {
    const periodCondition = params.period
      ? `period = '${params.period}'`
      : `period = '${latestPeriod}'`

    const tagCondition = params.entity_tag_id
      ? `AND hf_tag_id = '${params.entity_tag_id}'`
      : "AND hf_tag_id IN (9, 11)"

    const provinceCondition = params.province_id
      ? `AND hf_province_id = '${params.province_id}'`
      : ""

    const areaSelection = params.province_id
      ? "hf_city_id AS area_id, hf_city_name AS area_name"
      : "hf_province_id AS area_id, hf_province_name AS area_name"

    const groupBy = params.province_id
      ? "hf_province_id, hf_city_id, hf_city_name"
      : "hf_province_id, hf_province_name"

    return `
      SELECT
        ${areaSelection},
        SUM(active_entities) AS total_active,
        SUM(registerd_entities) AS total_registered
      FROM ${this.tableName}
      WHERE ${periodCondition} ${tagCondition} ${provinceCondition}
      GROUP BY ${groupBy}
      HAVING total_registered > 0
      ORDER BY (total_active / total_registered) DESC
    `
  }
}
