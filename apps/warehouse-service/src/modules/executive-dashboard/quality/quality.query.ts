import { Context } from "hono"
import { QualityQueryParams } from "./quality.schema.js"

export class ExecutiveDashboardQualityQuery {
  // Stock Taking Queries
  getStockTakingMapsQuery(c: Context, queryParam: QualityQueryParams): string {
    const { program_id, province_id } = queryParam

    if (province_id) {
      // When province_id is provided, group by regency
      return `
        SELECT 
          regency_id as id,
          regency_name as name,
          SUM(real_stock) as sum_real_stock,
          SUM(stock) as sum_stock,
          ABS(sum_stock - sum_real_stock) as sum_difference,
          (CASE
            WHEN sum_real_stock = 0 AND sum_stock = 0 THEN 100
            WHEN sum_real_stock = 0 AND sum_stock != 0 THEN 0
            ELSE (1-(sum_difference / sum_stock)) * 100
          END) as avg_accuracy_percentage
        FROM dashboard_stock_taking
        WHERE 
          stock_opname_period_id IN (
            SELECT MAX(stock_opname_period_id) 
            FROM dashboard_stock_taking 
            GROUP BY stock_opname_program_id
            ${program_id ? "HAVING stock_opname_program_id = {program_id:Int64}" : ""}
          )
          AND province_id = {province_id:Int64}
          AND regency_id IS NOT NULL
        GROUP BY regency_id, regency_name
        ORDER BY avg_accuracy_percentage DESC
      `
    }

    // National view - group by province
    return `
      SELECT 
        province_id as id,
        province_name as name,
        SUM(real_stock) as sum_real_stock,
        SUM(stock) as sum_stock,
        ABS(sum_stock - sum_real_stock) as sum_difference,
        (CASE
          WHEN sum_real_stock = 0 AND sum_stock = 0 THEN 100
          WHEN sum_real_stock = 0 AND sum_stock != 0 THEN 0
          ELSE (1-(sum_difference / sum_stock)) * 100
        END) as avg_accuracy_percentage
      FROM dashboard_stock_taking
      WHERE 
        stock_opname_period_id IN (
          SELECT MAX(stock_opname_period_id) 
          FROM dashboard_stock_taking 
          GROUP BY stock_opname_program_id
          ${program_id ? "HAVING stock_opname_program_id = {program_id:Int64}" : ""}
        )
        AND province_id IS NOT NULL
      GROUP BY province_id, province_name
      ORDER BY avg_accuracy_percentage DESC
    `
  }

  getStockTakingOverviewQuery(
    c: Context,
    queryParam: QualityQueryParams
  ): string {
    const { program_id, province_id } = queryParam

    const filters: string[] = []

    if (province_id) {
      filters.push("province_id = {province_id:Int64}")
    }

    const filterClause =
      filters.length > 0 ? `AND ${filters.join(" AND ")}` : ""

    return `
      SELECT 
        SUM(real_stock) as sum_real_stock,
        SUM(stock) as sum_stock,
        ABS(sum_stock - sum_real_stock) as sum_difference,
        CASE
          WHEN sum_real_stock = 0 AND sum_stock = 0 THEN 100
          WHEN sum_real_stock = 0 AND sum_stock != 0 THEN 0
          ELSE (1-(sum_difference / sum_stock)) * 100
        END as avg_accuracy_percentage,
        ABS(sum_stock - sum_real_stock) as total_difference
      FROM dashboard_stock_taking
      WHERE 
        stock_opname_period_id IN (
          SELECT MAX(stock_opname_period_id) 
          FROM dashboard_stock_taking 
          GROUP BY stock_opname_program_id
          ${program_id ? "HAVING stock_opname_program_id = {program_id:Int64}" : ""}
        )
        ${filterClause}
    `
  }

