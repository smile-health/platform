/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseTemplate from "@smile-health/lib/excel/index.js"
import { PROCESSOR } from "@smile-health/lib/excel/types.js"
import { FileResponse } from "@smile-health/lib/types/file.js"

export class MaterialAggregateCapacityRemainingExcel extends BaseTemplate {
  constructor(private data: any) {
    super(14, 1, PROCESSOR.XLSXPOPULATE)
  }

  async generate(): Promise<FileResponse> {
    const title = this.t(
      "dashboard.cce.excel.material_aggregate_capacity_remaining"
    )
    this.setTitle(title)

    await this.initSheet(title)
    this.setColumns([
      { header: this.t("dashboard.cce.excel.material_id"), width: 20 },
      { header: this.t("dashboard.cce.excel.material_name"), width: 30 },
      { header: this.t("dashboard.cce.excel.volume_material"), width: 25 },
      { header: this.t("dashboard.cce.excel.dosage_material"), width: 25 },
      {
        header: this.t("dashboard.cce.excel.volume_material_percentage"),
        width: 30,
      },
    ])

    if (this.data.materials && this.data.materials.length > 0)
      await this.addRows(title, this.data.materials.map((material: any) => {
        return {
          material_id: material.material_id,
          material_name: material.material_name,
          volume_material: material.volume_material,
          dosage_material: material.dosage_material,
          volume_material_percentage: material.volume_material_percentage,
        }
      }))

    return super.generate()
  }
}
