import { Column } from "@smile-health/lib/excel/types.js"
import WarehouseTemplate from "@smile-health/lib/excel/warehouse-template.js"
import i18n from "@smile-health/lib/i18n.js"
import { Context } from "hono"
import { MaterialExcelRow } from "./commitment.schema.js"

export class CommitmentMonitoringExcel {
  private toPositiveNumberOrZero(value: number | null | undefined): number {
    const numericValue = Number(value ?? 0)
    return numericValue > 0 ? numericValue : 0
  }

  async generateExcel(
    c: Context,
    materialRows: MaterialExcelRow[],
    provinceData: Array<{
      province_id: number
      province_name: string
      material_name: string
      contract_number: string
      total_yearly_need: number | null
      total_commitment_reguler_dose: number
      total_used_buffer_dose: number
      total_used_reguler_dose: number
      total_unused_reguler_dose: number
    }>
  ) {
    // Force i18n to switch to the correct language before generating translations
    await i18n.changeLanguage(c.var.language)

    const template = new WarehouseTemplate()
    template.setLanguage(c.var.language)
    template.setTimezone(c.req.header("Timezone"))
    await template.initWorkbook()

    const sheet1Name = c.var.t(
      "dashboard.commitment_monitoring.sheet.commitment_monitoring"
    )
    const sheet2Name = c.var.t(
      "dashboard.commitment_monitoring.sheet.province_data"
    )

    await this.buildMaterialSheet(c, template, sheet1Name, materialRows)
    await this.buildProvinceSheet(c, template, sheet2Name, provinceData)

    template.setTitle(sheet1Name)

    return await template.generate()
  }

  private async buildMaterialSheet(
    c: Context,
    template: WarehouseTemplate,
    sheetName: string,
    rows: MaterialExcelRow[]
  ) {
    const columns: Column[] = [
      { key: "no", header: "No.", width: 5 },
      {
        key: "material_name",
        header: c.var.t("dashboard.commitment_monitoring.excel.material_name"),
        width: 40,
      },
      {
        key: "contract_number",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.contract_number"
        ),
        width: 40,
      },
      {
        key: "contract_year",
        header: c.var.t("dashboard.commitment_monitoring.excel.contract_year"),
        width: 15,
      },
      {
        key: "realization_year",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.realization_year"
        ),
        width: 15,
      },
      {
        key: "total_commitment",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.stock_on_contract"
        ),
        width: 25,
      },
      {
        key: "total_used_reguler_dose",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.allocation_sent_dose"
        ),
        width: 30,
      },
      {
        key: "total_used_reguler_vial",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.allocation_sent_vial"
        ),
        width: 30,
      },
      {
        key: "total_used_buffer_dose",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.buffer_sent_dose"
        ),
        width: 30,
      },
      {
        key: "total_used_buffer_vial",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.buffer_sent_vial"
        ),
        width: 30,
      },
      {
        key: "total_unused_reguler_dose",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.allocation_not_sent_dose"
        ),
        width: 35,
      },
      {
        key: "total_unused_reguler_vial",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.allocation_not_sent_vial"
        ),
        width: 35,
      },
      {
        key: "total_unused_buffer_dose",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.buffer_not_sent_dose"
        ),
        width: 35,
      },
      {
        key: "total_unused_buffer_vial",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.buffer_not_sent_vial"
        ),
        width: 35,
      },
    ]

    template.initSheet(sheetName)
    template.setColumns(columns, undefined, sheetName)

    const data = rows.map((row, index) => {
      const totalCommitment =
        Number(row.total_commitment_reguler_dose ?? 0) +
        Number(row.total_commitment_buffer_dose ?? 0) +
        Number(row.total_commitment_reguler_vial ?? 0) +
        Number(row.total_commitment_buffer_vial ?? 0)

      return {
        no: index + 1,
        material_name: row.material_name,
        contract_number: row.contract_number || "",
        contract_year: row.commitment_year || "",
        realization_year: row.realization_year || "",
        total_commitment: totalCommitment,
        total_used_reguler_dose: Number(row.total_used_reguler_dose ?? 0),
        total_used_reguler_vial: Number(row.total_used_reguler_vial ?? 0),
        total_used_buffer_dose: Number(row.total_used_buffer_dose ?? 0),
        total_used_buffer_vial: Number(row.total_used_buffer_vial ?? 0),
        total_unused_reguler_dose: this.toPositiveNumberOrZero(
          row.total_unused_reguler_dose
        ),
        total_unused_reguler_vial: this.toPositiveNumberOrZero(
          row.total_unused_reguler_vial
        ),
        total_unused_buffer_dose: Number(row.total_unused_buffer_dose ?? 0),
        total_unused_buffer_vial: Number(row.total_unused_buffer_vial ?? 0),
      }
    })

    await template.addRows(sheetName, data)
  }

  private async buildProvinceSheet(
    c: Context,
    template: WarehouseTemplate,
    sheetName: string,
    rows: Array<{
      province_id: number
      province_name: string
      material_name: string
      contract_number: string
      total_yearly_need: number | null
      total_commitment_reguler_dose: number
      total_used_buffer_dose: number
      total_used_reguler_dose: number
      total_unused_reguler_dose: number
    }>
  ) {
    const columns: Column[] = [
      { key: "no", header: "No.", width: 5 },
      {
        key: "province_name",
        header: c.var.t("dashboard.commitment_monitoring.excel.province"),
        width: 40,
      },
      {
        key: "material_name",
        header: c.var.t("dashboard.commitment_monitoring.excel.material"),
        width: 40,
      },
      {
        key: "contract_number",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.contract_number"
        ),
        width: 40,
      },
      {
        key: "total_yearly_need",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.total_annual_need"
        ),
        width: 25,
      },
      {
        key: "total_commitment",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.total_commitment"
        ),
        width: 25,
      },
      {
        key: "total_used_buffer_dose",
        header: c.var.t("dashboard.commitment_monitoring.excel.buffer_receipt"),
        width: 25,
      },
      {
        key: "total_used_reguler_dose",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.allocation_sent"
        ),
        width: 25,
      },
      {
        key: "total_unused_reguler_dose",
        header: c.var.t(
          "dashboard.commitment_monitoring.excel.allocation_not_sent"
        ),
        width: 25,
      },
    ]

    template.initSheet(sheetName)
    template.setColumns(columns, undefined, sheetName)

    const data = rows.map((row, index) => ({
      no: index + 1,
      province_name: row.province_name,
      material_name: row.material_name,
      contract_number: row.contract_number || "",
      total_yearly_need: Number(row.total_yearly_need ?? 0),
      total_commitment: Number(row.total_commitment_reguler_dose ?? 0),
      total_used_buffer_dose: Number(row.total_used_buffer_dose ?? 0),
      total_used_reguler_dose: Number(row.total_used_reguler_dose ?? 0),
      total_unused_reguler_dose: this.toPositiveNumberOrZero(
        row.total_unused_reguler_dose
      ),
    }))

    await template.addRows(sheetName, data)
  }
}
