import { CceQueryParams } from "./cce.schema.js"

export class CceQuery {
  constructor() {}

  // Simplified unified filter generator
  #generateFilters(
    queryParams: CceQueryParams,
    config: {
      entityIdField: string
      entityTagIdField: string
      provinceIdField?: string
      regencyIdField?: string
      usePeriod?: boolean
      periodFormat?: "month" | "year"
      dateField?: string
      additionalWhereConditions?: string[]
      filterProgram?: boolean
    }
  ) {
    const prewhereConditions: string[] = []
    const whereConditions: string[] = []

    if (
      config.filterProgram &&
      queryParams.program_ids &&
      queryParams.program_ids.length > 0
    ) {
      whereConditions.push(`program_id IN {program_ids:Array(Int64)}`)
    }

    // Entity IDs
    if (queryParams.entity_ids && queryParams.entity_ids.length > 0) {
      // can't use prewhere on two different tables
      if (config.entityIdField === "e.global_id") {
        whereConditions.push(
          `${config.entityIdField} IN {entity_ids:Array(Int64)}`
        )
      } else {
        prewhereConditions.push(
          `${config.entityIdField} IN {entity_ids:Array(Int64)}`
        )
      }
    }

    // Entity Tag IDs
    if (queryParams.entity_tag_ids && queryParams.entity_tag_ids.length > 0) {
      prewhereConditions.push(
        `${config.entityTagIdField} IN {entity_tag_ids:Array(Int64)}`
      )
    }

    // Period handling
    if (config.usePeriod) {
      if (
        config.periodFormat === "month" &&
        queryParams.year &&
        queryParams.month
      ) {
        const monthYear = `${queryParams.year}-${String(queryParams.month).padStart(2, "0")}`
        prewhereConditions.push(
          `formatDateTime(${config.dateField}, '%Y-%m') = '${monthYear}'`
        )
      } else if (config.periodFormat === "year" && queryParams.year) {
        prewhereConditions.push(
          `toYear(${config.dateField}) = ${queryParams.year}`
        )
      }
    }

    // Date range based on period (12 months back from period)
    if (queryParams.year && queryParams.month && config.dateField) {
      const periodDate = new Date(
        Number(queryParams.year),
        Number(queryParams.month) - 1,
        1
      )

      // Calculate 12 months back
      const fromDate = new Date(periodDate)
      fromDate.setMonth(fromDate.getMonth() - 12)

      // Calculate last day of period month
      const toEndDate = new Date(periodDate)
      toEndDate.setMonth(toEndDate.getMonth() + 1)
      toEndDate.setDate(0) // Last day of previous month

      // Format dates as YYYY-MM-DD
      const fromDateStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}-01`
      const toDateStr = `${toEndDate.getFullYear()}-${String(toEndDate.getMonth() + 1).padStart(2, "0")}-${String(toEndDate.getDate()).padStart(2, "0")}`

      whereConditions.push(
        `date(${config.dateField}) >= toDateTime('${fromDateStr}', 'Asia/Jakarta') AND date(${config.dateField}) <= toDateTime('${toDateStr}', 'Asia/Jakarta')`
      )
    }

    // Province IDs
    if (
      config.provinceIdField &&
      queryParams.province_ids &&
      queryParams.province_ids.length > 0
    ) {
      whereConditions.push(
        `${config.provinceIdField} IN {province_ids:Array(Int64)}`
      )
    }

    // Regency IDs
    if (
      config.regencyIdField &&
      queryParams.regency_ids &&
      queryParams.regency_ids.length > 0
    ) {
      whereConditions.push(
        `${config.regencyIdField} IN {regency_ids:Array(Int64)}`
      )
    }

    // Additional WHERE conditions
    if (config.additionalWhereConditions) {
      whereConditions.push(...config.additionalWhereConditions)
    }

    return {
      prewhereFilter: prewhereConditions.join("\n    AND "),
      whereFilter: whereConditions.join("\n    AND "),
    }
  }

  buildCapacityStatusQuery(queryParams: CceQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "c.entity_id",
      entityTagIdField: "c.entity_tag_id",
      provinceIdField: "c.province_id",
      regencyIdField: "c.regency_id",
    })

    const whereConditions: string[] = [
      "c.created_at IS NOT NULL",
      "c.deleted_at IS NULL",
      "c.master_deleted_at IS NULL",
    ]

    const finalWhereFilter = whereFilter
      ? `${whereFilter}\n    AND ${whereConditions.join("\n    AND ")}`
      : whereConditions.join("\n    AND ")

    const query = `
      SELECT
        sum(c.volume_asset) as volume_total,
        sum(c.total_volume) as volume_material,
        (15 / 100) * sum(c.volume_asset) as volume_max,
        round(100 * volume_material / volume_total, 2) as volume_material_percentage
      FROM dim_coldstorages c FINAL
      ${prewhereFilter ? `PREWHERE\n    ${prewhereFilter}` : ""}
      WHERE 
        ${finalWhereFilter}
    `

    return query.trim()
  }

  buildEntityByColdstorageStatusCapacityQuery(
    queryParams: CceQueryParams,
    groupByEntity = false
  ) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "c.entity_id",
      entityTagIdField: "c.entity_tag_id",
      provinceIdField: "c.province_id",
      regencyIdField: "c.regency_id",
    })

    const whereConditions: string[] = [
      "c.deleted_at IS NULL",
      "c.master_deleted_at IS NULL",
    ]

    const finalWhereFilter = whereFilter
      ? `${whereFilter}\n    AND ${whereConditions.join("\n    AND ")}`
      : whereConditions.join("\n    AND ")

    let query = `
      SELECT
        countIf(c.entity_id, c.percentage_capacity > 0 AND c.percentage_capacity <= 15) as count_buffer,
        countIf(c.entity_id, c.percentage_capacity > 15 AND c.percentage_capacity <= 85) as count_ideal,
        countIf(c.entity_id, c.percentage_capacity > 85) as count_max,
        count_buffer + count_ideal + count_max as count_total
      FROM dim_coldstorages c FINAL
      ${prewhereFilter ? `PREWHERE\n    ${prewhereFilter}` : ""}
      WHERE 
        ${finalWhereFilter}
    `

    if (groupByEntity) {
      query = `
        SELECT
          c.entity_id,
          c.entity_name,
          sum(c.total_volume) as volume_material,
          sum(c.volume_asset) as volume_asset,
          sum(c.percentage_capacity) as percentage_capacity
        FROM dim_coldstorages c FINAL
        ${prewhereFilter ? `PREWHERE\n    ${prewhereFilter}` : ""}
        WHERE 
          ${finalWhereFilter}
          AND c.entity_id IS NOT NULL
        GROUP BY
          c.entity_id,
          c.entity_name
      `
    }

    return query.trim()
  }

  buildAverageOrderLeadTimeQuery(queryParams: CceQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "dor.customer_id",
      entityTagIdField: "dor.customer_entity_tag_id",
      provinceIdField: "dor.customer_province_id",
      regencyIdField: "dor.customer_regency_id",
      dateField: "dor.period",
      filterProgram: true,
    })

    const query = `
      SELECT
        ceiling(max(max_duration)) as max_duration,
        ceiling(sum(sum_duration) / sum(count_orders) ) as avg_duration
      FROM datamart_monthly_order_lead_time dor FINAL
      ${prewhereFilter ? `PREWHERE\n    ${prewhereFilter}` : ""}
      WHERE 
        ${whereFilter}
    `

    return query.trim()
  }

  buildDayOfSupplyQuery(queryParams: CceQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "e.global_id",
      entityTagIdField: "dt.entity_tags_id",
      provinceIdField: "dt.entities_province_id",
      regencyIdField: "dt.entities_regency_id",
      dateField: "dt.transactions_created_at",
      filterProgram: true,
    })

    const query = `
      WITH latest_transactions AS (
        SELECT 
          transactions_stock_id,
          argMax(transactions_id, transactions_created_at) as max_transaction_id
        FROM datamart_transactions_v5 dt FINAL
        INNER JOIN raw_ws_entities e FINAL ON dt.entities_id = e.id
        ${prewhereFilter ? `PREWHERE \n          ${prewhereFilter}` : ""}
        ${whereFilter ? `WHERE\n          ${whereFilter}` : ""}
        GROUP BY transactions_stock_id
      )
      SELECT
        ROUND(SUM(
          ABS(
            CASE
              WHEN dt.transactions_transaction_type_id = 1 
              THEN dt.transactions_change_qty
              ELSE dt.transactions_opening_qty + dt.transactions_change_qty
            END
          )
        )) as qty
      FROM datamart_transactions_v5 dt FINAL
      INNER JOIN raw_ws_entities e FINAL ON dt.entities_id = e.id
      INNER JOIN latest_transactions lt 
        ON dt.transactions_id = lt.max_transaction_id
      WHERE dt.entities_is_vendor = 1
        AND dt.entities_type IN (1, 2, 3)
    `

    return query.trim()
  }

  buildAverageMonthlyConsumptionQuery(queryParams: CceQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "e.global_id",
      entityTagIdField: "dt.entity_tags_id",
      provinceIdField: "dt.entities_province_id",
      regencyIdField: "dt.entities_regency_id",
      dateField: "dt.transactions_created_at",
      filterProgram: true,
    })

    const query = `
    SELECT
      round(sum(
        case
          when dt.entity_tags_id in (5, 7) then abs(dt.distribusi)
          else abs(dt.konsumsi)
        end
      ) / 12) as qty
    FROM datamart_transactions_v5 dt FINAL
    INNER JOIN raw_ws_entities e FINAL ON dt.entities_id = e.id
    ${prewhereFilter ? `PREWHERE\n      ${prewhereFilter}` : ""}
    WHERE ${whereFilter ? whereFilter : "1=1"}
      AND dt.entities_type != 97
  `

    return query.trim()
  }
}
