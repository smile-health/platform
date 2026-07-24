import { MaterialQueryParams } from "./material.schema.js"

export class MaterialQuery {
  constructor() {}

  #generateFilters(
    queryParams: MaterialQueryParams,
    config: {
      entityIdField?: string
      entityTagIdField?: string
      provinceIdField?: string
      regencyIdField?: string
      isPqsField?: string
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
      whereConditions.push(`material_program_id IN {program_ids:Array(Int64)}`)
    }

    if (
      config.entityIdField &&
      queryParams.entity_ids &&
      queryParams.entity_ids.length > 0
    ) {
      prewhereConditions.push(
        `${config.entityIdField} IN {entity_ids:Array(Int64)}`
      )
    }

    if (
      config.entityTagIdField &&
      queryParams.entity_tag_ids &&
      queryParams.entity_tag_ids.length > 0
    ) {
      prewhereConditions.push(
        `${config.entityTagIdField} IN {entity_tag_ids:Array(Int64)}`
      )
    }

    if (
      config.provinceIdField &&
      queryParams.province_ids &&
      queryParams.province_ids.length > 0
    ) {
      whereConditions.push(
        `${config.provinceIdField} IN {province_ids:Array(Int64)}`
      )
    }

    if (
      config.regencyIdField &&
      queryParams.regency_ids &&
      queryParams.regency_ids.length > 0
    ) {
      whereConditions.push(
        `${config.regencyIdField} IN {regency_ids:Array(Int64)}`
      )
    }

    if (config.isPqsField) {
      if (queryParams.is_pqs === 1) {
        whereConditions.push(`${config.isPqsField} = 1`)
      } else {
        whereConditions.push(
          `(${config.isPqsField} IS NULL OR ${config.isPqsField} = 0)`
        )
      }
    }

