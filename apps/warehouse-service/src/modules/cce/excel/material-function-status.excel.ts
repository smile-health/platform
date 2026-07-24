/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseTemplate from "@smile-health/lib/excel/index.js"
import { PROCESSOR } from "@smile-health/lib/excel/types.js"
import { FileResponse } from "@smile-health/lib/types/file.js"

export class MaterialFunctionStatusExcel extends BaseTemplate {
  constructor(private data: object[]) {
    super(14, 1, PROCESSOR.XLSXPOPULATE)
  }

  async generate(): Promise<FileResponse> {
    const title = this.t("dashboard.cce.excel.material_function_status")
    this.setTitle(title)
    await this.initSheet(title)

    this.setColumns([
      { header: this.t("dashboard.cce.excel.type_id"), width: 20 },
      { header: this.t("dashboard.cce.excel.type_name"), width: 25 },
      { header: this.t("dashboard.cce.excel.temp_min"), width: 15 },
      { header: this.t("dashboard.cce.excel.temp_max"), width: 15 },
      { header: this.t("dashboard.cce.excel.total_well_functioning"), width: 25 },
      { header: this.t("dashboard.cce.excel.total_well_functioning_percentage"), width: 30 },
      { header: this.t("dashboard.cce.excel.total_standby"), width: 20 },
      { header: this.t("dashboard.cce.excel.total_standby_percentage"), width: 25 },
      { header: this.t("dashboard.cce.excel.total_commisioning_issue"), width: 30 },
      { header: this.t("dashboard.cce.excel.total_commisioning_issue_percentage"), width: 35 },
      { header: this.t("dashboard.cce.excel.total_not_functioning"), width: 25 },
      { header: this.t("dashboard.cce.excel.total_not_functioning_percentage"), width: 30 },
      { header: this.t("dashboard.cce.excel.total_functioning_need_repair"), width: 30 },
      { header: this.t("dashboard.cce.excel.total_functioning_need_repair_percentage"), width: 35 },
      { header: this.t("dashboard.cce.excel.total_count"), width: 20 }
    ])
    await this.addRows(title, this.data)

    return super.generate()
  }
}