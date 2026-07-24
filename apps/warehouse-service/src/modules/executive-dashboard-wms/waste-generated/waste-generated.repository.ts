import { Context } from "hono"
import { execQuery } from "@/common/infrastructure/database/index.js"
import { WasteGeneratedQuery, WasteGeneratedFilters } from "./waste-generated.query.js"
import {
  WasteInventoryDTO,
  HealthFacilityCountDTO,
  YesterdayComparisonDTO,
  MonthlyDataDTO,
  RankingDataDTO,
  LastAvailableMonthDTO,
} from "./waste-generated.schema.js"
import moment from "moment"

export class WasteGeneratedRepository {
  constructor(private readonly query: WasteGeneratedQuery) {}

  async fetchInventoryData(
    c: Context,
    filters: WasteGeneratedFilters = {}
  ): Promise<WasteInventoryDTO[]> {
    const query = this.query.getInventoryDataQuery(filters)
    const result = await execQuery<WasteInventoryDTO[]>(query, {})
    return result
  }

  async fetchHealthFacilityCount(
    c: Context,
    filters: WasteGeneratedFilters = {}
  ): Promise<HealthFacilityCountDTO[]> {
    const query = this.query.getHealthFacilityCountQuery(filters)
    const result = await execQuery<HealthFacilityCountDTO[]>(query, {})
    return result
  }

  async fetchYesterdayData(
    c: Context,
    filters: WasteGeneratedFilters = {}
  ): Promise<YesterdayComparisonDTO> {
    const query = this.query.getYesterdayDataQuery(filters)
    const result = await execQuery<YesterdayComparisonDTO[]>(query, {})
    return (
      result[0] || {
        waste_bag_count: 0,
        total_waste_weight: 0,
      }
    )
  }

  async fetchTodayData(
    c: Context,
    filters: WasteGeneratedFilters = {}
  ): Promise<YesterdayComparisonDTO> {
    const query = this.query.getTodayDataQuery(filters)
    const result = await execQuery<YesterdayComparisonDTO[]>(query, {})
    return (
      result[0] || {
        waste_bag_count: 0,
        total_waste_weight: 0,
      }
    )
  }

  async fetchLast12MonthsData(
    c: Context,
    filters: WasteGeneratedFilters = {}
  ): Promise<MonthlyDataDTO[]> {
    const query = this.query.getLast12MonthsDataQuery(filters)
    const result = await execQuery<MonthlyDataDTO[]>(query, {})
    return result
  }

  async getLastUpdate(c: Context): Promise<string> {
    const query = this.query.getLastUpdateQuery()
    const result = await execQuery<{ last_updated: string }[]>(query, {})

    if (result[0]?.last_updated) {
      return result[0].last_updated
    }

    return moment().format("YYYY-MM-DD HH:mm:ss")
  }

  async fetchLastAvailableMonth(c: Context): Promise<LastAvailableMonthDTO | null> {
    const query = this.query.getLastAvailableMonthQuery()
    const result = await execQuery<LastAvailableMonthDTO[]>(query, {})
    return result[0] || null
  }

  async fetchMostWaste(
    c: Context,
    filters: WasteGeneratedFilters = {}
  ): Promise<RankingDataDTO[]> {
    const query = this.query.getMostWasteQuery(filters)
    const result = await execQuery<RankingDataDTO[]>(query, {})
    return result
  }

  async fetchLowestWaste(
    c: Context,
    filters: WasteGeneratedFilters = {}
  ): Promise<RankingDataDTO[]> {
    const query = this.query.getLowestWasteQuery(filters)
    const result = await execQuery<RankingDataDTO[]>(query, {})
    return result
  }
}
