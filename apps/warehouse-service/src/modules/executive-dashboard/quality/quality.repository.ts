import { Context } from "hono"
import { execQuery } from "@/common/infrastructure/database/index.js"
import { ExecutiveDashboardQualityQuery } from "./quality.query.js"
import {
  StockTakingMapsDataDTO,
  StockTakingOverviewDataDTO,
  StockTakingMonthlyDataDTO,
  StockTakingRankingDataDTO,
  StockDiscardMapsDataDTO,
  StockDiscardTotalDataDTO,
  StockDiscardPendingTotalDataDTO,
  StockDiscardMonthlyDataDTO,
  StockDiscardPendingDataDTO,
  StockDiscardTop10DataDTO,
  AssetMapsDataDTO,
  AssetOverviewDataDTO,
  AssetTotalDataDTO,
  AssetOverdueDataDTO,
  QualityQueryParams,
  AssetDistinctMapsDataDTO,
} from "./quality.schema.js"
import moment from "moment"

export class ExecutiveDashboardQualityRepository {
  constructor(private readonly query: ExecutiveDashboardQualityQuery) {}

  // Stock Taking Repository Methods
  async fetchStockTakingMapsData(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<StockTakingMapsDataDTO[]> {
    const query = this.query.getStockTakingMapsQuery(c, queryParam)

    const result = await execQuery<StockTakingMapsDataDTO[]>(query, queryParam)
    return result
  }

  async fetchStockTakingOverview(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<StockTakingOverviewDataDTO | null> {
    const query = this.query.getStockTakingOverviewQuery(c, queryParam)

    const result = await execQuery<StockTakingOverviewDataDTO[]>(
      query,
      queryParam
    )
    return result[0] || null
  }

  async fetchStockTakingMonthlyComparison(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<StockTakingMonthlyDataDTO[]> {
    const query = this.query.getStockTakingMonthlyComparisonQuery(c, queryParam)

    const result = await execQuery<StockTakingMonthlyDataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  async fetchStockTakingHighest(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<StockTakingRankingDataDTO[]> {
    const query = this.query.getStockTakingHighestQuery(c, queryParam)

    const result = await execQuery<StockTakingRankingDataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  async fetchStockTakingLowest(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<StockTakingRankingDataDTO[]> {
    const query = this.query.getStockTakingLowestQuery(c, queryParam)

    const result = await execQuery<StockTakingRankingDataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  // Stock Discard Repository Methods
  async fetchStockDiscardMapsData(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<StockDiscardMapsDataDTO[]> {
    const query = this.query.getStockDiscardMapsQuery(c, queryParam)

    const result = await execQuery<StockDiscardMapsDataDTO[]>(query, queryParam)
    return result
  }

  async fetchStockDiscardPendingMapsData(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<StockDiscardMapsDataDTO[]> {
    const query = this.query.getStockDiscardPendingMapsQuery(c, queryParam)

    const result = await execQuery<StockDiscardMapsDataDTO[]>(query, queryParam)
    return result
  }

  async fetchStockDiscardTotal(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<StockDiscardTotalDataDTO> {
    const query = this.query.getStockDiscardTotalQuery(c, queryParam)

    const result = await execQuery<StockDiscardTotalDataDTO[]>(
      query,
      queryParam
    )
    return result[0] || { discard: 0 }
  }

  async fetchStockDiscardPendingTotal(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<StockDiscardPendingTotalDataDTO> {
    const query = this.query.getStockDiscardPendingTotalQuery(c, queryParam)

    const result = await execQuery<StockDiscardPendingTotalDataDTO[]>(
      query,
      queryParam
    )
    return result[0] || { pending_discard: 0 }
  }

  async fetchStockDiscardMonthly(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<StockDiscardMonthlyDataDTO[]> {
    const query = this.query.getStockDiscardMonthlyQuery(c, queryParam)

    const result = await execQuery<StockDiscardMonthlyDataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  async fetchStockDiscardHighestPending(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<StockDiscardPendingDataDTO[]> {
    const query = this.query.getStockDiscardHighestPendingQuery(c, queryParam)

    const result = await execQuery<StockDiscardPendingDataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  async fetchStockDiscardTop10(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<StockDiscardTop10DataDTO[]> {
    const query = this.query.getStockDiscardTop10Query(c, queryParam)

    const result = await execQuery<StockDiscardTop10DataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  async getLastUpdate(c: Context, tableName: string): Promise<string> {
    const query = this.query.getLastUpdateQuery(tableName)

    try {
      const result = await execQuery<{ last_update: string }[]>(query)

      if (result && result.length > 0 && result[0]?.last_update) {
        return moment(result[0].last_update).format("YYYY-MM-DD HH:mm:ss")
      }
    } catch (error) {
      console.error("Error fetching last update:", error)
    }

    return moment().format("YYYY-MM-DD HH:mm:ss")
  }

  // Asset Repository Methods
  async fetchAssetMapsData(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<AssetMapsDataDTO[]> {
    const query = this.query.getAssetMapsQuery(c, queryParam)

    const result = await execQuery<AssetMapsDataDTO[]>(query, queryParam)
    return result
  }

  async fetchAssetDistinctMapsData(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<AssetDistinctMapsDataDTO[]> {
    const query = this.query.getAssetDistinctMapsQuery(c, queryParam)

    const result = await execQuery<AssetDistinctMapsDataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  async fetchAssetOverview(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<AssetOverviewDataDTO[]> {
    const query = this.query.getAssetOverviewQuery(c, queryParam)

    const result = await execQuery<AssetOverviewDataDTO[]>(query, queryParam)
    return result
  }

  async fetchAssetTotal(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<AssetTotalDataDTO> {
    const query = this.query.getAssetTotalQuery(c, queryParam)

    const result = await execQuery<AssetTotalDataDTO[]>(query, queryParam)
    return result[0] || { total_asset_recorded: 0 }
  }

  async fetchAssetOverdue(
    c: Context,
    queryParam: QualityQueryParams
  ): Promise<AssetOverdueDataDTO[]> {
    const query = this.query.getAssetOverdueQuery(c, queryParam)

    const result = await execQuery<AssetOverdueDataDTO[]>(query, queryParam)
    return result
  }
}
