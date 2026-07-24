import { Context } from "hono"
import { CceRepository } from "./cce.repository.js"
import { CceQueryParams } from "./cce.schema.js"
import { EntityByColdstorageStatusCapacityExcel } from "./excel/entity-by-capacity-status.excel.js"
import { round } from "lodash"

export class CceModule {
  constructor(private readonly repository: CceRepository) {}

  async getAggregateCapacityReport(c: Context, queryParams: CceQueryParams) {
    const [
      capacityStatus,
      entityByColdstorageStatusCapacity,
      averageOrderLeadTime,
      dayOfSupply,
      averageMonthlyConsumption,
      lastUpdatedColdStorage,
      lastUpdatedOrderList,
      lastUpdatedTransactions,
    ] = await Promise.all([
      this.repository.fetchCapacityStatus(c, queryParams),
      this.repository.fetchEntityByColdstorageStatusCapacity(c, queryParams),
      this.repository.fetchbuildAverageOrderLeadTime(c, queryParams),
      this.repository.fetchBuildDayOfSupply(c, queryParams),
      this.repository.fetchAverageMonthlyConsumption(c, queryParams),
      this.repository.fetchLastUpdated("dim_coldstorages"),
      this.repository.fetchLastUpdated("datamart_order_list_v5"),
      this.repository.fetchLastUpdated("datamart_transactions_v5"),
    ])

    const finalDayOfSupply =
      (dayOfSupply[0].qty / averageMonthlyConsumption[0].qty) * (365 / 12)

    return {
      capacity_status: {
        ...capacityStatus[0],
        last_update: lastUpdatedColdStorage,
      },
      entity_by_coldstorage_status_capacity: {
        ...entityByColdstorageStatusCapacity[0],
        last_update: lastUpdatedColdStorage,
      },
      average_order_lead_time: {
        ...averageOrderLeadTime[0],
        last_update: lastUpdatedOrderList,
      },
      day_of_supply: {
        qty: round(finalDayOfSupply),
        last_update: lastUpdatedTransactions,
      },
      average_monthly_consumption: {
        ...averageMonthlyConsumption[0],
        last_update: lastUpdatedTransactions,
      },
    }
  }

  async exportEntityByCapacityStatus(c: Context, queryParams: CceQueryParams) {
    const data =
      await this.repository.fetchEntityByColdstorageStatusCapacityForExport(
        c,
        queryParams
      )
    const template = new EntityByColdstorageStatusCapacityExcel(data)

    template.setLanguage(c.var.language)
    template.setTimezone(c.var.timezone)
    return template.generate()
  }
}
