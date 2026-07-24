import { Context } from "hono"
import { execQuery } from "@/common/infrastructure/database/index.js"
import { ExecutiveDashboardDistributionQuery } from "./distribution.query.js"
import {
  FacilityDistributionDataDTO,
  FacilityOverviewDataDTO,
  ActiveRateDataDTO,
  ActiveRateMonthlyDataDTO,
  ActiveRateRankingDataDTO,
  LeadTimeMapsDataDTO,
  LeadTimeMonthlyDataDTO,
  LeadTimeMostDeliveryDataDTO,
  LastMileMapsDataDTO,
  LastMileMonthlyDataDTO,
  LastMileDistributionDataDTO,
  LastMileMonthlyLastMileDataDTO,
  LastMileTotalDTO,
  LastMileMaterialDataItemDTO,
  YearlyComparisonItemDTO,
  HealthFacilityImplementorQueryParams,
  ActiveRateQueryParams,
  LeadTimeQueryParams,
  LastMileQueryParams,
  LastMileMaterialQueryParams,
} from "./distribution.schema.js"
import moment from "moment"

export class ExecutiveDashboardDistributionRepository {
  constructor(private readonly query: ExecutiveDashboardDistributionQuery) {}

  async fetchHealthFacilityImplementorData(
    c: Context,
    queryParam: HealthFacilityImplementorQueryParams
  ): Promise<FacilityDistributionDataDTO[]> {
    const query = this.query.getHealthFacilityImplementorQuery(c, queryParam)

    const result = await execQuery<FacilityDistributionDataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  async fetchOverviewData(
    c: Context,
    queryParam: HealthFacilityImplementorQueryParams
  ): Promise<FacilityOverviewDataDTO | null> {
    const query = this.query.getOverviewQuery(c, queryParam)

    const result = await execQuery<FacilityOverviewDataDTO[]>(query, queryParam)
    return result[0] || null
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

  // Active Rate Repository Methods
  async fetchActiveRateMapsData(
    c: Context,
    queryParam: ActiveRateQueryParams
  ): Promise<ActiveRateDataDTO[]> {
    const query = this.query.getActiveRateMapsQuery(c, queryParam)

    const result = await execQuery<ActiveRateDataDTO[]>(query, queryParam)
    return result
  }

  async fetchActiveRateAvg(
    c: Context,
    queryParam: ActiveRateQueryParams
  ): Promise<number> {
    const query = this.query.getActiveRateAvgQuery(c, queryParam)

    const result = await execQuery<{ avg_active_rate: number }[]>(
      query,
      queryParam
    )
    return result[0]?.avg_active_rate || 0
  }

  async fetchActiveRateMonthlyComparison(
    c: Context,
    queryParam: ActiveRateQueryParams
  ): Promise<ActiveRateMonthlyDataDTO[]> {
    const query = this.query.getActiveRateMonthlyComparisonQuery(c, queryParam)

    const result = await execQuery<ActiveRateMonthlyDataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  async fetchActiveRateHighest(
    c: Context,
    queryParam: ActiveRateQueryParams
  ): Promise<ActiveRateRankingDataDTO[]> {
    const query = this.query.getActiveRateHighestQuery(c, queryParam)

    const result = await execQuery<ActiveRateRankingDataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  async fetchActiveRateLowest(
    c: Context,
    queryParam: ActiveRateQueryParams
  ): Promise<ActiveRateRankingDataDTO[]> {
    const query = this.query.getActiveRateLowestQuery(c, queryParam)

    const result = await execQuery<ActiveRateRankingDataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  // Lead Time Repository Methods
  async fetchLeadTimeMapsData(
    c: Context,
    queryParam: LeadTimeQueryParams
  ): Promise<LeadTimeMapsDataDTO[]> {
    const query = this.query.getLeadTimeMapsQuery(c, queryParam)

    const result = await execQuery<LeadTimeMapsDataDTO[]>(query, queryParam)
    return result
  }

  async fetchLeadTimeAvg(
    c: Context,
    queryParam: LeadTimeQueryParams
  ): Promise<number> {
    const query = this.query.getLeadTimeAvgQuery(c, queryParam)

    const result = await execQuery<{ avg_duration: number }[]>(
      query,
      queryParam
    )
    return Math.ceil(result[0]?.avg_duration || 0)
  }

  async fetchLeadTimeMonthlyComparison(
    c: Context,
    queryParam: LeadTimeQueryParams
  ): Promise<LeadTimeMonthlyDataDTO[]> {
    const query = this.query.getLeadTimeMonthlyComparisonQuery(c, queryParam)

    const result = await execQuery<LeadTimeMonthlyDataDTO[]>(query, queryParam)
    return result
  }

  async fetchLeadTimeMostDelivery(
    c: Context,
    queryParam: LeadTimeQueryParams
  ): Promise<LeadTimeMostDeliveryDataDTO[]> {
    const query = this.query.getLeadTimeMostDeliveryQuery(c, queryParam)

    const result = await execQuery<LeadTimeMostDeliveryDataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  // Last Mile Repository Methods
  async fetchLastMileMapsData(
    c: Context,
    queryParam: LastMileQueryParams
  ): Promise<LastMileMapsDataDTO[]> {
    const query = this.query.getLastMileMapsQuery(c, queryParam)

    const result = await execQuery<LastMileMapsDataDTO[]>(query, queryParam)
    return result
  }

  async fetchLastMileTotal(
    c: Context,
    queryParam: LastMileQueryParams
  ): Promise<LastMileTotalDTO> {
    const query = this.query.getLastMileTotalQuery(c, queryParam)

    const result = await execQuery<LastMileTotalDTO[]>(query, queryParam)
    return {
      distribution: result[0]?.distribution || 0,
      received: result[0]?.received || 0,
    }
  }

  async fetchLastMileMonthlyComparison(
    c: Context,
    queryParam: LastMileQueryParams
  ): Promise<LastMileMonthlyDataDTO[]> {
    const query = this.query.getLastMileMonthlyComparisonQuery(c, queryParam)

    const result = await execQuery<LastMileMonthlyDataDTO[]>(query, queryParam)
    return result
  }

  async fetchLastMileDistribution(
    c: Context,
    queryParam: LastMileQueryParams
  ): Promise<LastMileDistributionDataDTO[]> {
    const query = this.query.getLastMileDistributionQuery(c, queryParam)

    const result = await execQuery<LastMileDistributionDataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  async fetchLastMileMonthlyLastMile(
    c: Context,
    queryParam: LastMileQueryParams
  ): Promise<LastMileMonthlyLastMileDataDTO[]> {
    const query = this.query.getLastMileMonthlyLastMileQuery(c, queryParam)

    const result = await execQuery<LastMileMonthlyLastMileDataDTO[]>(
      query,
      queryParam
    )
    return result
  }

  // Last Mile Material Repository Methods
  async fetchLastMileMaterial(
    c: Context,
    queryParam: LastMileMaterialQueryParams
  ): Promise<LastMileMaterialDataItemDTO[]> {
    const query = this.query.getLastMileMaterialQuery(c, queryParam)

    const result = await execQuery<LastMileMaterialDataItemDTO[]>(
      query,
      queryParam
    )
    return result
  }

  // Yearly Comparison Repository Methods
  async fetchYearlyComparison(
    c: Context,
    queryParam: HealthFacilityImplementorQueryParams
  ): Promise<YearlyComparisonItemDTO[]> {
    const query = this.query.getYearlyComparisonQuery(c, queryParam)

    const result = await execQuery<YearlyComparisonItemDTO[]>(query, queryParam)
    return result
  }
}
