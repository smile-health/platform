import { Context } from "hono"
import { SufficiencyQueryParams } from "./sufficiency.schema.js"

export class ExecutiveDashboardSufficiencyQuery {
  private buildFilters(
    queryParam: SufficiencyQueryParams,
    includePeriodRange: boolean = false
  ): string[] {
    const filters: string[] = ["1 = 1"]

    if (includePeriodRange) {
      filters.push("period >= {start_period:String}")
      filters.push("period <= {end_period:String}")
    }

    if (queryParam.province_id) {
      filters.push(
        "entities_province_id = {province_id:Int64} AND entities_regency_id IS NOT NULL"
      )
    }

    if (queryParam.program_id) {
      filters.push("program_id = {program_id:Int64}")
    }

    if (
      queryParam.material_type_ids &&
      queryParam.material_type_ids.length > 0
    ) {
      filters.push("material_type_id IN {material_type_ids:Array(Int64)}")
    }

    return filters
  }

  getStockSufficiencyMapsQuery(
    c: Context,
    queryParam: SufficiencyQueryParams
  ): string {
    const { program_id } = queryParam

    const entityIdField = program_id ? "entities_id" : "global_entities_id"

    const filters = this.buildFilters(queryParam)
    const filterClause = filters.join(" AND ")

    if (queryParam.province_id) {
      // When province_id is provided, group by regency
      return `
        WITH 
          entity_agg AS (
            SELECT
              entities_regency_id,
              ${entityIdField} as entities_id,
              SUM(balance_per_entity_parent_materials) as sum_balance_entity,
              SUM(avg_12_month) as sum_avg_entity,
              if(sum_avg_entity != 0, sum_balance_entity / sum_avg_entity, 0) as consumption_value_entity,
              (CASE
                WHEN sum_balance_entity != 0 AND sum_avg_entity = 0 THEN 'sufficient'
                WHEN consumption_value_entity = 0 THEN 'insufficient'
                WHEN consumption_value_entity < 0.25 THEN 'at_risk'
                ELSE 'sufficient'
              END) as region_status_entity
            FROM
              platinum_stock_sufficiency
            WHERE
              ${filterClause}
            GROUP BY
              entities_regency_id,
              entities_id
          )
        SELECT
          dss.entities_regency_id as id,
          dss.entities_regency_name as name,
          dss.region_status_regency as status,
          count(ea.entities_id) as total,
          countIf(ea.entities_id, ea.region_status_entity = 'sufficient') as sufficient,
          countIf(ea.entities_id, ea.region_status_entity = 'at_risk') as at_risk,
          countIf(ea.entities_id, ea.region_status_entity = 'insufficient') as insufficient
        FROM (
          SELECT
            entities_regency_id,
            entities_regency_name,
            SUM(balance_per_entity_parent_materials) as sum_balance_regency,
            SUM(avg_12_month) as sum_avg_regency,
            if(sum_avg_regency != 0, sum_balance_regency / sum_avg_regency, 0) as consumption_value_regency,
            (CASE
              WHEN sum_balance_regency != 0 AND sum_avg_regency = 0 THEN 'sufficient'
              WHEN consumption_value_regency = 0 THEN 'insufficient'
              WHEN consumption_value_regency < 3 THEN 'at_risk'
              ELSE 'sufficient'
            END) as region_status_regency
          FROM platinum_stock_sufficiency
          WHERE
            ${filterClause}
          GROUP BY
            entities_regency_id,
            entities_regency_name
        ) dss
        JOIN entity_agg ea ON ea.entities_regency_id = dss.entities_regency_id
        GROUP BY
          dss.entities_regency_id,
          dss.entities_regency_name,
          dss.region_status_regency
        ORDER BY
          dss.entities_regency_id
      `
    }

    // National view - group by province
    return `
      WITH 
        regency_agg AS (
          SELECT
            entities_province_id,
            entities_regency_id,
            SUM(balance_per_entity_parent_materials) as sum_balance_regency,
            SUM(avg_12_month) as sum_avg_regency,
            if(sum_avg_regency != 0, sum_balance_regency / sum_avg_regency, 0) as consumption_value_regency,
            (CASE
              WHEN sum_balance_regency != 0 AND sum_avg_regency = 0 THEN 'sufficient'
              WHEN consumption_value_regency = 0 THEN 'insufficient'
              WHEN consumption_value_regency < 3 THEN 'at_risk'
              ELSE 'sufficient'
            END) as region_status_regency
          FROM
            platinum_stock_sufficiency
          WHERE
            ${filterClause}
          GROUP BY
            entities_province_id,
            entities_regency_id
        )
      SELECT
        dss.entities_province_id as id,
        dss.entities_province_name as name,
        dss.region_status_province as status,
        count(ra.entities_regency_id) as total,
        countIf(ra.entities_regency_id, ra.region_status_regency = 'sufficient') as sufficient,
        countIf(ra.entities_regency_id, ra.region_status_regency = 'at_risk') as at_risk,
        countIf(ra.entities_regency_id, ra.region_status_regency = 'insufficient') as insufficient
      FROM (
        SELECT
          entities_province_id,
          entities_province_name,
          SUM(balance_per_entity_parent_materials) as sum_balance_province,
          SUM(avg_12_month) as sum_avg_province,
          if(sum_avg_province != 0, sum_balance_province / sum_avg_province, 0) as consumption_value_province,
          (CASE
            WHEN sum_balance_province != 0 AND sum_avg_province = 0 THEN 'sufficient'
            WHEN consumption_value_province = 0 THEN 'insufficient'
            WHEN consumption_value_province < 6 THEN 'at_risk'
            ELSE 'sufficient'
          END) as region_status_province
        FROM platinum_stock_sufficiency
        WHERE
          ${filterClause}
        GROUP BY
          entities_province_id,
          entities_province_name
      ) dss
      JOIN regency_agg ra ON ra.entities_province_id = dss.entities_province_id
      GROUP BY
        dss.entities_province_id,
        dss.entities_province_name,
        dss.region_status_province
      ORDER BY
        dss.entities_province_id
    `
  }

