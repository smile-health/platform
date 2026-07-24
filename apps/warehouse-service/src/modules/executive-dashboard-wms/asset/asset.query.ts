export class AssetQuery {
  private escapeSqlLiteral(value: string): string {
    return value.replace(/'/g, "''")
  }

  getAssetDataQuery(provinceId?: string): string {
    const isProvincialView = !!provinceId
    const selectId = isProvincialView ? "hf_city_id" : "hf_province_id"
    const selectName = isProvincialView ? "hf_city_name" : "hf_province_name"
    const groupBy = isProvincialView ? "hf_city_id" : "hf_province_id"

    const whereConditions = ["hf_province_id IS NOT NULL", "hf_province_id != ''"]

    if (provinceId) {
      whereConditions.push(`hf_province_id = '${this.escapeSqlLiteral(provinceId)}'`)
      whereConditions.push("hf_city_id IS NOT NULL")
      whereConditions.push("hf_city_id != ''")
    }

    let query = `
      SELECT
        any(${selectId}) as province_id,
        any(${selectName}) as province_name,
        any(hf_province_name) as area_name,
        sum(total_cold_storage) as coldstorage,
        sum(total_autoclave) as autoclave,
        sum(total_incinerator) as incinerator,
        sum(total_scale) as scale_unit,
        sum(total_scale_borrowed) as scale_borrowed,
        sum(total_overdue_calibration) as overdue_calibration
      FROM dashboard_wms_asset
      WHERE ${whereConditions.join(" AND ")}
    `

    query += `
      GROUP BY ${groupBy}
      ORDER BY province_id
    `

    return query
  }

  getNationalSummaryQuery(provinceId?: string): string {
    const whereConditions = ["hf_province_id IS NOT NULL", "hf_province_id != ''"]

    if (provinceId) {
      whereConditions.push(`hf_province_id = '${this.escapeSqlLiteral(provinceId)}'`)
    }

    return `
      WITH (hf_province_id IS NOT NULL AND hf_province_id != '') AS valid_hf
      SELECT
        sumIf(total_cold_storage, valid_hf) as coldstorage,
        sumIf(total_cold_storage_borrowed, valid_hf) as coldstorage_borrowed,
        sumIf(total_autoclave, valid_hf) as autoclave,
        sumIf(total_incinerator, valid_hf) as incinerator,
        sumIf(total_scale, valid_hf) as scale_unit,
        sumIf(total_scale_borrowed, valid_hf) as scale_borrowed,
        sumIf(total_scale_third_party, valid_hf) as scale_third_party,
        sumIf(total_scale, asset_type_id = 40) as ownership_total_scale,
        sumIf(total_scale_borrowed, asset_type_id = 40) as ownership_scale_borrowed,
        sumIf(total_scale_unit_sharing, asset_type_id = 40) as scale_shared_total,
        sumIf(total_scale_third_party, asset_type_id = 40) as scale_shared_from_third_party,
        sumIf(total_scale_unit_sharing, asset_type_id = 40) as scale_provided_third_party,
        sumIf(total_scale_unit_sharing_fasyankes, asset_type_id = 40) as scale_provided_health_facilitator,
        sumIf(total_cold_storage, asset_type_id = 43) as overview_cold_storage_total,
        sumIf(total_cold_storage_borrowed, asset_type_id = 43) as overview_cold_storage_borrowed,
        sumIf(total_autoclave, asset_type_id = 42) as overview_autoclave,
        sumIf(total_incinerator, asset_type_id = 41) as overview_incinerator,
        sumIf(total_scale_unit_sharing_fasyankes, valid_hf) as scale_health_facilitator,
        sumIf(total_asset, valid_hf) as total_all
      FROM dashboard_wms_asset
      WHERE ${whereConditions.join(" AND ")}
    `
  }

  getLastUpdateQuery(): string {
    return `
      SELECT formatDateTime(max(last_updated), '%Y-%m-%d %H:%i:%s') as last_updated
      FROM dashboard_wms_asset
    `
  }
}