  getStockTakingMonthlyComparisonQuery(
    c: Context,
    queryParam: QualityQueryParams
  ): string {
    const { program_id, province_id } = queryParam

    const filters: string[] = [
      "period >= {start_period:String}",
      "period <= {end_period:String}",
    ]

    if (program_id) {
      filters.push("stock_opname_program_id = {program_id:Int64}")
    }

    if (province_id) {
      filters.push("province_id = {province_id:Int64}")
    }

    const filterClause = filters.join(" AND ")

    return `
      SELECT 
        period,
        SUM(real_stock) as sum_real_stock,
        SUM(stock) as sum_stock,
        ABS(sum_stock - sum_real_stock) as sum_difference,
        CASE
          WHEN sum_real_stock = 0 AND sum_stock = 0 THEN 100
          WHEN sum_real_stock = 0 AND sum_stock != 0 THEN 0
          ELSE (1-(sum_difference / sum_stock)) * 100
        END as avg_accuracy_percentage
      FROM dashboard_stock_taking
      WHERE ${filterClause}
      GROUP BY period
      ORDER BY period ASC
    `
  }

  getStockTakingHighestQuery(
    c: Context,
    queryParam: QualityQueryParams
  ): string {
    const { program_id, province_id } = queryParam

    const filters: string[] = []

    const regionNameField = province_id ? "regency_name" : "province_name"

    if (province_id) {
      filters.push("province_id = {province_id:Int64}")
    }

    const filterClause =
      filters.length > 0 ? `AND ${filters.join(" AND ")}` : ""

    return `
      SELECT 
        ${regionNameField} as name,
        SUM(real_stock) as sum_real_stock,
        SUM(stock) as sum_stock,
        ABS(sum_stock - sum_real_stock) as sum_difference,
        CASE
          WHEN sum_real_stock = 0 AND sum_stock = 0 THEN 100
          WHEN sum_real_stock = 0 AND sum_stock != 0 THEN 0
          ELSE (1-(sum_difference / sum_stock)) * 100
        END as avg_accuracy_percentage
      FROM dashboard_stock_taking
      WHERE 
        stock_opname_period_id IN (
          SELECT MAX(stock_opname_period_id) 
          FROM dashboard_stock_taking 
          GROUP BY stock_opname_program_id
          ${program_id ? "HAVING stock_opname_program_id = {program_id:Int64}" : ""}
        )
        ${filterClause}
      GROUP BY ${regionNameField}
      ORDER BY avg_accuracy_percentage DESC
      LIMIT 10
    `
  }

  getStockTakingLowestQuery(
    c: Context,
    queryParam: QualityQueryParams
  ): string {
    const { program_id, province_id } = queryParam

    const filters: string[] = []

    const regionNameField = province_id ? "regency_name" : "province_name"

    if (province_id) {
      filters.push("province_id = {province_id:Int64}")
    }

    const filterClause =
      filters.length > 0 ? `AND ${filters.join(" AND ")}` : ""

    return `
      SELECT 
        ${regionNameField} as name,
        SUM(real_stock) as sum_real_stock,
        SUM(stock) as sum_stock,
        ABS(sum_stock - sum_real_stock) as sum_difference,
        CASE
          WHEN sum_real_stock = 0 AND sum_stock = 0 THEN 100
          WHEN sum_real_stock = 0 AND sum_stock != 0 THEN 0
          ELSE (1-(sum_difference / sum_stock)) * 100
        END as avg_accuracy_percentage
      FROM dashboard_stock_taking
      WHERE 
        stock_opname_period_id IN (
          SELECT MAX(stock_opname_period_id) 
          FROM dashboard_stock_taking 
          GROUP BY stock_opname_program_id
          ${program_id ? "HAVING stock_opname_program_id = {program_id:Int64}" : ""}
        )
        ${filterClause}
      GROUP BY ${regionNameField}
      ORDER BY avg_accuracy_percentage ASC
      LIMIT 10
    `
  }

