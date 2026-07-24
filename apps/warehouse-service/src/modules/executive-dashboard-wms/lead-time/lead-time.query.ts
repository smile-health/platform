import { LeadTimeStage } from "./lead-time.schema.js"

export class LeadTimeQuery {
  private getLeadTimeColumn(stage?: LeadTimeStage): string {
    const stageColumnMap: Record<LeadTimeStage, string> = {
      avg_pickup: "sum_avg_dropped_lead_time_days",
      avg_process: "sum_avg_process_lead_time_days",
      avg_landfill: "sum_avg_landfill_lead_time_days",
      avg_recycle: "sum_avg_recycle_lead_time_days",
    }

    return stage ? stageColumnMap[stage] : "sum_avg_dropped_lead_time_days"
  }

  private getAggregatedDailyProvinceQuery(
    provinceId?: string,
    entityTagId?: string
  ): string {
    let query = `
      SELECT
        day,
        hf_province_id,
        any(hf_province_name) AS hf_province_name,
        avg(avg_dropped_lead_time_days) AS sum_avg_dropped_lead_time_days,
        avg(avg_process_lead_time_days) AS sum_avg_process_lead_time_days,
        avg(avg_landfill_lead_time_days) AS sum_avg_landfill_lead_time_days,
        avg(avg_recycle_lead_time_days) AS sum_avg_recycle_lead_time_days
      FROM dashboard_wms_lead_time
      WHERE 1=1
    `

    if (provinceId) {
      query += ` AND hf_province_id = '${provinceId}'`
    }

    if (entityTagId) {
      query += ` AND hf_tag_id = '${entityTagId}'`
    }

    query += `
      GROUP BY day, hf_province_id
    `

    return query
  }

  getMapDataQuery(
    provinceId?: string,
    stage?: LeadTimeStage,
    entityTagId?: string
  ): string {
    const isProvincialView = !!provinceId
    const leadTimeColumn = this.getLeadTimeColumn(stage)
    const aggregatedDataQuery = isProvincialView
      ? this.getAggregatedDailyCityQuery(provinceId, entityTagId)
      : this.getAggregatedDailyProvinceQuery(provinceId, entityTagId)

    const selectId = isProvincialView ? "hf_city_id" : "hf_province_id"
    const selectName = isProvincialView ? "hf_city_name" : "hf_province_name"
    const groupBy = isProvincialView ? "hf_city_id" : "hf_province_id"

    return `
      SELECT
        any(${selectId}) AS province_id,
        any(${selectName}) AS province_name,
        any(hf_province_name) AS area_name,
        avg(${leadTimeColumn}) AS avg_lead_time_days
      FROM (
        ${aggregatedDataQuery}
      ) AS daily_province
      WHERE toStartOfMonth(day) = (
        SELECT toStartOfMonth(max(day))
        FROM (
          ${aggregatedDataQuery}
        ) AS latest_daily_province
      )
      GROUP BY ${groupBy}
      ORDER BY avg_lead_time_days DESC
    `
  }

  private getAggregatedDailyCityQuery(
    provinceId?: string,
    entityTagId?: string
  ): string {
    let query = `
      SELECT
        day,
        hf_province_id,
        any(hf_province_name) AS hf_province_name,
        hf_city_id,
        any(hf_city_name) AS hf_city_name,
        avg(avg_dropped_lead_time_days) AS sum_avg_dropped_lead_time_days,
        avg(avg_process_lead_time_days) AS sum_avg_process_lead_time_days,
        avg(avg_landfill_lead_time_days) AS sum_avg_landfill_lead_time_days,
        avg(avg_recycle_lead_time_days) AS sum_avg_recycle_lead_time_days
      FROM dashboard_wms_lead_time
      WHERE 1=1
    `

    if (provinceId) {
      query += ` AND hf_province_id = '${provinceId}'`
    }

    if (entityTagId) {
      query += ` AND hf_tag_id = '${entityTagId}'`
    }

    query += `
      GROUP BY day, hf_province_id, hf_city_id
    `

    return query
  }

