import { Context } from "hono"
import {
  HealthFacilityImplementorQueryParams,
  ActiveRateQueryParams,
  LeadTimeQueryParams,
  LastMileQueryParams,
  LastMileMaterialQueryParams,
} from "./distribution.schema.js"

export class ExecutiveDashboardDistributionQuery {
  getHealthFacilityImplementorQuery(
    c: Context,
    queryParam: HealthFacilityImplementorQueryParams
  ): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = []

    if (program_id) {
      filters.push("program_id = {program_id:Int64}")
    }

    const filterClause =
      filters.length > 0 ? `AND ${filters.join(" AND ")}` : ""

    if (program_id) {
      if (province_id) {
        // When province_id is provided, group by regency
        return `
        SELECT 
          entity_regency_id as id,
          entity_regency_name as name,
          SUM(total_active_entities) as value,
          SUM(total_entities) as total
        FROM dashboard_facility_distribution
        WHERE 
          year = {year:Int64}
          AND entity_province_id = {province_id:Int64}
          AND entity_regency_id IS NOT NULL
          ${filterClause}
        GROUP BY entity_regency_id, entity_regency_name
        ORDER BY entity_regency_name
      `
      }

      // National view - group by province
      return `
        SELECT 
          entity_province_id as id,
          entity_province_name as name,
          SUM(total_active_entities) as value,
          SUM(total_entities) as total
        FROM dashboard_facility_distribution
        WHERE 
          year = {year:Int64}
          AND entity_province_id IS NOT NULL
          ${filterClause}
        GROUP BY entity_province_id, entity_province_name
        ORDER BY entity_province_name
    `
    } else {
      // All Program
      const cte = `
        WITH source_all_program AS (
          SELECT
            DISTINCT
            year,
            entity_province_id ,
            entity_province_name ,
            entity_regency_id,
            entity_regency_name ,
            total_active_entities_global,
            total_entities_global
          FROM
            dashboard_facility_distribution
          WHERE
            year = {year:Int64}
            AND total_active_entities_global > 0
        )
    `

      if (province_id) {
        // When province_id is provided, group by regency
        return `
          ${cte}
          SELECT 
            entity_regency_id as id,
            entity_regency_name as name,
            SUM(total_active_entities_global) as value,
            SUM(total_entities_global) as total
          FROM source_all_program
          WHERE
            entity_province_id = {province_id:Int64}
          GROUP BY entity_regency_id, entity_regency_name
          ORDER BY entity_regency_name
      `
      }

      // National view - group by province
      return `
        ${cte}
        SELECT 
          entity_province_id as id,
          entity_province_name as name,
          SUM(total_active_entities_global) as value,
          SUM(total_entities_global) as total
        FROM source_all_program
        GROUP BY entity_province_id, entity_province_name
        ORDER BY entity_province_name
    `
    }
  }

  getOverviewQuery(
    c: Context,
    queryParam: HealthFacilityImplementorQueryParams
  ): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = []

    if (province_id) {
      filters.push("entity_province_id = {province_id:Int64}")
    }

    const filterClause =
      filters.length > 0 ? `AND ${filters.join(" AND ")}` : ""

    if (program_id) {
      return `
        SELECT 
          COUNT(DISTINCT CASE WHEN total_active_entities > 0 AND entity_province_id IS NOT NULL THEN entity_province_id END) AS total_province_implementor,
          COUNT(DISTINCT entity_province_id) AS total_province,
          COUNT(DISTINCT CASE WHEN total_active_entities > 0 AND entity_regency_id IS NOT NULL THEN entity_regency_id END) AS total_regency_implementor,
          COUNT(DISTINCT entity_regency_id) AS total_regency,
          SUM(total_active_entities) AS total_facility_implementor,
          SUM(total_entities) AS total_facility
        FROM dashboard_facility_distribution
        WHERE 
          year = {year:Int64}
          AND program_id = {program_id:Int64}
          ${filterClause}
      `
    } else {
      // All Program
      return `
        WITH source_all_program AS (
        SELECT
          DISTINCT
          year,
          entity_province_id ,
          entity_province_name ,
          entity_regency_id,
          entity_regency_name ,
          total_active_entities_global,
          total_entities_global
        FROM
          dashboard_facility_distribution
        WHERE
          year = {year:Int64}
          AND total_active_entities_global > 0
        )
        SELECT 
          COUNT(DISTINCT CASE WHEN total_active_entities_global > 0 AND entity_province_id IS NOT NULL THEN entity_province_id END) AS total_province_implementor,
          COUNT(DISTINCT entity_province_id) AS total_province,
          COUNT(DISTINCT CASE WHEN total_active_entities_global > 0 AND entity_regency_id IS NOT NULL THEN entity_regency_id END) AS total_regency_implementor,
          COUNT(DISTINCT entity_regency_id) AS total_regency,
          SUM(total_active_entities_global) AS total_facility_implementor,
          SUM(total_entities_global) AS total_facility
        FROM source_all_program
        WHERE 
          1 = 1
          ${filterClause}
      `
    }
  }

  getYearlyComparisonQuery(
    c: Context,
    queryParam: HealthFacilityImplementorQueryParams
  ): string {
    const { province_id, program_id } = queryParam

    // Calculate 5 years range from current year
    const currentYear = new Date().getFullYear()
    const startYear = currentYear - 4

    const filters: string[] = [`year >= ${startYear}`, `year <= ${currentYear}`]

    if (province_id) {
      filters.push("entity_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int64}")
    }

    const filterClause = filters.join(" AND ")

    if (program_id) {
      return `
        SELECT 
          year as id,
          year as label,
          SUM(total_active_entities) as value
        FROM dashboard_facility_distribution
        WHERE 
          ${filterClause}
        GROUP BY year
        ORDER BY year ASC
      `
    } else {
      // All Program
      return `
        WITH source_all_program AS (
          SELECT
            DISTINCT
            year,
            entity_province_id ,
            entity_province_name ,
            entity_regency_id,
            entity_regency_name ,
            total_active_entities_global,
            total_entities_global
          FROM
            dashboard_facility_distribution
          WHERE
            ${filterClause}
        )
        SELECT 
          year as id,
          year as label,
          SUM(total_active_entities_global) as value
        FROM source_all_program
        GROUP BY year
        ORDER BY year ASC
      `
    }
  }

  getLastUpdateQuery(tableName: string): string {
    return `
      SELECT MAX(last_updated) as last_update
      FROM ${tableName}
    `
  }

  // Active Rate Queries
  getActiveRateMapsQuery(
    c: Context,
    queryParam: ActiveRateQueryParams
  ): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = ["period = {period:String}"]

    if (province_id) {
      filters.push("entity_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    const activeRatePercentage = program_id
      ? "(value / total) * 100"
      : "AVG(active_rate)"

    if (province_id) {
      // When province_id is provided, group by regency
      return `
        SELECT 
          entity_regency_id as id,
          regency as name,
          SUM(active_entities) as value,
          SUM(total_entities) as total,
          (value / total) * 100 as percent
        FROM dashboard_active_rate
        WHERE 
          ${filterClause}
          AND entity_regency_id IS NOT NULL
        GROUP BY entity_regency_id, regency
        ORDER BY regency
      `
    }

    // National view - group by province
    return `
      SELECT 
        entity_province_id as id,
        province as name,
        SUM(active_entities) as value,
        SUM(total_entities) as total,
        (value / total) * 100 as percent
      FROM dashboard_active_rate
      WHERE 
        ${filterClause}
        AND entity_province_id IS NOT NULL
      GROUP BY entity_province_id, province
      ORDER BY province
    `
  }

  getActiveRateAvgQuery(c: Context, queryParam: ActiveRateQueryParams): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = ["period = {period:String}"]

    if (province_id) {
      filters.push("entity_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    const activeRatePercentage = program_id
      ? "(value / total) * 100"
      : "AVG(active_rate)"

    return `
      SELECT 
        SUM(active_entities) as value,
        SUM(total_entities) as total,
        (value / total) * 100 as avg_active_rate
      FROM dashboard_active_rate
      WHERE ${filterClause}
    `
  }

  getActiveRateMonthlyComparisonQuery(
    c: Context,
    queryParam: ActiveRateQueryParams
  ): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = [
      "period >= {start_period:String}",
      "period <= {end_period:String}",
    ]

    if (province_id) {
      filters.push("entity_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    const activeRatePercentage = program_id
      ? "(value / total) * 100"
      : "AVG(active_rate)"

    return `
      SELECT 
        period,
        SUM(active_entities) as value,
        SUM(total_entities) as total,
        (value / total) * 100 as active_rate
      FROM dashboard_active_rate
      WHERE ${filterClause}
      GROUP BY period
      ORDER BY period ASC
    `
  }

  getActiveRateHighestQuery(
    c: Context,
    queryParam: ActiveRateQueryParams
  ): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = ["period = {period:String}"]

    if (province_id) {
      filters.push("entity_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    const activeRatePercentage = program_id
      ? "(value / total) * 100"
      : "AVG(active_rate)"

    if (province_id) {
      return `
        SELECT 
          entity_regency_id as id,
          regency as name,
          SUM(active_entities) as value,
          SUM(total_entities) as total,
          (value / total) * 100 as active_rate
        FROM dashboard_active_rate
        WHERE 
          ${filterClause}
          AND entity_regency_id IS NOT NULL
        GROUP BY entity_regency_id, regency
        ORDER BY active_rate DESC
        LIMIT 10
      `
    }

    return `
      SELECT 
        entity_province_id as id,
        province as name,
        SUM(active_entities) as value,
        SUM(total_entities) as total,
        (value / total) * 100 as active_rate
      FROM dashboard_active_rate
      WHERE 
        ${filterClause}
        AND entity_province_id IS NOT NULL
      GROUP BY entity_province_id, province
      ORDER BY active_rate DESC
      LIMIT 10
    `
  }

  getActiveRateLowestQuery(
    c: Context,
    queryParam: ActiveRateQueryParams
  ): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = ["period = {period:String}"]

    if (province_id) {
      filters.push("entity_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    const activeRatePercentage = program_id
      ? "(value / total) * 100"
      : "AVG(active_rate)"

    if (province_id) {
      return `
        SELECT 
          entity_regency_id as id,
          regency as name,
          SUM(active_entities) as value,
          SUM(total_entities) as total,
          (value / total) * 100 as active_rate
        FROM dashboard_active_rate
        WHERE 
          ${filterClause}
          AND entity_regency_id IS NOT NULL
        GROUP BY entity_regency_id, regency
        ORDER BY active_rate ASC
        LIMIT 10
      `
    }

    return `
      SELECT 
        entity_province_id as id,
        province as name,
        SUM(active_entities) as value,
        SUM(total_entities) as total,
        (value / total) * 100 as active_rate
      FROM dashboard_active_rate
      WHERE 
        ${filterClause}
        AND entity_province_id IS NOT NULL
      GROUP BY entity_province_id, province
      ORDER BY active_rate ASC
      LIMIT 10
    `
  }

  // Lead Time Queries
  getLeadTimeMapsQuery(c: Context, queryParam: LeadTimeQueryParams): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = ["period = {period:String}"]

    if (province_id) {
      filters.push("customer_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    if (province_id) {
      // When province_id is provided, group by regency
      return `
        SELECT 
          customer_regency_id as id,
          customer_regency_name as name,
          AVG(avg_entity_duration) as avg_duration
        FROM dashboard_delivery_time
        WHERE 
          ${filterClause}
          AND customer_regency_id IS NOT NULL
        GROUP BY customer_regency_id, customer_regency_name
        ORDER BY customer_regency_name
      `
    }

    // National view - group by province
    return `
      SELECT 
        customer_province_id as id,
        customer_province_name as name,
        AVG(avg_entity_duration) as avg_duration
      FROM dashboard_delivery_time
      WHERE 
        ${filterClause}
        AND customer_province_id IS NOT NULL
      GROUP BY customer_province_id, customer_province_name
      ORDER BY customer_province_name
    `
  }

  getLeadTimeAvgQuery(c: Context, queryParam: LeadTimeQueryParams): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = ["period = {period:String}"]

    if (province_id) {
      filters.push("customer_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    return `
      SELECT AVG(avg_entity_duration) as avg_duration
      FROM dashboard_delivery_time
      WHERE ${filterClause}
    `
  }

  getLeadTimeMonthlyComparisonQuery(
    c: Context,
    queryParam: LeadTimeQueryParams
  ): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = [
      "period >= {start_period:String}",
      "period <= {end_period:String}",
    ]

    if (province_id) {
      filters.push("customer_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    return `
      SELECT 
        period,
        AVG(avg_entity_duration) as avg_duration
      FROM dashboard_delivery_time
      WHERE ${filterClause}
      GROUP BY period
      ORDER BY period ASC
    `
  }

  getLeadTimeMostDeliveryQuery(
    c: Context,
    queryParam: LeadTimeQueryParams
  ): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = [
      "period = {period:String}",
      "status = 'abnormal'",
    ]

    if (province_id) {
      filters.push("customer_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    if (province_id) {
      const groupByCustomerId = c.var.programId
        ? "customer_id"
        : "global_customer_id"

      return `
        SELECT 
          customer_name as name,
          customer_regency_name as customer_regency_name,
          AVG(avg_entity_duration) as avg_duration,
          COUNT(*) as count
        FROM dashboard_delivery_time
        WHERE ${filterClause}
        GROUP BY ${groupByCustomerId}, customer_name, customer_regency_name
        ORDER BY avg_duration DESC
        LIMIT 10
      `
    }

    return `
      SELECT 
        customer_province_name as name,
        AVG(avg_entity_duration) as avg_duration,
        COUNT(*) as count
      FROM dashboard_delivery_time
      WHERE ${filterClause}
      GROUP BY customer_province_id, customer_province_name
      ORDER BY count DESC
      LIMIT 10
    `
  }

  // Last Mile Queries
  getLastMileMapsQuery(c: Context, queryParam: LastMileQueryParams): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = ["period = {period:String}"]

    if (province_id) {
      filters.push("entities_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    if (province_id) {
      // When province_id is provided, group by regency
      return `
        SELECT 
          entities_regency_id as id,
          entities_regency_name as name,
          SUM(distribution_last_mile) as distribution,
          SUM(received) as receive
        FROM dashboard_last_distribution
        WHERE 
          ${filterClause}
          AND entities_regency_id IS NOT NULL
        GROUP BY entities_regency_id, entities_regency_name
        ORDER BY entities_regency_name
      `
    }

    // National view - group by province
    return `
      SELECT 
        entities_province_id as id,
        entities_province_name as name,
        SUM(distribution_last_mile) as distribution,
        SUM(received) as receive
      FROM dashboard_last_distribution
      WHERE 
        ${filterClause}
        AND entities_province_id IS NOT NULL
      GROUP BY entities_province_id, entities_province_name
      ORDER BY entities_province_name
    `
  }

  getLastMileTotalQuery(c: Context, queryParam: LastMileQueryParams): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = ["period = {period:String}"]

    if (province_id) {
      filters.push("entities_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    return `
      SELECT 
        SUM(distribution_last_mile) as distribution,
        SUM(received) as received
      FROM dashboard_last_distribution
      WHERE ${filterClause}
    `
  }

  getLastMileMonthlyComparisonQuery(
    c: Context,
    queryParam: LastMileQueryParams
  ): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = [
      "period >= {start_period:String}",
      "period <= {end_period:String}",
    ]

    if (province_id) {
      filters.push("entities_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    return `
      SELECT 
        period,
        SUM(distribution_last_mile) as distribution,
        SUM(received) as receive
      FROM dashboard_last_distribution
      WHERE ${filterClause}
      GROUP BY period
      ORDER BY period ASC
    `
  }

  getLastMileDistributionQuery(
    c: Context,
    queryParam: LastMileQueryParams
  ): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = ["period = {period:String}"]

    if (province_id) {
      filters.push("entities_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    return `
      SELECT 
        material_type_name,
        SUM(distribution_last_mile) as distribution
      FROM dashboard_last_distribution
      WHERE ${filterClause}
      GROUP BY material_type_name
      ORDER BY material_type_name
    `
  }

  getLastMileMonthlyLastMileQuery(
    c: Context,
    queryParam: LastMileQueryParams
  ): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = [
      "period >= {start_period:String}",
      "period <= {end_period:String}",
    ]

    if (province_id) {
      filters.push("entities_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    return `
      SELECT 
        period,
        SUM(CASE WHEN material_type_name = 'vaccine' THEN distribution_last_mile ELSE 0 END) as vaccine,
        SUM(CASE WHEN material_type_name = 'medicine' THEN distribution_last_mile ELSE 0 END) as medicine,
        SUM(CASE WHEN material_type_name = 'non_medical_devices' THEN distribution_last_mile ELSE 0 END) as consumable,
        SUM(CASE WHEN material_type_name = 'medical_devices' THEN distribution_last_mile ELSE 0 END) as medical_consumable
      FROM dashboard_last_distribution
      WHERE ${filterClause}
      GROUP BY period
      ORDER BY period ASC
    `
  }

  getLastMileMaterialQuery(
    c: Context,
    queryParam: LastMileMaterialQueryParams
  ): string {
    const { province_id, program_id } = queryParam

    const filters: string[] = [
      "period = {period:String}",
      "material_type_name = {material_type:String}",
    ]

    if (province_id) {
      filters.push("entities_province_id = {province_id:Int64}")
    }

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    const filterClause = filters.join(" AND ")

    return `
      SELECT 
        parent_material_id as id,
        COALESCE(parent_material_name, 'Unknown') as name,
        SUM(distribution_last_mile) as value
      FROM dashboard_last_distribution
      WHERE ${filterClause}
      GROUP BY parent_material_id, parent_material_name
      ORDER BY value DESC, parent_material_name ASC
      LIMIT 10
    `
  }
}