    return {
      prewhereFilter: prewhereConditions.join("\n    AND "),
      whereFilter: whereConditions.join("\n    AND "),
    }
  }

  buildFunctionalStatusQuery(queryParams: MaterialQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "da.entity_id",
      entityTagIdField: "da.entity_tag_id",
      provinceIdField: "da.province_id",
      regencyIdField: "da.regency_id",
      isPqsField: "da.is_who_pqs",
    })

    const prewhereConditions = prewhereFilter ? [prewhereFilter] : []

    const whereConditions = [
      "has(da.asset_classifications_id, 1)",
      "da.deleted_at IS NULL",
      "da.master_deleted_at IS NULL",
    ]
    if (whereFilter) whereConditions.push(whereFilter)

    const query = `
      SELECT
        da.type_id as type_id,
        da.asset_type_name as type_name,
        da.min_temperature as temp_min,
        da.max_temperature as temp_max,
        countIf(da.working_status_id = 1) as total_well_functioning,
        countIf(da.working_status_id = 2) as total_standby,
        countIf(da.working_status_id = 3) as total_commisioning_issue,
        countIf(da.working_status_id = 4) as total_not_functioning,
        countIf(da.working_status_id = 9) as total_functioning_need_repair,
        round(countIf(da.working_status_id = 1) * 100.0 / count(), 2) as pct_well_functioning,
        round(countIf(da.working_status_id = 2) * 100.0 / count(), 2) as pct_standby,
        round(countIf(da.working_status_id = 3) * 100.0 / count(), 2) as pct_commisioning_issue,
        round(countIf(da.working_status_id = 4) * 100.0 / count(), 2) as pct_not_functioning,
        round(countIf(da.working_status_id = 9) * 100.0 / count(), 2) as pct_functioning_need_repair,
        count() as total_count
      FROM datamart_assets_v5 da FINAL
      ${prewhereConditions.length > 0 ? `PREWHERE\n        ${prewhereConditions.join("\n    AND ")}` : ""}
      WHERE
        ${whereConditions.join("\n    AND ")}
      GROUP BY
        da.type_id,
        da.asset_type_name,
        da.min_temperature,
        da.max_temperature
      ORDER BY
        isNull(da.min_temperature) ASC,
        isNull(da.max_temperature) ASC,
        da.type_id ASC,
        da.min_temperature ASC,
        da.max_temperature ASC
    `
    return query.trim()
  }

  buildTotalFunctionalCapacityQuery(queryParams: MaterialQueryParams) {
    const { prewhereFilter: prewhereDa, whereFilter: whereDa } =
      this.#generateFilters(queryParams, {
        entityTagIdField: "da.entity_tag_id",
        isPqsField: "da.is_who_pqs",
      })

    const { whereFilter: whereC } = this.#generateFilters(queryParams, {
      provinceIdField: "c.province_id",
      regencyIdField: "c.regency_id",
    })

    const prewhereConditions = prewhereDa ? [prewhereDa] : []

    const whereConditions = [
      "has(da.asset_classifications_id, 1)",
      "rat.deleted_at IS NULL",
      "da.working_status_id = 1",
      "da.deleted_at IS NULL",
      "c.deleted_at IS NULL",
    ]
    if (whereC) whereConditions.push(whereC)
    if (whereDa) whereConditions.push(whereDa)

    const query = `
      SELECT
        rat.id as type_id,
        rat.name as type_name,
        da.min_temperature as temp_min,
        da.max_temperature as temp_max,
        sum(ram.net_capacity) as volume_total
      FROM dim_coldstorages c FINAL
      JOIN datamart_assets_v5 da FINAL ON da.entity_id = c.entity_id
      JOIN raw_asset_types rat FINAL ON rat.id = da.type_id
      JOIN raw_asset_models ram FINAL ON ram.id = da.model_id
      ${prewhereConditions.length > 0 ? `PREWHERE\n        ${prewhereConditions.join("\n    AND ")}` : ""}
      WHERE
        ${whereConditions.join("\n    AND ")}
      GROUP BY
        rat.id, rat.name, da.min_temperature, da.max_temperature
      ORDER BY volume_total DESC
    `
    return query.trim()
  }

  buildMaterialFunctionalCapacityQuery(queryParams: MaterialQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "cm.entity_id",
      entityTagIdField: "cm.entity_tag_id",
      provinceIdField: "cm.province_id",
      regencyIdField: "cm.regency_id",
      filterProgram: true,
    })

    const baseConditions = [
      "cm.deleted_at IS NULL",
      "cm.master_deleted_at IS NULL",
      "rtt.deleted_at IS NULL",
      "rtt.is_predefined = 1",
    ]

    const finalWhere = whereFilter
      ? `${baseConditions.join("\n    AND ")}\n    AND ${whereFilter}`
      : baseConditions.join("\n    AND ")

    const query = `
      SELECT
        cm.material_id as material_id,
        cm.material_name as material_name,
        rtt.id as temperature_threshold_id,
        round(sum(cm.package_volume), 2) as volume_material,
        round(sum(cm.dosage_stock), 2) as dosage_material
      FROM dim_coldstorage_materials cm FINAL
      JOIN raw_temperature_thresholds rtt FINAL ON rtt.min_temperature = cm.material_min_temp AND rtt.max_temperature = cm.material_max_temp
      ${prewhereFilter ? `PREWHERE\n    ${prewhereFilter}` : ""}
      WHERE
        ${finalWhere}
        AND cm.material_min_temp IS NOT NULL
        AND cm.material_max_temp IS NOT NULL
      GROUP BY
        cm.material_id, cm.material_name, rtt.id
      ORDER BY
        volume_material DESC,
        dosage_material DESC,
        cm.material_name ASC
    `
    return query.trim()
  }
  buildMaterialVolumeByAssetTempQuery(queryParams: MaterialQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "cm.entity_id",
      entityTagIdField: "cm.entity_tag_id",
      provinceIdField: "cm.province_id",
      regencyIdField: "cm.regency_id",
      filterProgram: true,
    })

    const baseConditions = [
      "cm.deleted_at IS NULL",
      "cm.master_deleted_at IS NULL",
    ]

    const finalWhere = whereFilter
      ? `${baseConditions.join("\n    AND ")}\n    AND ${whereFilter}`
      : baseConditions.join("\n    AND ")

    // Join with datamart_assets_v5 to get asset type temp
    const query = `
      SELECT
        rat.min_temperature as temp_min,
        rat.max_temperature as temp_max,
        round(sum(cm.package_volume), 2) as volume_material,
        round(sum(cm.dosage_stock), 2) as dosage_material
      FROM dim_coldstorage_materials cm FINAL
      JOIN datamart_assets_v5 da FINAL ON da.id = cm.coldstorage_id
      JOIN raw_asset_types rat FINAL ON rat.id = da.type_id
      ${prewhereFilter ? `PREWHERE\n    ${prewhereFilter}` : ""}
      WHERE
        ${finalWhere}
      GROUP BY
        rat.min_temperature, rat.max_temperature
    `
    return query.trim()
  }

  buildCapacityRemainingQuery(queryParams: MaterialQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityTagIdField: "dc.entity_tag_id",
      provinceIdField: "dc.province_id",
      regencyIdField: "dc.regency_id",
    })

    const baseConditions = [
      "rcpt.deleted_at IS NULL",
      "rtt.deleted_at IS NULL",
      "dc.deleted_at IS NULL",
      "dc.master_deleted_at IS NULL",
    ]

    const finalWhere = whereFilter
      ? `${baseConditions.join("\n    AND ")}\n    AND ${whereFilter}`
      : baseConditions.join("\n    AND ")

    const query = `
      SELECT
        rtt.max_temperature as max_temperature,
        rtt.min_temperature as min_temperature,
        sum(rcpt.volume_asset) as total_volume_asset,
        sum(rcpt.total_volume) as volume_material,
        sum(rcpt.volume_asset) - sum(rcpt.total_volume) as remaining_volume,
        ROUND(
          (sum(rcpt.total_volume) / NULLIF(sum(rcpt.volume_asset), 0)) * 100, 2
        ) as usage_percentage,
        ROUND(
          ((sum(rcpt.volume_asset) - sum(rcpt.total_volume)) / NULLIF(sum(rcpt.volume_asset), 0)) * 100, 2
        ) as remaining_percentage
      FROM raw_coldstorage_per_temperature rcpt FINAL
      LEFT JOIN raw_temperature_thresholds rtt FINAL ON rcpt.temperature_threshold_id = rtt.id
      LEFT JOIN dim_coldstorages dc FINAL ON dc.id = rcpt.coldstorage_id
      ${prewhereFilter ? `PREWHERE\n    ${prewhereFilter}` : ""}
      WHERE
        ${finalWhere}
      GROUP BY
        rtt.min_temperature, rtt.max_temperature
      ORDER BY
        rtt.min_temperature ASC
    `
    return query.trim()
  }
}
