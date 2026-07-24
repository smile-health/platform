import { Context } from "hono"
import { MaterialQueryParams } from "./material.schema.js"
import { PaginationOption } from "@/common/schemas/pagination.schema.js"
import { IS_SO_MANDATORY } from "@/common/constants/stock-opname.js"

export class MaterialQuery {
  constructor() {}

  #generateMaterialClauses(
    queryParams: MaterialQueryParams,
    paginationOption: PaginationOption
  ) {
    const { paginate, offset } = queryParams
    const { is_paginate, count } = paginationOption

    let select = `
      rwm.id AS id,
      rwm.name AS name,
      rwm.code as code,
      rwm.is_stock_opname_mandatory as is_stock_opname_mandatory,
      rwm.material_type_id as material_type_id
    `
    let groupBy =
      "GROUP BY rwm.id, rwm.name, rwm.code, rwm.is_stock_opname_mandatory, rwm.material_type_id"
    let orderBy = "ORDER BY rwm.name ASC"
    let pagination = `LIMIT ${paginate} OFFSET ${offset}`

    if (count === true) {
      select = "COUNT(DISTINCT rwm.id) as count"
      groupBy = ""
      orderBy = ""
      pagination = ""
    } else if (is_paginate === false) {
      pagination = ""
    }

    return { pagination, select, groupBy, orderBy }
  }

  #generateMaterialFilters(queryParams: MaterialQueryParams) {
    const {
      material_id,
      material_ids,
      material_type_id,
      material_type_ids,
      material_level_id,
      material_is_stock_opname_mandatory,
      activity_id,
      activity_ids,
    } = queryParams

    let filters = ""
    filters += material_id ? " AND rwm.id = {material_id:Int64}" : ""
    filters += material_ids ? " AND rwm.id in {material_ids:Array(Int64)}" : ""
    filters += material_type_id
      ? " AND rwm.material_type_id = {material_type_id:Int64}"
      : ""
    filters += material_type_ids
      ? " AND rwm.material_type_id in {material_type_ids:Array(Int64)}"
      : ""
    filters += material_level_id
      ? " AND rwm.material_level_id = {material_level_id:Int64}"
      : ""
    filters += activity_id ? " AND rwma.activity_id = {activity_id:Int64}" : ""
    filters += activity_ids
      ? " AND rwma.activity_id in {activity_ids:Array(Int64)}"
      : ""
    filters += material_is_stock_opname_mandatory
      ? " AND rwm.is_stock_opname_mandatory = {material_is_stock_opname_mandatory:Int64}"
      : ""

    return { filters }
  }

  buildMaterialQuery(
    c: Context,
    queryParams: MaterialQueryParams,
    paginationOption: PaginationOption = {}
  ) {
    const programId = c.var.programId ?? queryParams.program_id

    const { pagination, select, groupBy, orderBy } =
      this.#generateMaterialClauses(queryParams, paginationOption)

    const { filters } = this.#generateMaterialFilters(queryParams)

    return `
      SELECT
        ${select}
      FROM raw_ws_materials AS rwm FINAL
      JOIN raw_ws_material_activities AS rwma FINAL ON rwma.material_id = rwm.id
      WHERE
        rwm.program_id = ${programId}
        AND rwm.deleted_at is null
        ${filters}
      ${groupBy}
      ${orderBy}
      ${pagination}
    `
  }

  #generateSoMaterialDenomFilters(queryParams: MaterialQueryParams) {
    const { material_id, material_ids, activity_id, activity_ids } = queryParams

    let filters = ""
    filters += activity_id
      ? " AND dwema.ema_activity_id = {activity_id:Int64}"
      : ""
    filters += activity_ids
      ? " AND dwema.ema_activity_id in {activity_ids:Array(Int64)}"
      : ""
    filters += material_id
      ? " AND dwema.ema_material_id = {material_id:Int64}"
      : ""
    filters += material_ids
      ? " AND dwema.ema_material_id in {material_ids:Array(Int64)}"
      : ""

    return { filters }
  }

  buildSoMaterialDenomQuery(c: Context, queryParams: MaterialQueryParams) {
    const programId = c.var.programId ?? queryParams.program_id
    const { filters } = this.#generateSoMaterialDenomFilters(queryParams)

    return `
      SELECT 
        dwema.ema_entity_id as entity_id,
        count(distinct dwema.ema_material_id) as total_material_denom
      FROM dim_ws_entity_material_activities dwema 
      PREWHERE dwema.program_id = ${programId} AND dwema.has_transaction_already = 1
      WHERE 
        dwema.material_is_stock_opname_mandatory = ${IS_SO_MANDATORY.TRUE}
        ${filters}
      GROUP BY dwema.ema_entity_id 
    `
  }

  buildSoMaterialDenomListQuery(c: Context, queryParams: MaterialQueryParams) {
    const programId = c.var.programId ?? queryParams.program_id
    const { filters } = this.#generateSoMaterialDenomFilters(queryParams)

    return `
      SELECT 
        dwema.ema_entity_id as entity_id,
        dwema.ema_material_id as material_id
      FROM dim_ws_entity_material_activities dwema 
      PREWHERE dwema.program_id = ${programId} AND dwema.has_transaction_already = 1
      WHERE 
        dwema.material_is_stock_opname_mandatory = ${IS_SO_MANDATORY.TRUE}
        ${filters}
      GROUP BY dwema.ema_entity_id, dwema.ema_material_id 
    `
  }
}
