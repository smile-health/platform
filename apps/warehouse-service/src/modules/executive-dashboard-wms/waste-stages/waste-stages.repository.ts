import { Context } from "hono"
import { execQuery } from "@/common/infrastructure/database/clickhouse/index.js"
import { WasteStagesQuery } from "./waste-stages.query.js"
import {
  ProvinceAggregateDTO,
  OverviewBagDTO,
  OverviewKgDTO,
} from "./waste-stages.schema.js"
import moment from "moment"

export class WasteStagesRepository {
  constructor(private readonly query: WasteStagesQuery) {}

  async fetchProvinceAggregate(
    c: Context,
    provinceId?: string
  ): Promise<ProvinceAggregateDTO[]> {
    const query = this.query.getProvinceAggregateQuery(provinceId)
    const result = await execQuery<ProvinceAggregateDTO[]>(query, {})
    return result
  }

  async fetchOverviewBag(
    c: Context,
    provinceId?: string
  ): Promise<OverviewBagDTO> {
    const query = this.query.getOverviewBagQuery(provinceId)
    const result = await execQuery<OverviewBagDTO[]>(query, {})
    return (
      result[0] || {
        today_bag_count: 0,
        yesterday_bag_count: 0,
      }
    )
  }

  async fetchOverviewKg(
    c: Context,
    provinceId?: string
  ): Promise<OverviewKgDTO> {
    const query = this.query.getOverviewKgQuery(provinceId)
    const result = await execQuery<OverviewKgDTO[]>(query, {})
    return (
      result[0] || {
        today_kg: 0,
        yesterday_kg: 0,
      }
    )
  }

  async getLastUpdate(c: Context): Promise<string> {
    const query = this.query.getLastUpdateQuery()
    const result = await execQuery<{ last_updated: string }[]>(query, {})

    if (result[0]?.last_updated) {
      return result[0].last_updated
    }

    return moment().format("YYYY-MM-DD HH:mm:ss")
  }
}
