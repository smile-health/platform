import { HealthFacilityQueryParams } from "./health-facility.schema.js"

export class HealthFacilityQuery {
  private readonly mapsTableName = 'dashboard_wms_health_facility_implementor_numerator'
  private readonly overviewTableName = 'dashboard_wms_health_facility_implementor'

  // Query untuk mendapatkan data health facility berdasarkan filter
  getHealthFacilitiesQuery(params: HealthFacilityQueryParams): string {
    const conditions: string[] = []

    if (params.year) {
      conditions.push(`year = ${params.year}`)
    }

    if (params.province_id) {
      conditions.push(`hf_province_id = '${params.province_id}'`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    return `
      SELECT 
        year,
        hf_province_id,
        hf_province_name,
        hf_city_id,
        hf_city_name,
        hf_id,
        hf_name,
        any(hf_tag_id) as hf_tag_id,
        any(transporter_id) as transporter_id,
        any(transporter_name) as transporter_name,
        any(treatment_id) as treatment_id,
        any(treatment_name) as treatment_name,
        any(hf_latitude) as hf_latitude,
        any(hf_longitude) as hf_longitude,
        CAST(0 AS UInt64) as total_entities,
        CAST(0 AS UInt64) as total_active_entities,
        sum(waste_bag_count) as waste_bag_count,
        sum(total_waste_weight) as total_waste_weight,
        any(internal_processing_facilities_array) as internal_processing_facilities_array,
        CAST(NULL AS Nullable(Int64)) as landfill_id,
        CAST(NULL AS Nullable(String)) as landfill_name
      FROM ${this.mapsTableName}
      ${whereClause}
      GROUP BY year, hf_province_id, hf_province_name, hf_city_id, hf_city_name, hf_id, hf_name
      ORDER BY hf_province_id, hf_city_id, hf_id
    `
  }

  // Query untuk mendapatkan overview statistics
  getOverviewStatsQuery(params: HealthFacilityQueryParams): string {
    const conditions: string[] = []

    conditions.push("hf_province_id IS NOT NULL")
    conditions.push("hf_province_id != ''")
    conditions.push("hf_city_id IS NOT NULL")
    conditions.push("hf_city_id != ''")

    if (params.year) {
      conditions.push(`year = ${params.year}`)
    }

    if (params.province_id) {
      conditions.push(`hf_province_id = '${params.province_id}'`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const activeWhereConditions = [...conditions, 'active_entities > 0']
    const activeWhereClause = `WHERE ${activeWhereConditions.join(' AND ')}`

    return `
      SELECT 
        (
          SELECT COUNT()
          FROM (
            SELECT DISTINCT hf_province_id
            FROM ${this.overviewTableName}
            ${whereClause}
          )
        ) as total_provinces,
        (
          SELECT COUNT()
          FROM (
            SELECT DISTINCT hf_province_id
            FROM ${this.overviewTableName}
            ${activeWhereClause}
          )
        ) as active_provinces,
        (
          SELECT COUNT()
          FROM (
            SELECT DISTINCT hf_city_id
            FROM ${this.overviewTableName}
            ${whereClause}
          )
        ) as total_cities,
        (
          SELECT COUNT()
          FROM (
            SELECT DISTINCT hf_city_id
            FROM ${this.overviewTableName}
            ${activeWhereClause}
          )
        ) as active_cities,
        COUNT(DISTINCT hf_id) as total_health_facilities,
        SUM(active_entities) as active_health_facilities
      FROM ${this.overviewTableName}
      ${whereClause}
    `
  }

  // Query untuk mendapatkan last update timestamp
  getLastUpdateQuery(): string {
    return `
      SELECT 
        formatDateTime(MAX(last_updated), '%Y-%m-%d %H:%i:%s') as last_updated
      FROM ${this.overviewTableName}
    `
  }

  // Query untuk mendapatkan yearly comparison data (last 5 years)
  getYearlyComparisonQuery(params: HealthFacilityQueryParams): string {
    const currentYear = new Date().getFullYear()
    const startYear = currentYear - 4 // Last 5 years including current
    
    const conditions: string[] = [
      `year >= ${startYear}`,
      `year <= ${currentYear}`
    ]

    if (params.province_id) {
      conditions.push(`hf_province_id = '${params.province_id}'`)
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`

    return `
      SELECT 
        year,
        SUM(active_entities) as total_health_facilities
      FROM ${this.overviewTableName}
      ${whereClause}
      GROUP BY year
      ORDER BY year
    `
  }
}
