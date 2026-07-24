import { Context } from "hono"
import { AnnualQueryParams } from "./annual.schema.js"
import { AnnualQuery } from "./annual.query.js"
import { execQuery } from "@/common/infrastructure/database/clickhouse/index.js"
import { BaseRepository } from "@/common/repositories/base.repository.js"

export class AnnualRepository extends BaseRepository {
  constructor(private readonly annualQuery: AnnualQuery) {
    super()
  }

  async fetchAnnualNeedEntity(
    c: Context,
    queryParams: AnnualQueryParams
  ): Promise<any> {
    const query = this.annualQuery.buildAnnualNeedEntityQuery(queryParams)
    const result = await execQuery<any>(query, queryParams)
    return result
  }

  async fetchAnnualNeedMaterial(
    c: Context,
    queryParams: AnnualQueryParams
  ): Promise<any> {
    const query = this.annualQuery.buildAnnualNeedMaterialQuery(queryParams)
    const result = await execQuery<any>(query, queryParams)
    return result
  }

  async fetchAnnualNeedTemperature(
    c: Context,
    queryParams: AnnualQueryParams
  ): Promise<any> {
    const query = this.annualQuery.buildAnnualNeedTemperatureQuery(queryParams)
    const result = await execQuery<any>(query, queryParams)
    return result
  }

  async fetchAnnualAchievementNeed(
    c: Context,
    queryParams: AnnualQueryParams
  ): Promise<any> {
    const query =
      this.annualQuery.buildAnnualAchievementNeedQuery(queryParams)
    const result = await execQuery<any>(query, queryParams)
    return result
  }

  async fetchAnnualNeedEntityExport(
    c: Context,
    queryParams: AnnualQueryParams
  ): Promise<any> {
    const query = this.annualQuery.buildAnnualNeedEntityExportQuery(queryParams)
    const result = await execQuery<any>(query, queryParams)
    return result
  }

  async fetchAnnualNeedTemperatureExport(
    c: Context,
    queryParams: AnnualQueryParams
  ): Promise<any> {
    const query = this.annualQuery.buildAnnualNeedTemperatureExportQuery(queryParams)
    const result = await execQuery<any>(query, queryParams)
    return result
  }
}