  getStockSufficiencyOverviewQuery(
    c: Context,
    queryParam: SufficiencyQueryParams
  ): string {
    const { program_id } = queryParam

    const materialIdField = program_id
      ? "parent_material_id"
      : "global_parent_material_id"

    const filters = this.buildFilters(queryParam)
    const filterClause = filters.join(" AND ")

    const ratio = program_id ? "3" : "6"

    return `
      WITH material_agg AS (
        SELECT
          ${materialIdField} as material_id,
          material_type_name as material_type_name,
          SUM(balance_per_entity_parent_materials) as sum_balance,
          SUM(avg_12_month) AS sum_avg,
          if(sum_avg != 0, sum_balance / sum_avg, 0) as consumption_value_agg,
          (CASE
            WHEN sum_balance != 0 AND sum_avg = 0 THEN 'sufficient'
            WHEN consumption_value_agg = 0 THEN 'insufficient'
            WHEN consumption_value_agg < ${ratio} THEN 'at_risk'
            ELSE 'sufficient'
          END) as status
        FROM
          platinum_stock_sufficiency
        WHERE
          ${filterClause}
        GROUP BY
          material_id,
          material_type_name
      )
      SELECT 
        COUNT(DISTINCT CASE WHEN material_type_name = 'medicine' AND status = 'sufficient' THEN material_id END) as medicine_sufficient,
        COUNT(DISTINCT CASE WHEN material_type_name = 'medicine' THEN material_id END) as medicine_total,
        COUNT(DISTINCT CASE WHEN material_type_name = 'vaccine' AND status = 'sufficient' THEN material_id END) as vaccine_sufficient,
        COUNT(DISTINCT CASE WHEN material_type_name = 'vaccine' THEN material_id END) as vaccine_total,
        COUNT(DISTINCT CASE WHEN material_type_name = 'non_medical_devices' AND status = 'sufficient' THEN material_id END) as consumable_sufficient,
        COUNT(DISTINCT CASE WHEN material_type_name = 'non_medical_devices' THEN material_id END) as consumable_total,
        COUNT(DISTINCT CASE WHEN material_type_name = 'medical_devices' AND status = 'sufficient' THEN material_id END) as medical_consumable_sufficient,
        COUNT(DISTINCT CASE WHEN material_type_name = 'medical_devices' THEN material_id END) as medical_consumable_total
      FROM material_agg
    `
  }

  getStockSufficiencyCriticalOverviewQuery(
    c: Context,
    queryParam: SufficiencyQueryParams
  ): string {
    const { program_id, province_id } = queryParam

    const materialIdField = program_id
      ? "parent_material_id"
      : "global_parent_material_id"

    const filters = this.buildFilters(queryParam)
    const filterClause = filters.join(" AND ")

    const ratio = province_id ? 3 : 6

    return `
      WITH material_agg AS (
        SELECT
            ${materialIdField} as material_id,
            SUM(balance_per_entity_parent_materials) as sum_balance,
            SUM(avg_12_month) as sum_avg,
            if(sum_avg != 0, sum_balance/sum_avg, 0) as consumption_value_agg
          FROM platinum_stock_sufficiency
          WHERE 
            ${filterClause}
          GROUP BY material_id
      )
      SELECT
        countIf(material_id, consumption_value_agg < ${ratio}) as stock_critical_materials
      FROM material_agg
    `
  }

