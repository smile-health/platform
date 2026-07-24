import { Context } from "hono"
import { AnnualRepository } from "./annual.repository.js"
import { AnnualQueryParams } from "./annual.schema.js"
import { AnnualFacilityTotalExcel } from "../excel/annual-facility-total.excel.js"
import { AnnualFacilityPercentageExcel } from "../excel/annual-facility-percentage.excel.js"

const rounding = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100

const calculatePercentage = (value: number, total: number) => {
  if (total === 0) return 0
  return (value / total) * 100
}

export class AnnualModule {
  constructor(private readonly repository: AnnualRepository) {}

  async getAnnualDashboardData(c: Context, queryParams: AnnualQueryParams) {
    const [
      annualNeedEntity,
      annualNeedMaterial,
      annualNeedTemp,
      annualAchievementNeed,
      lastUpdatedEntity,
      lastUpdatedTemp,
      lastUpdatedMaterial,
      lastUpdatedAchievement
    ] = await Promise.all([
      this.repository.fetchAnnualNeedEntity(c, queryParams),
      this.repository.fetchAnnualNeedMaterial(c, queryParams),
      this.repository.fetchAnnualNeedTemperature(c, queryParams),
      this.repository.fetchAnnualAchievementNeed(c, queryParams),
      this.repository.fetchLastUpdated('dim_annual_need_entity'),
      this.repository.fetchLastUpdated('dim_annual_coldstorage_per_temp'),
      this.repository.fetchLastUpdated('dim_annual_need_material'),
      this.repository.fetchLastUpdated('dim_annual_achievement_need')
    ])

    const facilityTotal = this.mapFacilityTotal(annualNeedEntity, lastUpdatedEntity)
    const facilityPercentage = this.mapFacilityPercentage(
      annualNeedTemp
    )
    const annualTargetAchievement = this.mapAnnualNeedAchievement(
      annualNeedMaterial,
      annualAchievementNeed,
      lastUpdatedMaterial,
      lastUpdatedAchievement
    )

    return {
      facility_total: facilityTotal,
      facility_percentage: {
        data: facilityPercentage,
        last_update: lastUpdatedTemp
      },
      annual_target_achievement: annualTargetAchievement,
    }
  }

  private mapFacilityTotal(aggregatedNeedEntity: any[], createdAt: string | null) {
    let above = 0
    let ideal = 0
    let below = 0
    
    aggregatedNeedEntity.forEach((item) => {
      const category = item.category_distribution
      const count = Number(item.count)
      if (category === "above") above += count
      else if (category === "ideal") ideal += count
      else if (category === "below") below += count
    })

    const total = above + ideal + below

    return {
      above_interval: above,
      above_interval_percentage: rounding(calculatePercentage(above, total)),
      ideal_interval: ideal,
      ideal_interval_percentage: rounding(calculatePercentage(ideal, total)),
      below_interval: below,
      below_interval_percentage: rounding(calculatePercentage(below, total)),
      last_update: createdAt
    }
  }

  private mapFacilityPercentage(
    aggregatedNeedTemp: any[]
  ) {
    const uniqueTemps = new Set<string>()
    aggregatedNeedTemp.forEach((item) => {
      if (
        item.material_min_temp !== null &&
        item.material_max_temp !== null
      ) {
        uniqueTemps.add(
          `${item.material_min_temp}_${item.material_max_temp}`
        )
      }
    })

    const temperatures = Array.from(uniqueTemps).map((tempKey, index) => {
      const [minStr, maxStr] = tempKey.split("_")
      const min = parseFloat(minStr ?? "")
      const max = parseFloat(maxStr ?? "")

      const filteredByTemp = aggregatedNeedTemp.filter(
        (item) =>
          item.material_min_temp === min &&
          item.material_max_temp === max
      )

      let above = 0
      let ideal = 0
      let below = 0

      filteredByTemp.forEach((item) => {
        const category = item.category_distribution
        const count = Number(item.count)
        if (category === "above") above += count
        else if (category === "ideal") ideal += count
        else if (category === "below") below += count
      })
      
      const totalInterval = below + ideal + above

      return {
        id: index + 1,
        material_temperature_min: String(min),
        material_temperature_max: String(max),
        below_interval: below,
        below_interval_percentage: rounding(calculatePercentage(below, totalInterval)),
        ideal_interval: ideal,
        ideal_interval_percentage: rounding(calculatePercentage(ideal, totalInterval)),
        above_interval: above,
        above_interval_percentage: rounding(calculatePercentage(above, totalInterval)),
      }
    })

    return temperatures
  }

  private mapAnnualNeedAchievement(
    aggregatedNeedMaterial: any[],
    aggregatedAchievementNeed: any[],
    createdAtNeed: string | null,
    createdAtAch: string | null
  ) {
    const totalAnnualNeed = aggregatedNeedMaterial.reduce(
      (sum, item) => sum + (item.total_year_need_volume || 0),
      0
    )
    
    const totalAnnualAchievement = aggregatedAchievementNeed[0]?.total_year_achievement_volume || 0

    const dates = [createdAtNeed, createdAtAch].filter((d): d is string => d !== null && d !== undefined).sort((a, b) => a.localeCompare(b)).reverse()
    const createdAt = dates[0] || null

    return {
      need: totalAnnualNeed,
      achievement: totalAnnualAchievement,
      last_update: createdAt
    }
  }

  async exportFacilityTotal(c: Context, queryParams: AnnualQueryParams) {
    const data = await this.repository.fetchAnnualNeedEntityExport(c, queryParams)
    const template = new AnnualFacilityTotalExcel(data)
    template.setLanguage(c.var.language)
    template.setTimezone(c.var.timezone)
    return template.generate()
  }

  async exportFacilityPercentage(c: Context, queryParams: AnnualQueryParams) {
    const data = await this.repository.fetchAnnualNeedTemperatureExport(c, queryParams)
    const template = new AnnualFacilityPercentageExcel(data)
    template.setLanguage(c.var.language)
    template.setTimezone(c.var.timezone)
    return template.generate()
  }
}