  private getAggregatedDailyHealthcareFacilityQuery(
    provinceId?: string,
    entityTagId?: string
  ): string {
    let query = `
      SELECT
        day,
        hf_province_id,
        any(hf_province_name) AS hf_province_name,
        hf_id,
        any(hf_name) AS hf_name,
        avg(avg_dropped_lead_time_days) AS sum_avg_dropped_lead_time_days,
        avg(avg_process_lead_time_days) AS sum_avg_process_lead_time_days,
        avg(avg_landfill_lead_time_days) AS sum_avg_landfill_lead_time_days,
        avg(avg_recycle_lead_time_days) AS sum_avg_recycle_lead_time_days
      FROM dashboard_wms_lead_time
      WHERE 1=1
    `

    if (provinceId) {
      query += ` AND hf_province_id = '${provinceId}'`
    }

    if (entityTagId) {
      query += ` AND hf_tag_id = '${entityTagId}'`
    }

    query += `
      GROUP BY day, hf_province_id, hf_id
    `

    return query
  }

  getNationalAvgQuery(
    provinceId?: string,
    stage?: LeadTimeStage,
    entityTagId?: string
  ): string {
    const leadTimeColumn = this.getLeadTimeColumn(stage)
    const aggregatedDataQuery = this.getAggregatedDailyProvinceQuery(
      provinceId,
      entityTagId
    )

    return `
      SELECT
        avg(${leadTimeColumn}) AS avg_lead_time_days
      FROM (
        ${aggregatedDataQuery}
      ) AS daily_province
    `
  }

  getMonthlyComparisonQuery(
    provinceId?: string,
    stage?: LeadTimeStage,
    entityTagId?: string
  ): string {
    const leadTimeColumn = this.getLeadTimeColumn(stage)
    const aggregatedDataQuery = this.getAggregatedDailyProvinceQuery(
      provinceId,
      entityTagId
    )

    return `
      SELECT
        formatDateTime(toStartOfMonth(day), '%Y-%m') AS month_key,
        avg(${leadTimeColumn}) AS avg_lead_time_days
      FROM (
        ${aggregatedDataQuery}
      ) AS daily_province
      WHERE day >= toStartOfMonth(now() - INTERVAL 12 MONTH)
        AND day < toStartOfMonth(now())
      GROUP BY toStartOfMonth(day)
      ORDER BY toStartOfMonth(day) ASC
    `
  }

  getTop10DeliveryQuery(
    provinceId?: string,
    stage?: LeadTimeStage,
    entityTagId?: string
  ): string {
    const isProvincialView = !!provinceId
    const leadTimeColumn = this.getLeadTimeColumn(stage)
    const aggregatedDataQuery = isProvincialView
      ? this.getAggregatedDailyHealthcareFacilityQuery(provinceId, entityTagId)
      : this.getAggregatedDailyProvinceQuery(provinceId, entityTagId)
    const nameColumn = isProvincialView ? "hf_name" : "hf_province_name"
    const groupBy = isProvincialView ? "hf_id" : "hf_province_id"

    return `
      SELECT
        any(${nameColumn}) AS location_name,
        avg(${leadTimeColumn}) AS avg_lead_time_days
      FROM (
        ${aggregatedDataQuery}
      ) AS daily_province
      WHERE toStartOfMonth(day) = toStartOfMonth(now() - INTERVAL 1 MONTH)
      GROUP BY ${groupBy}
      HAVING avg(${leadTimeColumn}) > 0
      ORDER BY avg_lead_time_days DESC
      LIMIT 10
    `
  }

  getLastUpdateQuery(): string {
    return `
      SELECT formatDateTime(max(last_updated), '%Y-%m-%d %H:%i:%S') AS last_updated
      FROM dashboard_wms_lead_time
    `
  }
}
