import { Context } from "hono"
import { ExecutiveDashboardDistributionRepository } from "./distribution.repository.js"
import {
  HealthFacilityImplementorQueryParams,
  HealthFacilityImplementorResponse,
  ActiveRateQueryParams,
  ActiveRateResponse,
  LeadTimeQueryParams,
  LeadTimeResponse,
  LastMileQueryParams,
  LastMileResponse,
  LastMileMaterialQueryParams,
  LastMileMaterialResponse,
} from "./distribution.schema.js"
import {
  buildMapsData,
  buildOverviewData,
  buildActiveRateMapsData,
  buildActiveRateMonthlyComparison,
  buildActiveRateRanking,
  buildLeadTimeMapsData,
  buildLastMileMapsData,
  buildLastMileMonthlyComparison,
  buildLastMileDistribution,
  buildLastMileMonthlyLastMile,
  buildLeadTimeMonthlyComparison,
  buildLeadTimeMostDelivery,
  buildYearlyComparison,
} from "./distribution.util.js"
import moment from "moment"
import { RegionRepository } from "@/modules/region/region.repository.js"
import { round } from "@smile-health/lib/utils.js"

export class ExecutiveDashboardDistributionModule {
  constructor(
    private readonly repository: ExecutiveDashboardDistributionRepository,
    private readonly regionRepository: RegionRepository
  ) {}

  async getHealthFacilityImplementor(
    c: Context,
    queryParams: HealthFacilityImplementorQueryParams
  ): Promise<HealthFacilityImplementorResponse> {
    const programId = c.var.programId
    queryParams.program_id = programId

    const [mapsData, overviewData, yearlyComparisonData, lastUpdated] =
      await Promise.all([
        this.repository.fetchHealthFacilityImplementorData(c, queryParams),
        this.repository.fetchOverviewData(c, queryParams),
        this.repository.fetchYearlyComparison(c, queryParams),
        this.repository.getLastUpdate(c, "dashboard_facility_distribution"),
      ])

    const provinceData = await this.regionRepository.fetchProvinces(
      c,
      queryParams
    )
    const provinceName = provinceData.records[0]?.name

    const maps = buildMapsData(
      c,
      mapsData,
      queryParams.province_id,
      provinceName
    )
    const overview = buildOverviewData(c, overviewData)
    const yearly_comparison = buildYearlyComparison(c, yearlyComparisonData)

    return {
      last_updated: lastUpdated,
      data: {
        maps,
        overview,
        yearly_comparison,
      },
    }
  }

  async getActiveRate(
    c: Context,
    queryParams: ActiveRateQueryParams
  ): Promise<ActiveRateResponse> {
    const programId = c.var.programId
    // Get current period (running month in YYYY-MM format)
    const currentPeriod = moment().format("YYYY-MM")

    // Calculate last 12 months range
    const endPeriod = currentPeriod
    const startPeriod = moment().subtract(11, "months").format("YYYY-MM")

    // Set default values if not provided
    queryParams.period = currentPeriod
    queryParams.start_period = startPeriod
    queryParams.end_period = endPeriod
    queryParams.program_id = programId

    const [
      mapsData,
      avgRate,
      monthlyData,
      highestData,
      lowestData,
      lastUpdated,
    ] = await Promise.all([
      this.repository.fetchActiveRateMapsData(c, queryParams),
      this.repository.fetchActiveRateAvg(c, queryParams),
      this.repository.fetchActiveRateMonthlyComparison(c, queryParams),
      this.repository.fetchActiveRateHighest(c, queryParams),
      this.repository.fetchActiveRateLowest(c, queryParams),
      this.repository.getLastUpdate(c, "dashboard_active_rate"),
    ])

    const provinceData = await this.regionRepository.fetchProvinces(
      c,
      queryParams
    )
    const provinceName = provinceData.records[0]?.name

    const maps = buildActiveRateMapsData(
      c,
      mapsData,
      queryParams.province_id,
      provinceName
    )
    const monthlyComparison = buildActiveRateMonthlyComparison(c, monthlyData)
    const highest = buildActiveRateRanking(
      highestData,
      queryParams.period || currentPeriod
    )
    const lowest = buildActiveRateRanking(
      lowestData,
      queryParams.period || currentPeriod
    )

    return {
      last_updated: lastUpdated,
      data: {
        maps,
        avg: round(avgRate),
        monthly_comparison: monthlyComparison,
        highest,
        lowest,
      },
    }
  }

