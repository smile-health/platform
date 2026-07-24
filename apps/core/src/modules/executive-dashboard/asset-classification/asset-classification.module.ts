import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { Context } from "hono"
import { ExecutiveAssetClassificationRepository } from "./asset-classification.repository.js"
import { AssetClassificationRequest } from "./asset-classification.schema.js"

export class ExecutiveAssetClassificationModule {
  constructor(private readonly repo: ExecutiveAssetClassificationRepository) {}

  async list(c: Context, queryParam: AssetClassificationRequest) {
    const { data, total } = await this.repo.findAll(c, queryParam)

    if (data.length === 0) {
      return new PaginatedResponse(queryParam)
    }

    const assetClassifications = data.map((assetClassification) => {
      return {
        ...assetClassification,
        name: c.var.t(`asset_classification.label.${assetClassification.name}`),
      }
    })

    return new PaginatedResponse(queryParam, assetClassifications, total)
  }
}
