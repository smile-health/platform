import { Context } from "hono"
import moment from "moment"
import { SufficiencyQueryParams } from "./sufficiency.schema.js"
import WarehouseTemplate from "@smile/lib/excel/warehouse-template.js"
import { Column } from "@smile/lib/excel/types.js"
import { ExcelExportOption } from "@/common/types/excel.js"
import { getExportLocationFileName } from "@/common/utils/export.js"
import { ExecutiveDashboardSufficiencyRepository } from "./sufficiency.repository.js"
import { RegionRepository } from "@/modules/region/region.repository.js"
import { round } from "@smile/lib/utils.js"

export class ExecutiveDashboardSufficiencyExcel {
  constructor(
    private readonly repository: ExecutiveDashboardSufficiencyRepository,
    private readonly regionRepository: RegionRepository
  ) {}

  /**
   * Generate stock sufficiency export to Excel
   */
  async generateStockSufficiencyExport(
    c: Context,
    queryParams: SufficiencyQueryParams
  ) {
    // Get current period if not provided
    const currentPeriod = queryParams.period || moment().format("YYYY-MM")
    queryParams.period = currentPeriod
    queryParams.program_id = c.var.programId

    // Fetch raw data from dashboard_stock_sufficiency table
    const data = await this.repository.fetchStockSufficiencyExportData(
      c,
      queryParams
    )

    // Transform data to match required columns
    const transformedData = data.map((row, index) => ({
      no: index + 1,
      province_name: row.entities_province_name || "",
      regency_name: row.entities_regency_name || "",
      entity_id: row.entities_id || "",
      entity_name: row.entities_name || "",
      parent_material_name: row.parent_material_name || "",
      material_type_name: c.var.t(
        `material_type.label.${row.material_type_name}`
      ),
      balance: round(row.balance_per_entity_parent_materials || 0),
      annual_need: round(row.kebutuhan_1_tahun || 0),
      min_value: round(row.nilai_minimum || 0),
      average_consumption: round(row.avg_12_month || 0),
      sum_12_month: round(row.sum_12_month || 0),
      consumption_sufficiency: round(row.consumption_value || 0),
      status: c.var.t(`executive_dashboard.status.${row.status}`),
    }))

    // Define columns for the export
    const columns: Column[] = [
      { key: "no", header: "No.", width: 10 },
      {
        key: "province_name",
        header: c.var.t("common.province"),
        width: 25,
      },
      {
        key: "regency_name",
        header: c.var.t("common.regency"),
        width: 25,
      },
      { key: "entity_id", header: c.var.t("common.entity_id"), width: 15 },
      { key: "entity_name", header: c.var.t("common.entity"), width: 30 },
      {
        key: "parent_material_name",
        header: c.var.t("common.material"),
        width: 30,
      },
      {
        key: "material_type_name",
        header: c.var.t("common.material_type"),
        width: 30,
      },
      {
        key: "balance",
        header: c.var.t("executive_dashboard.balance"),
        width: 15,
      },
      {
        key: "annual_need",
        header: c.var.t("executive_dashboard.annual_need"),
        width: 15,
      },
      {
        key: "min_value",
        header: c.var.t("executive_dashboard.min_value"),
        width: 15,
      },
      {
        key: "average_consumption",
        header: c.var.t("executive_dashboard.average_consumption"),
        width: 20,
      },
      {
        key: "sum_12_month",
        header: c.var.t("executive_dashboard.sum_12_month"),
        width: 20,
      },
      {
        key: "consumption_sufficiency",
        header: c.var.t("executive_dashboard.consumption_sufficiency"),
        width: 20,
      },
      {
        key: "status",
        header: c.var.t("executive_dashboard.status"),
        width: 20,
      },
    ]

    const filters = await this.generateFilters(c, queryParams)

    const option: ExcelExportOption = {
      sheetName: c.var.t("executive_dashboard.stock_sufficiency"),
      titleBar: c.var.t("executive_dashboard.stock_sufficiency"),
      filters,
      columns,
      data: transformedData,
    }

    const locationLabel = getExportLocationFileName(c, queryParams, filters)
    const template = new WarehouseTemplate()
    await template.initWorkbook()

    // Initialize sheet and set columns only (no title bar or filters as requested)
    template.initSheet(option.sheetName)
    template.setColumns(option.columns, undefined, option.sheetName)
    await template.addRows(option.sheetName, option.data)

    template.setTitle(
      `${option.titleBar} Export ${locationLabel} ${moment().format("YYYY MM DD HH:mm:ss")}`
    )
    return await template.generate()
  }

  /**
   * Generate filters for Excel export
   */
  async generateFilters(c: Context, queryParams: SufficiencyQueryParams) {
    const { period, province_id, material_type_ids, program_id } = queryParams

    const filterPaginationOption = {
      is_paginate: false,
    }

    const provinces = province_id
      ? (
          await this.regionRepository.fetchProvinces(
            c,
            queryParams,
            filterPaginationOption
          )
        ).records
      : []

    const filters = [
      {
        key: c.var.t("common.period"),
        value: period || moment().format("YYYY-MM"),
      },
      {
        key: c.var.t("common.province"),
        value:
          Array.isArray(provinces) && provinces.length > 0
            ? provinces.map((province) => province.name).join(", ")
            : c.var.t("common.all"),
      },
      {
        key: c.var.t("common.material_type"),
        value:
          Array.isArray(material_type_ids) && material_type_ids.length > 0
            ? material_type_ids.join(", ")
            : c.var.t("common.all"),
      },
      {
        key: c.var.t("common.program"),
        value: program_id?.toString() || c.var.t("common.all"),
      },
    ]

    return filters
  }
}
