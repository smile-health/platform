/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseTemplate from "@smile/lib/excel/index.js"
import { PROCESSOR } from "@smile/lib/excel/types.js"
import { FileResponse } from "@smile/lib/types/file.js"

export class EntityByColdstorageStatusCapacityExcel extends BaseTemplate {
  constructor(private data: object[]) {
    super(14, 1, PROCESSOR.XLSXPOPULATE)
  }

  async generate(): Promise<FileResponse> {
    const title = this.t("dashboard.cce.excel.entity_by_capacity_status")
    this.setTitle(title)
    await this.initSheet(title)

    this.setColumns([
      { header: this.t("dashboard.cce.excel.id_entitas"), width: 20 },
      { header: this.t("dashboard.cce.excel.entitas"), width: 20 },
      { header: this.t("dashboard.cce.excel.volume_material"), width: 25 },
      { header: this.t("dashboard.cce.excel.volume_asset"), width: 25 },
      { header: this.t("dashboard.cce.excel.persentase_kapasitas"), width: 25 },
    ])
    await this.addRows(title, this.data)

    return super.generate()
  }
}