  // Stock Discard Queries
  getStockDiscardMapsQuery(c: Context, queryParam: QualityQueryParams): string {
    const { program_id, province_id } = queryParam

    const filters: string[] = []

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    if (province_id) {
      filters.push("entities_province_id = {province_id:Int64}")
    }

    const filterClause =
      filters.length > 0 ? ` AND ${filters.join(" AND ")}` : ""

    if (province_id) {
      // When province_id is provided, group by regency
      return `
        SELECT 
          COALESCE(entities_regency_id, 0) as id,
          COALESCE(entities_regency_name, 'Unknown') as name,
          SUM(ds.discard) as discard,
          SUMIf(ds.discard, reason_category = 'Expired') as expired,
          SUMIf(ds.discard, reason_category = 'Broken') as broken,
          SUMIf(ds.discard, reason_category NOT IN ('Expired', 'Broken')) as other
        FROM dashboard_stock_discard ds
        WHERE 
          entities_regency_id IS NOT NULL
          AND period = {period:String}
          ${filterClause}
        GROUP BY entities_regency_id, entities_regency_name
        ORDER BY discard DESC
      `
    }

    // National view - group by province
    return `
      SELECT 
        COALESCE(entities_province_id, 0) as id,
        COALESCE(entities_province_name, 'Unknown') as name,
        SUM(ds.discard) as discard,
        SUMIf(ds.discard, reason_category = 'Expired') as expired,
        SUMIf(ds.discard, reason_category = 'Broken') as broken,
        SUMIf(ds.discard, reason_category NOT IN ('Expired', 'Broken')) as other
      FROM dashboard_stock_discard ds
      WHERE
        entities_province_id IS NOT NULL        
        AND period = {period:String}
        ${filterClause}
      GROUP BY entities_province_id, entities_province_name
      ORDER BY discard DESC
    `
  }

  getStockDiscardPendingMapsQuery(
    c: Context,
    queryParam: QualityQueryParams
  ): string {
    const { program_id, province_id } = queryParam

    const filters: string[] = []

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    if (province_id) {
      filters.push("entities_province_id = {province_id:Int64}")
    }

    const filterClause =
      filters.length > 0 ? ` AND ${filters.join(" AND ")}` : ""

    if (province_id) {
      // When province_id is provided, group by regency
      return `
        SELECT 
          COALESCE(entities_regency_id, 0) as id,
          COALESCE(entities_regency_name, 'Unknown') as name,
          SUM(pending_discard) as pending_discard
        FROM dashboard_stock_discard_pending
        WHERE 
          entities_regency_id IS NOT NULL
          ${filterClause}
        GROUP BY entities_regency_id, entities_regency_name
        ORDER BY pending_discard DESC
      `
    }

    // National view - group by province
    return `
      SELECT 
        COALESCE(entities_province_id, 0) as id,
        COALESCE(entities_province_name, 'Unknown') as name,
        SUM(pending_discard) as pending_discard
      FROM dashboard_stock_discard_pending
      WHERE
        entities_province_id IS NOT NULL        
        ${filterClause}
      GROUP BY entities_province_id, entities_province_name
      ORDER BY pending_discard DESC
    `
  }

  getStockDiscardTotalQuery(
    c: Context,
    queryParam: QualityQueryParams
  ): string {
    const { program_id, province_id } = queryParam

    const filters: string[] = []

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    if (province_id) {
      filters.push("entities_province_id = {province_id:Int64}")
    }

    const filterClause =
      filters.length > 0 ? ` AND ${filters.join(" AND ")}` : ""

    return `
      SELECT 
        COALESCE(SUM(discard), 0) as discard
      FROM dashboard_stock_discard
      WHERE 
        period = {period:String}
        ${filterClause}
    `
  }

  getStockDiscardPendingTotalQuery(
    c: Context,
    queryParam: QualityQueryParams
  ): string {
    const { program_id, province_id } = queryParam

    const filters: string[] = []

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    if (province_id) {
      filters.push("entities_province_id = {province_id:Int64}")
    }

    const filterClause =
      filters.length > 0 ? ` AND ${filters.join(" AND ")}` : ""

    return `
      SELECT 
        COALESCE(SUM(pending_discard), 0) as pending_discard
      FROM dashboard_stock_discard_pending
      WHERE 
        1 = 1
        ${filterClause}
    `
  }

  getStockDiscardMonthlyQuery(
    c: Context,
    queryParam: QualityQueryParams
  ): string {
    const { program_id, province_id } = queryParam

    const filters: string[] = [
      "period >= {start_period:String}",
      "period <= {end_period:String}",
    ]

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    if (province_id) {
      filters.push("entities_province_id = {province_id:Int64}")
    }

    const filterClause = filters.join(" AND ")

    return `
      SELECT 
        period,
        SUMIf(discard, reason_category = 'Expired') as expired,
        SUMIf(discard, reason_category = 'Broken') as broken,
        SUMIf(discard, reason_category NOT IN ('Expired', 'Broken')) as other
      FROM dashboard_stock_discard
      WHERE ${filterClause}
      GROUP BY period
      ORDER BY period ASC
    `
  }

