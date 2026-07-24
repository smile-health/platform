import { Context } from "hono"
import { WasteGeneratedRepository } from "./waste-generated.repository.js"
import { WasteGeneratedFilters } from "./waste-generated.query.js"
import {
  WasteGeneratedQueryParams,
  WasteGeneratedResponse,
} from "./waste-generated.schema.js"
import {
  buildMapsData,
  buildOverviewData,
  buildMonthlyComparisonData,
  buildRankingData,
} from "./waste-generated.util.js"

export class WasteGeneratedModule {
  constructor(private readonly repository: WasteGeneratedRepository) {}

  async getWasteGeneratedData(
    c: Context,
    queryParams: WasteGeneratedQueryParams
  ): Promise<WasteGeneratedResponse> {
    const { unit = "kg", province_id, waste_group_id, waste_type_id, waste_characteristics_id } = queryParams

    // Build filters object
    const filters: WasteGeneratedFilters = {
      provinceId: province_id,
      wasteGroupId: waste_group_id,
      wasteTypeId: waste_type_id,
      wasteCharacteristicsId: waste_characteristics_id,
    }

    // Fetch all required data in parallel
    const [
      inventoryData,
      healthFacilityCount,
      yesterdayData,
      todayData,
      last12MonthsData,
      lastUpdated,
      lastAvailableMonth,
      mostWasteData,
      lowestWasteData,
    ] = await Promise.all([
      this.repository.fetchInventoryData(c, filters),
      this.repository.fetchHealthFacilityCount(c, filters),
      this.repository.fetchYesterdayData(c, filters),
      this.repository.fetchTodayData(c, filters),
      this.repository.fetchLast12MonthsData(c, filters),
      this.repository.getLastUpdate(c),
      this.repository.fetchLastAvailableMonth(c),
      this.repository.fetchMostWaste(c, filters),
      this.repository.fetchLowestWaste(c, filters),
    ])

    // Build response sections
    const maps = buildMapsData(
      c,
      inventoryData,
      healthFacilityCount,
      province_id,
      unit
    )
    const overview = buildOverviewData(
      inventoryData,
      todayData,
      yesterdayData,
      unit
    )
    const monthlyComparison = buildMonthlyComparisonData(
      last12MonthsData,
      unit
    )
    const mostWaste = buildRankingData(
      mostWasteData,
      lastAvailableMonth,
      unit
    )
    const lowestWaste = buildRankingData(
      lowestWasteData,
      lastAvailableMonth,
      unit
    )

    return {
      last_updated: lastUpdated,
      data: {
        maps,
        overview,
        monthly_comparison: monthlyComparison,
        most_waste: mostWaste,
        lowest_waste: lowestWaste,
      },
    }
  }
}
