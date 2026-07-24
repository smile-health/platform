import { Context } from "hono"
import { execQuery } from "@/common/infrastructure/database/index.js"
import { ActiveRateQuery } from "./active-rate.query.js"
import {
  ActiveRateQueryParams,
  ActiveRateRawDTO,
  ActiveRateMonthlyDTO,
  ActiveRateRankingDTO,
  ActiveRateAvgDTO,
  ActiveRateLastUpdatedDTO,
} from "./active-rate.schema.js"
import moment from "moment"

export class ActiveRateRepository {
  constructor(private readonly query: ActiveRateQuery) {}

  async getLatestPeriod(c: Context): Promise<string> {
    const sql = this.query.getLatestPeriodQuery()
    const result = await execQuery<{ period: string }[]>(sql, {})
    return result[0]?.period ?? moment().format("YYYY-MM")
  }

  async getLatestWeeklyPeriod(c: Context): Promise<string> {
    const sql = this.query.getLatestWeeklyPeriodQuery()
    const result = await execQuery<{ period: string }[]>(sql, {})
    return result[0]?.period ?? moment().subtract(1, "week").format("YYYY-MM-DD")
  }

  async getLastUpdated(c: Context): Promise<string> {
    const sql = this.query.getLastUpdatedQuery()
    const result = await execQuery<ActiveRateLastUpdatedDTO[]>(sql, {})
    return result[0]?.last_updated ?? moment().format("YYYY-MM-DD HH:mm:ss")
  }

  async getMapData(
    c: Context,
    params: ActiveRateQueryParams,
    latestPeriod: string
  ): Promise<ActiveRateRawDTO[]> {
    const sql = this.query.getMapDataQuery(params, latestPeriod)
    const result = await execQuery<ActiveRateRawDTO[]>(sql, {})
    return result ?? []
  }

  async getMapDataWeekly(
    c: Context,
    params: ActiveRateQueryParams,
    startPeriod: string,
    endPeriod: string
  ): Promise<ActiveRateRawDTO[]> {
    const sql = this.query.getMapDataWeeklyQuery(params, startPeriod, endPeriod)
    const result = await execQuery<ActiveRateRawDTO[]>(sql, {})
    return result ?? []
  }

  async getAvg(
    c: Context,
    params: ActiveRateQueryParams,
    latestPeriod: string
  ): Promise<ActiveRateAvgDTO> {
    const sql = this.query.getAvgQuery(params, latestPeriod)
    const result = await execQuery<ActiveRateAvgDTO[]>(sql, {})
    return result[0] ?? { total_active: 0, total_registered: 0 }
  }

  async getAvailablePeriods(c: Context): Promise<string[]> {
    const sql = this.query.getAvailablePeriodsQuery()
    const result = await execQuery<{ period: string }[]>(sql, {})
    return (result ?? []).map((r) => r.period).reverse()
  }

  async getMonthlyComparison(
    c: Context,
    params: ActiveRateQueryParams,
    periods: string[]
  ): Promise<ActiveRateMonthlyDTO[]> {
    if (periods.length === 0) return []
    const sql = this.query.getMonthlyComparisonQuery(params, periods)
    const result = await execQuery<ActiveRateMonthlyDTO[]>(sql, {})
    return result ?? []
  }

  async getRankingByProvince(
    c: Context,
    params: ActiveRateQueryParams,
    latestPeriod: string
  ): Promise<ActiveRateRankingDTO[]> {
    const sql = this.query.getRankingByProvinceQuery(params, latestPeriod)
    const result = await execQuery<ActiveRateRankingDTO[]>(sql, {})
    return result ?? []
  }
}