  getStockDiscardHighestPendingQuery(
    c: Context,
    queryParam: QualityQueryParams
  ): string {
    const { program_id, province_id } = queryParam

    const filters: string[] = []

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    if (province_id) {
      filters.push("entities_province_id = {province_id:Int64}")
    }

    const filterClause =
      filters.length > 0 ? ` AND ${filters.join(" AND ")}` : ""

    return `
      SELECT 
        dsdp.parent_material_name as name,
        SUM(dsdp.pending_discard) as pending_discard
      FROM dashboard_stock_discard_pending dsdp
      WHERE 
        dsdp.pending_discard > 0
        ${filterClause}
      GROUP BY dsdp.parent_material_name
      ORDER BY pending_discard DESC
      LIMIT 10
    `
  }

  getStockDiscardTop10Query(
    c: Context,
    queryParam: QualityQueryParams
  ): string {
    const { program_id, province_id } = queryParam

    const filters: string[] = []

    if (program_id) {
      filters.push("program_id = {program_id:Int8}")
    }

    if (province_id) {
      filters.push("entities_province_id = {province_id:Int64}")
    }

    const filterClause =
      filters.length > 0 ? ` AND ${filters.join(" AND ")}` : ""

    return `
      SELECT 
        reason_category,
        parent_material_name,
        SUM(discard) as discard_qty
      FROM dashboard_stock_discard
      WHERE 
        discard > 0
        AND period = {period:String}
        ${filterClause}
      GROUP BY reason_category, parent_material_name
      ORDER BY reason_category, discard_qty DESC
    `
  }

  getLastUpdateQuery(tableName: string): string {
    return `
      SELECT MAX(last_updated) as last_update
      FROM ${tableName}
    `
  }

  // Asset Queries
  getAssetMapsQuery(c: Context, queryParam: QualityQueryParams): string {
    const { province_id, asset_classification_id } = queryParam

    const filters: string[] = ["period = {period:String}"]

    if (asset_classification_id) {
      filters.push(
        "has(da.asset_classifications_id, {asset_classification_id:Int64})"
      )
    }

    const filterClause =
      filters.length > 0 ? ` AND ${filters.join(" AND ")}` : ""

    if (province_id) {
      // When province_id is provided, group by regency
      return `
        SELECT 
          da.regency_id as id,
          da.regency_name as name,
          SUM(da.total_asset_cce_rtmd) as total_asset_cce_rtmd,
          SUM(da.damaged_asset) as damaged_asset,
          SUM(da.total_asset_recorded) as total_asset_recorded
        FROM dashboard_asset da
        WHERE 
          da.province_id = {province_id:Int64}
          AND da.regency_id IS NOT NULL
          ${filterClause}
        GROUP BY da.regency_id, da.regency_name
        ORDER BY da.regency_name ASC
      `
    }

    // National view - group by province
    return `
      SELECT 
        da.province_id as id,
        da.province_name as name,
        SUM(da.total_asset_cce_rtmd) as total_asset_cce_rtmd,
        SUM(da.damaged_asset) as damaged_asset,
        SUM(da.total_asset_recorded) as total_asset_recorded
      FROM dashboard_asset da
      WHERE 
        da.province_id IS NOT NULL
        ${filterClause}
      GROUP BY da.province_id, da.province_name
      ORDER BY da.province_name ASC
    `
  }

