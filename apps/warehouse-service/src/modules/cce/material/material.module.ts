import { Context } from "hono"
import { MaterialAggregateCapacityRemainingExcel } from "../excel/material-aggregate-capacity-remaining.excel.js"
import { MaterialCapacityRemainingExcel } from "../excel/material-capacity-remaining.excel.js"
import { MaterialFunctionStatusExcel } from "../excel/material-function-status.excel.js"
import { MaterialRepository } from "./material.repository.js"
import { MaterialQueryParams } from "./material.schema.js"

const CCE_MATERIAL_COLOR_CODE: Record<number, string> = {
  1: "#4caf50",
  2: "#2196f3",
  3: "#ff9800",
  4: "#e91e63",
  5: "#9c27b0",
  6: "#00bcd4",
  7: "#795548",
  8: "#607d8b",
  9: "#f44336",
  10: "#3f51b5",
}
const DEFAULT_COLOR = "#a9a9a9"

const rounding = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100

const calculatePercentage = (value: number, total: number) => {
  if (!total || total === 0) return 0
  return (value / total) * 100
}

export class MaterialModule {
  constructor(private readonly repository: MaterialRepository) {}

  async getMaterialReport(c: Context, queryParams: MaterialQueryParams) {
    const [
      srcFunctionalStatus,
      srcCapacityRemaining,
      srcMaterialFunctionalCapacity,
      lastUpdatedCm,
      lastUpdatedC,
    ] = await Promise.all([
      this.repository.fetchFunctionalStatus(c, queryParams),
      this.repository.fetchCapacityRemaining(c, queryParams),
      this.repository.fetchMaterialFunctionalCapacity(c, queryParams),
      this.repository.fetchLastUpdated("dim_coldstorage_materials"),
      this.repository.fetchLastUpdated("dim_coldstorages"),
    ])

    const functionalStatuses = this.mapFunctionalStatus(srcFunctionalStatus)

    const capacityRemaining = this.mapCapacityRemaining(srcCapacityRemaining)

    const aggregateRemainingCapacity = this.mapAggregateRemainingCapacity(
      srcMaterialFunctionalCapacity
    )

    return {
      function_status: {
        data: functionalStatuses,
        last_updated: lastUpdatedC,
      },
      capacity_remaining: {
        data: capacityRemaining,
        last_updated: lastUpdatedC,
      },
      aggregate_capacity_remaining: {
        ...aggregateRemainingCapacity,
        last_updated: lastUpdatedCm,
      },
    }
  }

  private mapFunctionalStatus(srcFunctionalStatus: any[]) {
    return srcFunctionalStatus.map((fs: any) => {
      const totalCount = Number(fs.total_count) || 0

      return {
        type_id: fs.type_id,
        type_name: fs.type_name,
        temp_min: fs.temp_min,
        temp_max: fs.temp_max,
        total_well_functioning: fs.total_well_functioning,
        total_well_functioning_percentage: rounding(
          calculatePercentage(fs.total_well_functioning, totalCount)
        ),
        total_standby: fs.total_standby,
        total_standby_percentage: rounding(
          calculatePercentage(fs.total_standby, totalCount)
        ),
        total_commisioning_issue: fs.total_commisioning_issue,
        total_commisioning_issue_percentage: rounding(
          calculatePercentage(fs.total_commisioning_issue, totalCount)
        ),
        total_not_functioning: fs.total_not_functioning,
        total_not_functioning_percentage: rounding(
          calculatePercentage(fs.total_not_functioning, totalCount)
        ),
        total_functioning_need_repair: fs.total_functioning_need_repair,
        total_functioning_need_repair_percentage: rounding(
          calculatePercentage(fs.total_functioning_need_repair, totalCount)
        ),
        total_count: totalCount,
      }
    })
  }

  private mapCapacityRemaining(srcCapacityRemaining: any[]) {
    return srcCapacityRemaining.map((item: any) => ({
      min_temperature: item.min_temperature,
      max_temperature: item.max_temperature,
      total_volume_asset: item.total_volume_asset,
      volume_material: item.volume_material,
      remaining_volume: item.remaining_volume,
      usage_percentage: item.usage_percentage,
      remaining_percentage: item.remaining_percentage,
    }))
  }

  private mapAggregateRemainingCapacity(srcMaterialFunctionalCapacity: any[]) {
    const totalVolume = srcMaterialFunctionalCapacity.reduce(
      (sum: number, m: any) => sum + (m.volume_material || 0),
      0
    )
    const totalDosage = srcMaterialFunctionalCapacity.reduce(
      (sum: number, m: any) => sum + (m.dosage_material || 0),
      0
    )

    const materials = srcMaterialFunctionalCapacity
      .map((material: any) => {
        const volumeMaterialPercentage = calculatePercentage(
          material.volume_material,
          totalVolume
        )
        const color =
          CCE_MATERIAL_COLOR_CODE[material.material_id] || DEFAULT_COLOR

        return {
          material_id: material.material_id,
          material_name: material.material_name,
          temperature_threshold_id: material.temperature_threshold_id,
          volume_material: material.volume_material,
          dosage_material: material.dosage_material,
          color,
          volume_material_percentage: rounding(volumeMaterialPercentage),
        }
      })

    return {
      materials,
      total: {
        volume: rounding(totalVolume),
        dosage: rounding(totalDosage),
      },
    }
  }

  async exportFunctionStatus(c: Context, data: any[]) {
    const template = new MaterialFunctionStatusExcel(data)
    template.setLanguage(c.var.language)
    template.setTimezone(c.var.timezone)
    return template.generate()
  }

  async exportCapacityRemaining(c: Context, data: any[]) {
    const template = new MaterialCapacityRemainingExcel(data)
    template.setLanguage(c.var.language)
    template.setTimezone(c.var.timezone)
    return template.generate()
  }

  async exportAggregateCapacityRemaining(c: Context, data: any) {
    const template = new MaterialAggregateCapacityRemainingExcel(data)
    template.setLanguage(c.var.language)
    template.setTimezone(c.var.timezone)
    return template.generate()
  }
}
