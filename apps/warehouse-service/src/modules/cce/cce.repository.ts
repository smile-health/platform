import { Context } from "hono"
import { CceQueryParams } from "./cce.schema.js"
import { CceQuery } from "./cce.query.js"
import { execQuery } from "@/common/infrastructure/database/clickhouse/index.js"
import { BaseRepository } from "@/common/repositories/base.repository.js"

export class CceRepository extends BaseRepository {
  constructor(private readonly cceQuery: CceQuery) {
    super()
  }

  async fetchCapacityStatus(
    c: Context,
    queryParams: CceQueryParams
  ): Promise<any> {
    const query = await this.cceQuery.buildCapacityStatusQuery(queryParams)

    const result = await execQuery<any>(query, queryParams)

    return result
  }

  async fetchEntityByColdstorageStatusCapacity(
    c: Context,
    queryParams: CceQueryParams
  ): Promise<any> {
    const query =
      this.cceQuery.buildEntityByColdstorageStatusCapacityQuery(queryParams)

    const result = await execQuery<any>(query, queryParams)

    return result
  }

  async fetchEntityByColdstorageStatusCapacityForExport(
    c: Context,
    queryParams: CceQueryParams
  ): Promise<any> {
    const query =
      this.cceQuery.buildEntityByColdstorageStatusCapacityQuery(queryParams, true)

    const result = await execQuery<any>(query, queryParams)

    return result
  }

  async fetchbuildAverageOrderLeadTime(
    c: Context,
    queryParams: CceQueryParams
  ): Promise<any> {
    const query = this.cceQuery.buildAverageOrderLeadTimeQuery(queryParams)

    const result = await execQuery<any>(query, queryParams)

    return result
  }

  async fetchBuildDayOfSupply(
    c: Context,
    queryParams: CceQueryParams
  ): Promise<any> {
    const query = this.cceQuery.buildDayOfSupplyQuery(queryParams)

    const result = await execQuery<any>(query, queryParams)

    return result
  }

  async fetchDayOfSupply(
    c: Context,
    queryParams: CceQueryParams
  ): Promise<any> {
    const query = this.cceQuery.buildDayOfSupplyQuery(queryParams)

    const result = await execQuery<any>(query, queryParams)

    return result
  }

  async fetchAverageMonthlyConsumption(
    c: Context,
    queryParams: CceQueryParams
  ) {
    const query = this.cceQuery.buildAverageMonthlyConsumptionQuery(queryParams)

    const result = await execQuery<any>(query, queryParams)

    return result
  }
}