  getAssetDistinctMapsQuery(
    c: Context,
    queryParam: QualityQueryParams
  ): string {
    const { province_id, asset_classification_id } = queryParam

    const filters: string[] = ["period = {period:String}"]

    if (asset_classification_id) {
      filters.push(
        "has(da.asset_classifications_id, {asset_classification_id:Int64})"
      )
    }

    const filterClause = filters.length > 0 ? filters.join(" AND ") : ""

    const cte = `
      WITH source_distinct AS (
        SELECT DISTINCT
          da.province_id,
          da.province_name,
          da.regency_id,
          da.regency_name,
          da.entities_with_urecorded_asset,
          da.total_entities,
          da.total_asset_cce_excursion,
          da.avg_duration_excursion_regency,
          da.avg_duration_excursion_province
        FROM dashboard_asset da
        WHERE 
          ${filterClause}
      )
    `

    if (province_id) {
      // When province_id is provided, group by regency
      return `
        ${cte}
        SELECT 
          sd.regency_id as id,
          sd.regency_name as name,
          SUM(sd.entities_with_urecorded_asset) as entities_with_urecorded_asset,
          SUM(sd.total_entities) as total_entities,
          SUM(sd.total_asset_cce_excursion) as total_asset_cce_excursion,
          SUM(sd.avg_duration_excursion_regency) as avg_duration_excursion
        FROM source_distinct sd
        WHERE 
          sd.province_id = {province_id:Int64}
        GROUP BY sd.regency_id, sd.regency_name
        ORDER BY sd.regency_name ASC
      `
    }

    // National view - group by province
    return `
      ${cte}
      SELECT 
        sd.province_id as id,
        sd.province_name as name,
        SUM(sd.entities_with_urecorded_asset) as entities_with_urecorded_asset,
        SUM(sd.total_entities) as total_entities,
        SUM(sd.total_asset_cce_excursion) as total_asset_cce_excursion,
        SUM(sd.avg_duration_excursion_province) as avg_duration_excursion
      FROM source_distinct sd
      GROUP BY sd.province_id, sd.province_name
      ORDER BY sd.province_name ASC
    `
  }

  getAssetOverviewQuery(c: Context, queryParam: QualityQueryParams): string {
    const { province_id, asset_classification_id } = queryParam

    const filters: string[] = ["period = {period:String}"]

    if (asset_classification_id) {
      filters.push(
        "has(asset_classifications_id, {asset_classification_id:Int64})"
      )
    }

    if (province_id) {
      filters.push("province_id = {province_id:Int64}")
    }

    const filterClause =
      filters.length > 0 ? ` AND ${filters.join(" AND ")}` : ""

    return `
      SELECT 
        asset_type_id,
        asset_type_name,
        SUM(total_asset_recorded) as total_asset_recorded
      FROM dashboard_asset
      WHERE 
        asset_type_id IS NOT NULL
        ${filterClause}
      GROUP BY asset_type_id, asset_type_name
      ORDER BY total_asset_recorded DESC
    `
  }

  getAssetTotalQuery(c: Context, queryParam: QualityQueryParams): string {
    const { province_id, asset_classification_id } = queryParam

    const filters: string[] = ["period = {period:String}"]

    if (asset_classification_id) {
      filters.push(
        "has(asset_classifications_id, {asset_classification_id:Int64})"
      )
    }

    if (province_id) {
      filters.push("province_id = {province_id:Int64}")
    }

    const filterClause =
      filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : ""

    return `
      SELECT 
        SUM(total_asset_recorded) as total_asset_recorded
      FROM dashboard_asset
      ${filterClause}
    `
  }

  getAssetOverdueQuery(c: Context, queryParam: QualityQueryParams): string {
    const { province_id } = queryParam

    if (province_id) {
      // When province_id is provided, group by regency
      return `
        SELECT 
          doc.regency_id as id,
          doc.regency_name as name,
          SUM(doc.asset_overdue) as asset_overdue,
          SUM(doc.total_asset) as overdue_total_asset
        FROM dashboard_overdue_calibration doc
        WHERE 
          doc.province_id = {province_id:Int64}
          AND doc.regency_id IS NOT NULL
        GROUP BY doc.regency_id, doc.regency_name
        ORDER BY doc.regency_name ASC
      `
    }

    // National view - group by province
    return `
      SELECT 
        doc.province_id as id,
        doc.province_name as name,
        SUM(doc.asset_overdue) as asset_overdue,
        SUM(doc.total_asset) as overdue_total_asset
      FROM dashboard_overdue_calibration doc
      WHERE 
        doc.province_id IS NOT NULL
      GROUP BY doc.province_id, doc.province_name
      ORDER BY doc.province_name ASC
    `
  }
}
