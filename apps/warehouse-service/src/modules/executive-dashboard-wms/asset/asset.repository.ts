import { Context } from "hono"
import { execQuery } from "@/common/infrastructure/database/index.js"
import { AssetQuery } from "./asset.query.js"
import { AssetDataDTO, NationalDataDTO } from "./asset.schema.js"
import moment from "moment"

export class AssetRepository {
  constructor(private readonly query: AssetQuery) {}

  async fetchAssetData(c: Context, provinceId?: string): Promise<AssetDataDTO[]> {
    const query = this.query.getAssetDataQuery(provinceId)
    const result = await execQuery<AssetDataDTO[]>(query, {})
    return result
  }

  async fetchNationalSummary(c: Context, provinceId?: string): Promise<NationalDataDTO | null> {
    const query = this.query.getNationalSummaryQuery(provinceId)
    const result = await execQuery<NationalDataDTO[]>(query, {})
    return result[0] || null
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
