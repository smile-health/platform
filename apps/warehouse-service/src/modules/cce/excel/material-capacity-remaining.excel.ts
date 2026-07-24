/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseTemplate from "@smile-health/lib/excel/index.js"
import { PROCESSOR } from "@smile-health/lib/excel/types.js"
import { FileResponse } from "@smile-health/lib/types/file.js"

export class MaterialCapacityRemainingExcel extends BaseTemplate {
  constructor(private data: object[]) {
    super(14, 1, PROCESSOR.XLSXPOPULATE)
  }

  async generate(): Promise<FileResponse> {
    const title = this.t("dashboard.cce.excel.material_capacity_remaining")
    this.setTitle(title)
    await this.initSheet(title)

    this.setColumns([
      { header: this.t("dashboard.cce.excel.temp_min"), width: 15 },
      { header: this.t("dashboard.cce.excel.temp_max"), width: 15 },
      { header: this.t("dashboard.cce.excel.volume_total"), width: 20 },
      { header: this.t("dashboard.cce.excel.volume_material"), width: 20 },
      { header: this.t("dashboard.cce.excel.volume_remaining"), width: 20 },
      {
        header: this.t("dashboard.cce.excel.volume_material_percentage"),
        width: 25,
      },
      {
        header: this.t("dashboard.cce.excel.volume_remaining_percentage"),
        width: 25,
      },
    ])
    await this.addRows(title, this.data)

    return super.generate()
  }
}
