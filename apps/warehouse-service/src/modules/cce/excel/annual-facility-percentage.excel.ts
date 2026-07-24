/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseTemplate from "@smile/lib/excel/index.js"
import { PROCESSOR } from "@smile/lib/excel/types.js"
import { FileResponse } from "@smile/lib/types/file.js"

export class AnnualFacilityPercentageExcel extends BaseTemplate {
  constructor(private data: any[]) {
    super(14, 1, PROCESSOR.XLSXPOPULATE)
  }

  async generate(): Promise<FileResponse> {
    const title = this.t("dashboard.cce.excel.annual_facility_percentage")
    this.setTitle(title)
    await this.initSheet(title)

    this.setColumns([
      { header: this.t("dashboard.cce.excel.no"), width: 10 },
      { header: this.t("dashboard.cce.excel.province"), width: 25 },
      { header: this.t("dashboard.cce.excel.regency"), width: 30 },
      { header: this.t("dashboard.cce.excel.entity_id"), width: 20 },
      { header: this.t("dashboard.cce.excel.entity_name"), width: 30 },
      { header: this.t("dashboard.cce.excel.entity_type"), width: 20 },
      {
        header: this.t("dashboard.cce.excel.material_temperature_min"),
        width: 25,
      },
      {
        header: this.t("dashboard.cce.excel.material_temperature_max"),
        width: 25,
      },
      { header: this.t("dashboard.cce.excel.year"), width: 15 },
      { header: this.t("dashboard.cce.excel.entity_tag_id"), width: 20 },
      { header: this.t("dashboard.cce.excel.capacity_nett"), width: 25 },
      { header: this.t("dashboard.cce.excel.year_need_volume"), width: 30 },
      {
        header: this.t("dashboard.cce.excel.standard_distribution_interval"),
        width: 35,
      },
      { header: this.t("dashboard.cce.excel.year_need_interval"), width: 30 },
      {
        header: this.t("dashboard.cce.excel.percentage_capacity_interval"),
        width: 35,
      },
      {
        header: this.t("dashboard.cce.excel.calculated_distribution_interval"),
        width: 35,
      },
      {
        header: this.t("dashboard.cce.excel.category_distribution"),
        width: 30,
      },
    ])
    await this.addRows(
      title,
      this.data.map((row) => ({
        no: row.row_number,
        province: row.province_name,
        regency: row.regency_name,
        entity_id: row.entity_id,
        entity_name: row.entity_name,
        entity_type: row.entity_type,
        material_temperature_min: row.material_min_temp,
        material_temperature_max: row.material_max_temp,
        year: row.year,
        entity_tag_id: row.entity_tag_id,
        capacity_nett: row.capacity_nett,
        year_need_volume: row.year_need_volume,
        standard_distribution_interval: row.standard_distribution_interval,
        year_need_interval: row.year_need_interval,
        percentage_capacity_interval: row.percentage_capacity_interval,
        calculated_distribution_interval: row.calculated_distribution_interval,
        category_distribution: this.t(
          `dashboard.cce.excel.${row.category_distribution}`
        ),
      }))
    )

    return super.generate()
  }
}
