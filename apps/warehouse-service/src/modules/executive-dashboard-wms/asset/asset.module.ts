import { Context } from "hono"
import { AssetRepository } from "./asset.repository.js"
import { AssetQueryParams, AssetResponse } from "./asset.schema.js"
import { buildMapsData, buildOverviewData } from "./asset.util.js"

export class AssetModule {
  constructor(private readonly repository: AssetRepository) {}

  async getAssetData(
    c: Context,
    queryParams: AssetQueryParams
  ): Promise<AssetResponse> {
    const { province_id } = queryParams
    const provinceIdStr = province_id?.toString()

    const [assetData, national, lastUpdated] = await Promise.all([
      this.repository.fetchAssetData(c, provinceIdStr),
      this.repository.fetchNationalSummary(c, provinceIdStr),
      this.repository.getLastUpdate(c),
    ])

    const maps = buildMapsData(assetData, provinceIdStr)
    const overview = buildOverviewData(national ?? {
      coldstorage: 0,
      coldstorage_borrowed: 0,
      autoclave: 0,
      incinerator: 0,
      scale_unit: 0,
      scale_borrowed: 0,
      scale_third_party: 0,
      ownership_total_scale: 0,
      ownership_scale_borrowed: 0,
      scale_shared_total: 0,
      scale_shared_from_third_party: 0,
      scale_provided_third_party: 0,
      scale_provided_health_facilitator: 0,
      overview_cold_storage_total: 0,
      overview_cold_storage_borrowed: 0,
      overview_autoclave: 0,
      overview_incinerator: 0,
      scale_health_facilitator: 0,
      total_all: 0,
    })

    return {
      last_updated: lastUpdated,
      data: {
        maps,
        total: Number(national?.total_all ?? 0),
        overview,
      },
    }
  }
}
