import { Context } from "hono"
import { execQuery } from "@/common/infrastructure/database/index.js"
import { LeadTimeQuery } from "./lead-time.query.js"
import {
  LeadTimeMapDTO,
  LeadTimeAvgDTO,
  LeadTimeMonthlyDTO,
  LeadTimeTop10DTO,
  LastUpdatedDTO,
  LeadTimeStage,
} from "./lead-time.schema.js"
import moment from "moment"

export class LeadTimeRepository {
  constructor(private readonly query: LeadTimeQuery) {}

  async fetchMapData(c: Context, provinceId?: string, stage?: LeadTimeStage, entityTagId?: string): Promise<LeadTimeMapDTO[]> {
    const sql = this.query.getMapDataQuery(provinceId, stage, entityTagId)
    return execQuery<LeadTimeMapDTO[]>(sql, {})
  }

  async fetchNationalAvg(c: Context, provinceId?: string, stage?: LeadTimeStage, entityTagId?: string): Promise<number> {
    const sql = this.query.getNationalAvgQuery(provinceId, stage, entityTagId)
    const result = await execQuery<LeadTimeAvgDTO[]>(sql, {})
    return result[0]?.avg_lead_time_days ?? 0
  }

  async fetchMonthlyComparison(c: Context, provinceId?: string, stage?: LeadTimeStage, entityTagId?: string): Promise<LeadTimeMonthlyDTO[]> {
    const sql = this.query.getMonthlyComparisonQuery(provinceId, stage, entityTagId)
    return execQuery<LeadTimeMonthlyDTO[]>(sql, {})
  }

  async fetchTop10Delivery(c: Context, provinceId?: string, stage?: LeadTimeStage, entityTagId?: string): Promise<LeadTimeTop10DTO[]> {
    const sql = this.query.getTop10DeliveryQuery(provinceId, stage, entityTagId)
    return execQuery<LeadTimeTop10DTO[]>(sql, {})
  }

  async getLastUpdate(c: Context): Promise<string> {
    const sql = this.query.getLastUpdateQuery()
    const result = await execQuery<LastUpdatedDTO[]>(sql, {})
    return result[0]?.last_updated ?? moment().format("YYYY-MM-DD HH:mm:ss")
  }
}
