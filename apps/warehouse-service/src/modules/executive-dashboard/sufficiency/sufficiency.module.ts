import { Context } from "hono"
import { ExecutiveDashboardSufficiencyRepository } from "./sufficiency.repository.js"
import {
  SufficiencyStockResponse,
  SufficiencyQueryParams,
} from "./sufficiency.schema.js"
import {
  buildMapsData,
  buildOverviewData,
  buildMonthlyComparison,
  buildTop10Materials,
  buildStockData,
} from "./sufficiency.util.js"
import moment from "moment"
import { RegionRepository } from "@/modules/region/region.repository.js"
import { ExecutiveDashboardSufficiencyExcel } from "./sufficiency.excel.js"

export class ExecutiveDashboardSufficiencyModule {
  constructor(
    private readonly repository: ExecutiveDashboardSufficiencyRepository,
    private readonly regionRepository: RegionRepository,
    private readonly excel: ExecutiveDashboardSufficiencyExcel
  ) {}

  async getStockSufficiency(
    c: Context,
    queryParams: SufficiencyQueryParams
  ): Promise<SufficiencyStockResponse> {
    const programId = c.var.programId

    // Get current period (running month in YYYY-MM format)
    const currentPeriod = moment().format("YYYY-MM")

    // Calculate last 12 months range
    const endPeriod = currentPeriod
    const startPeriod = moment().subtract(11, "months").format("YYYY-MM")

    queryParams.period = currentPeriod
    queryParams.start_period = startPeriod
    queryParams.end_period = endPeriod
    queryParams.program_id = programId

    const [
      mapsData,
      overviewData,
      criticalOverviewData,
      monthlyData,
      top10MaterialsData,
      stockOutData,
      stockMaxData,
      lastUpdated,
    ] = await Promise.all([
      this.repository.fetchStockSufficiencyMapsData(c, queryParams),
      this.repository.fetchStockSufficiencyOverview(c, queryParams),
      this.repository.fetchStockSufficiencyCriticalOverview(c, queryParams),
      this.repository.fetchStockSufficiencyMonthlyComparison(c, queryParams),
      this.repository.fetchStockSufficiencyTop10Materials(c, queryParams),
      this.repository.fetchStockOutData(c, queryParams),
      this.repository.fetchStockMaxData(c, queryParams),
      this.repository.getLastUpdate(c, "dashboard_stock_sufficiency"),
    ])

    const provinceData = await this.regionRepository.fetchProvinces(
      c,
      queryParams
    )
    const provinceName = provinceData.records[0]?.name

    // province_id is already a number due to z.coerce.number() in the schema
    // If province_id is provided, we use it; if undefined, it means "all"
    const maps = buildMapsData(mapsData, queryParams.province_id, provinceName)
    const overview = buildOverviewData(overviewData, criticalOverviewData)
    const monthlyComparison = buildMonthlyComparison(
      monthlyData,
      startPeriod,
      endPeriod
    )
    const top_10_materials = buildTop10Materials(
      top10MaterialsData,
      currentPeriod
    )
    const stock_out = buildStockData(stockOutData, currentPeriod)
    const stock_max = buildStockData(stockMaxData, currentPeriod)

    return {
      last_updated: lastUpdated,
      data: {
        maps,
        overview,
        monthly_comparison: monthlyComparison,
        top_10_materials,
        stock_out,
        stock_max,
      },
    }
  }

  async exportStockSufficiency(
    c: Context,
    queryParams: SufficiencyQueryParams
  ) {
    return await this.excel.generateStockSufficiencyExport(c, queryParams)
  }
}