  getStockSufficiencyMonthlyComparisonQuery(
    c: Context,
    queryParam: SufficiencyQueryParams
  ): string {
    const { program_id, province_id } = queryParam

    const materialIdField = program_id
      ? "parent_material_id"
      : "global_parent_material_id"

    const filters = this.buildFilters(queryParam, true)
    const filterClause = filters.join(" AND ")

    const ratio = province_id ? 3 : 6

    return `
      WITH material_agg AS (
        SELECT
            period,
            ${materialIdField} as material_id,
            SUM(balance_per_entity_parent_materials) as sum_balance,
            SUM(avg_12_month) as sum_avg,
            if(sum_avg != 0, sum_balance/sum_avg, 0) as consumption_value_agg,
            (CASE
              WHEN sum_balance != 0 AND sum_avg = 0 THEN 'sufficient'
              WHEN consumption_value_agg = 0 THEN 'insufficient'
              WHEN consumption_value_agg < ${ratio} THEN 'at_risk'
              ELSE 'sufficient'
            END) as status
          FROM dashboard_stock_sufficiency_monthly
          WHERE 
            ${filterClause}
          GROUP BY 
            period,
            material_id
      )
      SELECT 
        period,
        COUNT(DISTINCT CASE WHEN status = 'sufficient' THEN material_id END) * 100.0 / COUNT(DISTINCT material_id) as value
      FROM material_agg
      GROUP BY period
      ORDER BY period ASC
    `
  }

  getStockSufficiencyTop10MaterialsQuery(
    c: Context,
    queryParam: SufficiencyQueryParams
  ): string {
    const { program_id, province_id } = queryParam

    const materialIdField = program_id
      ? "parent_material_id"
      : "global_parent_material_id"

    const filters = this.buildFilters(queryParam)
    const filterClause = filters.join(" AND ")

    const ratio = province_id ? 3 : 6

    return `
      SELECT 
        ${materialIdField} as id,
        parent_material_name as name,
        SUM(balance_per_entity_parent_materials) as sum_balance,
        SUM(avg_12_month) AS sum_avg,
        if(sum_avg != 0, sum_balance / sum_avg, 0) as consumption_value_agg,
        (CASE
            WHEN sum_balance != 0 AND sum_avg = 0 THEN 'sufficient'
            WHEN consumption_value_agg = 0 THEN 'insufficient'
            WHEN consumption_value_agg < ${ratio} THEN 'at_risk'
            ELSE 'sufficient'
        END) as status
      FROM platinum_stock_sufficiency
      WHERE ${filterClause}
      GROUP BY id, name
    `
  }

  buildStockRateFilters(queryParam: SufficiencyQueryParams) {
    const filters: string[] = ["period = {period:String}"]

    if (queryParam.province_id) {
      filters.push("province_id = {province_id:Int64}")
    }

    if (queryParam.program_id) {
      filters.push("program_id = {program_id:Int64}")
    }

    if (
      queryParam.material_type_ids &&
      queryParam.material_type_ids.length > 0
    ) {
      filters.push("material_type_id IN {material_type_ids:Array(Int64)}")
    }

    return filters
  }

  getStockOutRateQuery(c: Context, queryParam: SufficiencyQueryParams): string {
    const { program_id } = queryParam

    const materialIdField = program_id
      ? "parent_material_id"
      : "global_parent_material_id"

    const filters = this.buildStockRateFilters(queryParam)
    const filterClause = filters.join(" AND ")

    return `
      SELECT 
        ${materialIdField} as id,
        parent_material_name as name,
        SUM(jumlah_frekuensi) as value
      FROM dashboard_stockout_rate
      WHERE ${filterClause}
      GROUP BY id, name
      ORDER BY value DESC
      LIMIT 10
    `
  }

  getStockMaxRateQuery(c: Context, queryParam: SufficiencyQueryParams): string {
    const { program_id } = queryParam

    const materialIdField = program_id
      ? "parent_material_id"
      : "global_parent_material_id"

    const filters = this.buildStockRateFilters(queryParam)
    const filterClause = filters.join(" AND ")

    return `
      SELECT 
        ${materialIdField} as id,
        parent_material_name as name,
        SUM(jumlah_frekuensi) as value
      FROM dashboard_stockmax_rate
      WHERE ${filterClause}
      GROUP BY id, name
      ORDER BY value DESC
      LIMIT 10
    `
  }

  getStockSufficiencyExportQuery(
    c: Context,
    queryParam: SufficiencyQueryParams
  ): string {
    const filters = this.buildFilters(queryParam)
    const filterClause = filters.join(" AND ")

    return `
      SELECT 
        entities_province_name,
        entities_regency_name,
        entities_id,
        entities_name,
        parent_material_name,
        material_type_name,
        balance_per_entity_parent_materials,
        kebutuhan_1_tahun,
        nilai_minimum,
        avg_12_month,
        sum_12_month,
        consumption_value,
        if(status = 'at risk', 'at_risk', status) as status
      FROM platinum_stock_sufficiency
      WHERE ${filterClause}
      ORDER BY entities_province_name, entities_regency_name, entities_name, parent_material_name
    `
  }

  getLastUpdateQuery(tableName: string): string {
    return `
      SELECT MAX(last_updated) as last_update
      FROM ${tableName}
    `
  }
}
