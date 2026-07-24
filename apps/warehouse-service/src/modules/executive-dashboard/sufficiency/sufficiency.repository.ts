import { Context } from "hono"
import { execQuery } from "@/common/infrastructure/database/index.js"
import { ExecutiveDashboardSufficiencyQuery } from "./sufficiency.query.js"
import {
  SufficiencyQueryParams,
  SufficiencyMapsResult,
  SufficiencyOverviewResult,
  SufficiencyMonthlyComparisonResult,
  SufficiencyTop10MaterialsResult,
  SufficiencyStockResult,
  SufficiencyExportDataResult,
  SufficiencyLastUpdateResult,
} from "./sufficiency.schema.js"

export class ExecutiveDashboardSufficiencyRepository {
  constructor(private readonly query: ExecutiveDashboardSufficiencyQuery) {}

  async fetchStockSufficiencyMapsData(
    c: Context,
    queryParams: SufficiencyQueryParams
  ): Promise<SufficiencyMapsResult> {
    const query = this.query.getStockSufficiencyMapsQuery(c, queryParams)
    const result = await execQuery<SufficiencyMapsResult>(query, queryParams)
    return result
  }

  async fetchStockSufficiencyOverview(
    c: Context,
    queryParams: SufficiencyQueryParams
  ): Promise<SufficiencyOverviewResult> {
    const query = this.query.getStockSufficiencyOverviewQuery(c, queryParams)
    const result = await execQuery<SufficiencyOverviewResult>(
      query,
      queryParams
    )
    return result
  }

  async fetchStockSufficiencyCriticalOverview(
    c: Context,
    queryParams: SufficiencyQueryParams
  ): Promise<SufficiencyOverviewResult> {
    const query = this.query.getStockSufficiencyCriticalOverviewQuery(
      c,
      queryParams
    )
    const result = await execQuery<SufficiencyOverviewResult>(
      query,
      queryParams
    )
    return result
  }

  async fetchStockSufficiencyMonthlyComparison(
    c: Context,
    queryParams: SufficiencyQueryParams
  ): Promise<SufficiencyMonthlyComparisonResult> {
    const query = this.query.getStockSufficiencyMonthlyComparisonQuery(
      c,
      queryParams
    )
    const result = await execQuery<SufficiencyMonthlyComparisonResult>(
      query,
      queryParams
    )
    return result
  }

  async fetchStockSufficiencyTop10Materials(
    c: Context,
    queryParams: SufficiencyQueryParams
  ): Promise<SufficiencyTop10MaterialsResult> {
    const query = this.query.getStockSufficiencyTop10MaterialsQuery(
      c,
      queryParams
    )
    const result = await execQuery<SufficiencyTop10MaterialsResult>(
      query,
      queryParams
    )
    return result
  }

  async fetchStockOutData(
    c: Context,
    queryParams: SufficiencyQueryParams
  ): Promise<SufficiencyStockResult> {
    const query = this.query.getStockOutRateQuery(c, queryParams)
    const result = await execQuery<SufficiencyStockResult>(query, queryParams)
    return result
  }

  async fetchStockMaxData(
    c: Context,
    queryParams: SufficiencyQueryParams
  ): Promise<SufficiencyStockResult> {
    const query = this.query.getStockMaxRateQuery(c, queryParams)
    const result = await execQuery<SufficiencyStockResult>(query, queryParams)
    return result
  }

  async fetchStockSufficiencyExportData(
    c: Context,
    queryParams: SufficiencyQueryParams
  ): Promise<SufficiencyExportDataResult> {
    const query = this.query.getStockSufficiencyExportQuery(c, queryParams)
    const result = await execQuery<SufficiencyExportDataResult>(
      query,
      queryParams
    )
    return result
  }

  async getLastUpdate(c: Context, tableName: string): Promise<string> {
    const query = this.query.getLastUpdateQuery(tableName)
    const result = await execQuery<SufficiencyLastUpdateResult>(query, {})
    return result?.[0]?.last_update || ""
  }
}
