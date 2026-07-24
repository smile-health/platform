import { execQuery } from "@/common/infrastructure/database/clickhouse/index.js"
import { BaseRepository } from "@/common/repositories/base.repository.js"
import { Context } from "hono"
import { MaterialQuery } from "./material.query.js"
import { MaterialQueryParams } from "./material.schema.js"

export class MaterialRepository extends BaseRepository {
  constructor(private readonly materialQuery: MaterialQuery) {
    super()
  }

  async fetchFunctionalStatus(
    c: Context,
    queryParams: MaterialQueryParams
  ): Promise<any> {
    const query = this.materialQuery.buildFunctionalStatusQuery(queryParams)
    const result = await execQuery<any>(query, queryParams)
    return result
  }

  async fetchTotalFunctionalCapacity(
    c: Context,
    queryParams: MaterialQueryParams
  ): Promise<any> {
    const query =
      this.materialQuery.buildTotalFunctionalCapacityQuery(queryParams)
    const result = await execQuery<any>(query, queryParams)
    return result
  }

  async fetchMaterialFunctionalCapacity(
    c: Context,
    queryParams: MaterialQueryParams
  ): Promise<any> {
    const query =
      this.materialQuery.buildMaterialFunctionalCapacityQuery(queryParams)
    const result = await execQuery<any>(query, queryParams)
    return result
  }

  async fetchMaterialVolumeByAssetTemp(
    c: Context,
    queryParams: MaterialQueryParams
  ): Promise<any> {
    const query =
      this.materialQuery.buildMaterialVolumeByAssetTempQuery(queryParams)
    const result = await execQuery<any>(query, queryParams)
    return result
  }

  async fetchCapacityRemaining(
    c: Context,
    queryParams: MaterialQueryParams
  ): Promise<any> {
    const query = this.materialQuery.buildCapacityRemainingQuery(queryParams)
    const result = await execQuery<any>(query, queryParams)
    return result
  }
}
