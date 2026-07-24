import { AnnualQueryParams } from "./annual.schema.js"

export class AnnualQuery {
  constructor() {}

  #generateFilters(
    queryParams: AnnualQueryParams,
    config: {
      entityIdField?: string
      entityTagIdField?: string
      provinceIdField?: string
      regencyIdField?: string
      yearField?: string
    }
  ) {
    const prewhereConditions: string[] = []
    const whereConditions: string[] = []

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

    if (config.yearField && queryParams.year) {
      prewhereConditions.push(`${config.yearField} = ${queryParams.year}`)
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

    return {
      prewhereFilter: prewhereConditions.join("\n    AND "),
      whereFilter: whereConditions.join("\n    AND "),
    }
  }

  buildAnnualNeedEntityQuery(queryParams: AnnualQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "entity_id",
      entityTagIdField: "entity_tag_id",
      provinceIdField: "province_id",
      regencyIdField: "regency_id",
      yearField: "year",
    })

    const finalWhere = whereFilter ? `WHERE \n ${whereFilter}` : ""

    const query = `
      SELECT 
        category_distribution,
        count() as count
      FROM dim_annual_need_entity FINAL
      ${prewhereFilter ? `PREWHERE\n    ${prewhereFilter}` : ""}
      ${finalWhere}
      GROUP BY category_distribution
    `
    return query.trim()
  }

  buildAnnualNeedEntityExportQuery(queryParams: AnnualQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "entity_id",
      entityTagIdField: "entity_tag_id",
      provinceIdField: "province_id",
      regencyIdField: "regency_id",
      yearField: "year",
    })

    const finalWhere = whereFilter ? `WHERE \n ${whereFilter}` : ""

    const query = `
      SELECT 
        row_number() OVER (ORDER BY province_name, regency_name, entity_name) as row_number,
        province_name,
        regency_name,
        entity_id,
        entity_name,
        entity_type,
        year,
        entity_tag_id,
        capacity_nett,
        year_need_volume,
        standard_distribution_interval,
        year_need_interval,
        percentage_capacity_interval,
        calculated_distribution_interval,
        category_distribution
      FROM dim_annual_need_entity FINAL
      ${prewhereFilter ? `PREWHERE\n    ${prewhereFilter}` : ""}
      ${finalWhere}
      ORDER BY province_name, regency_name, entity_name
    `
    return query.trim()
  }

  buildAnnualNeedMaterialQuery(queryParams: AnnualQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "entity_id",
      entityTagIdField: "entity_tag_id",
      provinceIdField: "province_id",
      regencyIdField: "regency_id",
      yearField: "year",
    })

    const query = `
      SELECT 
        material_min_temp,
        material_max_temp,
        material_id,
        material_name,
        sum(year_need_volume) as total_year_need_volume
      FROM dim_annual_need_material FINAL
      ${prewhereFilter ? `PREWHERE\n    ${prewhereFilter}` : ""}
      WHERE
        (material_max_temp > material_min_temp OR material_min_temp < 0)
        ${whereFilter ? `AND ${whereFilter}` : ""}
      GROUP BY 
        material_min_temp, 
        material_max_temp, 
        material_id, 
        material_name
    `
    return query.trim()
  }

  buildAnnualNeedTemperatureQuery(queryParams: AnnualQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "entity_id",
      entityTagIdField: "entity_tag_id",
      provinceIdField: "province_id",
      regencyIdField: "regency_id",
      yearField: "year",
    })

    const query = `
      SELECT 
        min_temp as material_min_temp,
        max_temp as material_max_temp,
        category_distribution,
        count(entity_id) as count
      FROM dim_annual_coldstorage_per_temp FINAL
      ${prewhereFilter ? `PREWHERE\n    ${prewhereFilter}` : ""}
      WHERE
        (max_temp > min_temp OR min_temp < 0)
        ${whereFilter ? `AND ${whereFilter}` : ""}
      GROUP BY 
        min_temp, 
        max_temp, 
        category_distribution
    `
    return query.trim()
  }

  buildAnnualNeedTemperatureExportQuery(queryParams: AnnualQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "entity_id",
      entityTagIdField: "entity_tag_id",
      provinceIdField: "province_id",
      regencyIdField: "regency_id",
      yearField: "year",
    })

    const query = `
      SELECT 
        row_number() OVER (ORDER BY province_name, regency_name, entity_name, min_temp, max_temp) as row_number,
        province_name,
        regency_name,
        entity_id,
        entity_name,
        entity_type,
        min_temp as material_min_temp,
        max_temp as material_max_temp,
        year,
        entity_tag_id,
        capacity_nett,
        year_need_volume,
        standard_distribution_interval,
        year_need_interval,
        percentage_capacity_interval,
        calculated_distribution_interval,
        category_distribution
      FROM dim_annual_coldstorage_per_temp FINAL
      ${prewhereFilter ? `PREWHERE\n    ${prewhereFilter}` : ""}
      WHERE
        (max_temp > min_temp OR min_temp < 0)
        ${whereFilter ? `AND ${whereFilter}` : ""}
      ORDER BY province_name, regency_name, entity_name, min_temp, max_temp
    `
    return query.trim()
  }

  buildAnnualAchievementNeedQuery(queryParams: AnnualQueryParams) {
    const { prewhereFilter, whereFilter } = this.#generateFilters(queryParams, {
      entityIdField: "entity_id",
      entityTagIdField: "entity_tag_id",
      provinceIdField: "province_id",
      regencyIdField: "regency_id",
      yearField: "year",
    })

    const finalWhere = whereFilter ? `WHERE \n ${whereFilter}` : ""

    const query = `
      SELECT 
        sum(year_achievement_volume) as total_year_achievement_volume
      FROM dim_annual_achievement_need FINAL
      ${prewhereFilter ? `PREWHERE\n    ${prewhereFilter}` : ""}
      ${finalWhere}
    `
    return query.trim()
  }
}