  async getLeadTime(
    c: Context,
    queryParams: LeadTimeQueryParams
  ): Promise<LeadTimeResponse> {
    const programId = c.var.programId
    // Get current period (running month in YYYY-MM format)
    const currentPeriod = moment().format("YYYY-MM")

    // Calculate last 12 months range
    const endPeriod = currentPeriod
    const startPeriod = moment().subtract(11, "months").format("YYYY-MM")

    // Set default values if not provided
    queryParams.period = currentPeriod
    queryParams.start_period = startPeriod
    queryParams.end_period = endPeriod
    queryParams.program_id = programId

    const [mapsData, avgLeadTime, monthlyData, mostDeliveryData, lastUpdated] =
      await Promise.all([
        this.repository.fetchLeadTimeMapsData(c, queryParams),
        this.repository.fetchLeadTimeAvg(c, queryParams),
        this.repository.fetchLeadTimeMonthlyComparison(c, queryParams),
        this.repository.fetchLeadTimeMostDelivery(c, queryParams),
        this.repository.getLastUpdate(c, "dashboard_delivery_time"),
      ])

    const provinceData = await this.regionRepository.fetchProvinces(
      c,
      queryParams
    )
    const provinceName = provinceData.records[0]?.name

    const maps = buildLeadTimeMapsData(
      c,
      mapsData,
      queryParams.province_id,
      provinceName
    )
    const monthlyComparison = buildLeadTimeMonthlyComparison(
      c,
      monthlyData,
      startPeriod,
      endPeriod
    )
    const most_10_delivery = buildLeadTimeMostDelivery(
      mostDeliveryData,
      currentPeriod,
      queryParams.province_id
    )

    return {
      last_updated: lastUpdated,
      data: {
        maps,
        avg: avgLeadTime,
        monthly_comparison: monthlyComparison,
        most_10_delivery,
      },
    }
  }

  async getLastMile(
    c: Context,
    queryParams: LastMileQueryParams
  ): Promise<LastMileResponse> {
    const programId = c.var.programId
    // Get current period (running month in YYYY-MM format)
    const currentPeriod = moment().format("YYYY-MM")

    // Calculate last 12 months range
    const endPeriod = currentPeriod
    const startPeriod = moment().subtract(11, "months").format("YYYY-MM")

    // Set default values if not provided
    queryParams.period = currentPeriod
    queryParams.start_period = startPeriod
    queryParams.end_period = endPeriod
    queryParams.program_id = programId

    // Convert province_id to number if it's a string
    if (
      queryParams.province_id &&
      typeof queryParams.province_id === "string"
    ) {
      queryParams.province_id = parseInt(queryParams.province_id)
    }

    const [
      mapsData,
      totalData,
      monthlyData,
      distributionData,
      monthlyLastMileData,
      lastUpdated,
    ] = await Promise.all([
      this.repository.fetchLastMileMapsData(c, queryParams),
      this.repository.fetchLastMileTotal(c, queryParams),
      this.repository.fetchLastMileMonthlyComparison(c, queryParams),
      this.repository.fetchLastMileDistribution(c, queryParams),
      this.repository.fetchLastMileMonthlyLastMile(c, queryParams),
      this.repository.getLastUpdate(c, "dashboard_last_distribution"),
    ])

    const provinceData = await this.regionRepository.fetchProvinces(
      c,
      queryParams
    )
    const provinceName = provinceData.records[0]?.name

    const maps = buildLastMileMapsData(
      mapsData,
      queryParams.province_id,
      provinceName
    )
    const monthlyComparison = buildLastMileMonthlyComparison(
      c,
      monthlyData,
      startPeriod,
      endPeriod
    )
    const distribution = buildLastMileDistribution(c, distributionData)
    const monthly_last_mile = buildLastMileMonthlyLastMile(
      c,
      monthlyLastMileData,
      startPeriod,
      endPeriod
    )

    return {
      last_updated: lastUpdated,
      data: {
        maps,
        total: totalData,
        monthly_comparison: monthlyComparison,
        distribution,
        monthly_last_mile,
      },
    }
  }

  async getLastMileMaterial(
    c: Context,
    queryParams: LastMileMaterialQueryParams
  ): Promise<LastMileMaterialResponse> {
    const programId = c.var.programId

    queryParams.program_id = programId

    const [materialData, lastUpdated] = await Promise.all([
      this.repository.fetchLastMileMaterial(c, queryParams),
      this.repository.getLastUpdate(c, "dashboard_last_distribution"),
    ])

    // Format the period to match the API spec (e.g., "2025-01" -> "JAN 2025")
    const formattedDate = moment(queryParams.period, "YYYY-MM")
      .format("MMM YYYY")
      .toUpperCase()

    // Transform the data to match the expected response format
    const dataset = materialData.map((item) => ({
      id: item.id,
      name: item.name,
      value: Math.round(item.value || 0),
    }))

    return {
      last_updated: lastUpdated,
      data: {
        selected_date: formattedDate,
        material_type: queryParams.material_type,
        dataset,
      },
    }
  }
}
