import { Context } from "hono"
import { execQuery } from "@/common/infrastructure/database/index.js"
import { HealthFacilityQuery } from "./health-facility.query.js"
import {
  HealthFacilityDTO,
  OverviewStatsDTO,
  HealthFacilityQueryParams,
  YearlyComparisonDTO,
} from "./health-facility.schema.js"
import moment from "moment"

export class HealthFacilityRepository {
  constructor(private readonly query: HealthFacilityQuery) {}

  async fetchHealthFacilities(
    c: Context,
    params: HealthFacilityQueryParams
  ): Promise<HealthFacilityDTO[]> {
    const query = this.query.getHealthFacilitiesQuery(params)
    const result = await execQuery<HealthFacilityDTO[]>(query, {})
    return result
  }

  async fetchOverviewStats(
    c: Context,
    params: HealthFacilityQueryParams
  ): Promise<OverviewStatsDTO> {
    const query = this.query.getOverviewStatsQuery(params)
    const result = await execQuery<OverviewStatsDTO[]>(query, {})
    
    if (result && result.length > 0 && result[0]) {
      return result[0]
    }
    
    return {
      total_provinces: 0,
      active_provinces: 0,
      total_cities: 0,
      active_cities: 0,
      total_health_facilities: 0,
      active_health_facilities: 0,
    }
  }

  async getLastUpdate(c: Context): Promise<string> {
    const query = this.query.getLastUpdateQuery()
    const result = await execQuery<{ last_updated: string }[]>(query, {})
    
    if (result[0]?.last_updated) {
      return result[0].last_updated
    }
    
    return moment().format("YYYY-MM-DD HH:mm:ss")
  }

  async fetchYearlyComparison(
    c: Context,
    params: HealthFacilityQueryParams
  ): Promise<YearlyComparisonDTO[]> {
    const query = this.query.getYearlyComparisonQuery(params)
    const result = await execQuery<YearlyComparisonDTO[]>(query, {})
    return result || []
  }
}
