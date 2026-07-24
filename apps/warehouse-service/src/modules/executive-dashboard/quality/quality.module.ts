import { Context } from "hono"
import { ExecutiveDashboardQualityRepository } from "./quality.repository.js"
import {
  StockTakingResponse,
  QualityQueryParams,
  StockDiscardResponse,
  AssetResponse,
} from "./quality.schema.js"
import {
  buildStockTakingMapsData,
  buildStockTakingOverview,
  buildStockTakingMonthlyComparison,
  buildStockTakingRanking,
  buildStockDiscardMapsData,
  buildStockDiscardTotal,
  buildStockDiscardMonthly,
  buildStockDiscardHighestPending,
  buildStockDiscardTop10,
  buildAssetMapsData,
  buildAssetOverview,
  buildAssetTotal,
} from "./quality.util.js"
import moment from "moment"
import { RegionRepository } from "@/modules/region/region.repository.js"

export class ExecutiveDashboardQualityModule {
  constructor(
    private readonly repository: ExecutiveDashboardQualityRepository,
    private readonly regionRepository: RegionRepository
  ) {}

  async getStockTaking(
    c: Context,
    queryParams: QualityQueryParams
  ): Promise<StockTakingResponse> {
    const programId = c.var.programId

    // Get current period (running month in YYYY-MM format)
    const currentPeriod = moment().format("YYYY-MM")

    // Calculate last 12 months range
    const endPeriod = currentPeriod
    const startPeriod = moment().subtract(11, "months").format("YYYY-MM")

    queryParams.program_id = programId
    queryParams.period = currentPeriod
    queryParams.start_period = startPeriod
    queryParams.end_period = endPeriod

    const [
      mapsData,
      overviewData,
      monthlyData,
      highestData,
      lowestData,
      lastUpdated,
    ] = await Promise.all([
      this.repository.fetchStockTakingMapsData(c, queryParams),
      this.repository.fetchStockTakingOverview(c, queryParams),
      this.repository.fetchStockTakingMonthlyComparison(c, queryParams),
      this.repository.fetchStockTakingHighest(c, queryParams),
      this.repository.fetchStockTakingLowest(c, queryParams),
      this.repository.getLastUpdate(c, "dashboard_stock_taking"),
    ])

    const provinceData = await this.regionRepository.fetchProvinces(
      c,
      queryParams
    )
    const provinceName = provinceData.records[0]?.name

    const maps = buildStockTakingMapsData(
      mapsData,
      queryParams.province_id,
      provinceName
    )
    const overview = buildStockTakingOverview(overviewData)
    const monthlyComparison = buildStockTakingMonthlyComparison(monthlyData)
    const higest_stock_taking = buildStockTakingRanking(
      highestData,
      currentPeriod
    )
    const lowest_stock_taking = buildStockTakingRanking(
      lowestData,
      currentPeriod
    )

    return {
      last_updated: lastUpdated,
      data: {
        maps,
        overview,
        monthly_comparison: monthlyComparison,
        higest_stock_taking,
        lowest_stock_taking,
      },
    }
  }

  async getStockDiscard(
    c: Context,
    queryParams: QualityQueryParams
  ): Promise<StockDiscardResponse> {
    const programId = c.var.programId

    // Get current period (running month in YYYY-MM format)
    const currentPeriod = moment().format("YYYY-MM")

    // Calculate last 12 months range
    const endPeriod = currentPeriod
    const startPeriod = moment().subtract(11, "months").format("YYYY-MM")

    queryParams.program_id = programId
    queryParams.period = currentPeriod
    queryParams.start_period = startPeriod
    queryParams.end_period = endPeriod

    const [
      mapsData,
      pendingMapsData,
      totalData,
      pendingTotalData,
      monthlyData,
      highestPendingData,
      top10Data,
      lastUpdated,
    ] = await Promise.all([
      this.repository.fetchStockDiscardMapsData(c, queryParams),
      this.repository.fetchStockDiscardPendingMapsData(c, queryParams),
      this.repository.fetchStockDiscardTotal(c, queryParams),
      this.repository.fetchStockDiscardPendingTotal(c, queryParams),
      this.repository.fetchStockDiscardMonthly(c, queryParams),
      this.repository.fetchStockDiscardHighestPending(c, queryParams),
      this.repository.fetchStockDiscardTop10(c, queryParams),
      this.repository.getLastUpdate(c, "dashboard_stock_discard"),
    ])

    const provinceData = await this.regionRepository.fetchProvinces(
      c,
      queryParams
    )
    const provinceName = provinceData.records[0]?.name

    const maps = buildStockDiscardMapsData(
      mapsData,
      pendingMapsData,
      queryParams.province_id,
      provinceName
    )
    const total = buildStockDiscardTotal(totalData, pendingTotalData)
    const discard = buildStockDiscardMonthly(
      monthlyData,
      startPeriod,
      endPeriod
    )
    const higest_pending_discard = buildStockDiscardHighestPending(
      highestPendingData,
      currentPeriod
    )
    const top_10_discard = buildStockDiscardTop10(top10Data, currentPeriod)

    return {
      last_updated: lastUpdated,
      data: {
        maps,
        total,
        discard,
        higest_pending_discard,
        top_10_discard,
      },
    }
  }

  async getAsset(
    c: Context,
    queryParams: QualityQueryParams
  ): Promise<AssetResponse> {
    const programId = c.var.programId

    // Get current period (running month in YYYY-MM format)
    const currentPeriod = moment().format("YYYY-MM")

    queryParams.program_id = programId
    queryParams.period = currentPeriod

    const [
      mapsData,
      distinctMapsData,
      assetOverdueData,
      overviewData,
      totalData,
      lastUpdated,
    ] = await Promise.all([
      this.repository.fetchAssetMapsData(c, queryParams),
      this.repository.fetchAssetDistinctMapsData(c, queryParams),
      this.repository.fetchAssetOverdue(c, queryParams),
      this.repository.fetchAssetOverview(c, queryParams),
      this.repository.fetchAssetTotal(c, queryParams),
      this.repository.getLastUpdate(c, "dashboard_asset"),
    ])

    const provinceData = await this.regionRepository.fetchProvinces(
      c,
      queryParams
    )
    const provinceName = provinceData.records[0]?.name

    const maps = buildAssetMapsData(
      mapsData,
      distinctMapsData,
      assetOverdueData,
      queryParams.province_id,
      provinceName
    )
    const overview = buildAssetOverview(overviewData)
    const total = buildAssetTotal(totalData)

    return {
      last_updated: lastUpdated,
      data: {
        maps,
        total,
        overview,
      },
    }
  }
}
