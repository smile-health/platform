import { execQuery } from "@/common/infrastructure/database/index.js"
import { SmileVsBiofarmaQuery } from "./smile-vs-biofarma.query.js"
import {
  BiofarmaOrderDTO,
  EntityDataDTO,
  LastUpdatedDTO,
  MaterialDataDTO,
  SmileVsBiofarmaQueryParams,
  SummaryDataDTO,
} from "./smile-vs-biofarma.schema.js"

export class SmileVsBiofarmaRepository {
  constructor(private readonly smileVsBiofarmaQuery: SmileVsBiofarmaQuery) {}

  async fetchSmdvSummary(
    params: SmileVsBiofarmaQueryParams
  ): Promise<SummaryDataDTO[]> {
    const query = this.smileVsBiofarmaQuery.getSummarySmdvQuery(params)
    const result = await execQuery<SummaryDataDTO[]>(query, params)
    return result
  }

  async fetchSmileSummary(
    params: SmileVsBiofarmaQueryParams
  ): Promise<SummaryDataDTO[]> {
    const query = this.smileVsBiofarmaQuery.getSummarySmileQuery(params)
    const result = await execQuery<SummaryDataDTO[]>(query, params)
    return result
  }

  async fetchMaterialData(params: SmileVsBiofarmaQueryParams, isExcel = false) {
    const dataQuery = this.smileVsBiofarmaQuery.getQueryDataByMaterial(
      params,
      isExcel
    )
    const countQuery = this.smileVsBiofarmaQuery.getQueryPagingMaterial(params)

    const [data, count] = await Promise.all([
      execQuery<MaterialDataDTO[]>(dataQuery, params),
      execQuery<{ total: number }[]>(countQuery, params),
    ])

    return { data, count }
  }

  async searchMaterialData(params: SmileVsBiofarmaQueryParams) {
    const dataQuery = this.smileVsBiofarmaQuery.getSearchMaterialQuery(params)
    const countQuery =
      this.smileVsBiofarmaQuery.getSearchMaterialPagingQuery(params)

    const [data, count] = await Promise.all([
      execQuery<{ biofarma_nama_produk: string }[]>(dataQuery, params),
      execQuery<{ total: number }[]>(countQuery, params),
    ])

    return { data, count }
  }

  async fetchEntityData(params: SmileVsBiofarmaQueryParams, isExcel = false) {
    const dataQuery = this.smileVsBiofarmaQuery.getQueryDataByEntity(
      params,
      isExcel
    )
    const countQuery = this.smileVsBiofarmaQuery.getQueryPagingEntity(params)

    const [data, count] = await Promise.all([
      execQuery<EntityDataDTO[]>(dataQuery, params),
      execQuery<{ total: number }[]>(countQuery, params),
    ])

    return { data, count }
  }

  async fetchLastUpdated(): Promise<LastUpdatedDTO | null> {
    const query = this.smileVsBiofarmaQuery.getLastUpdatedQuery()
    const result = await execQuery<LastUpdatedDTO[]>(query)
    return result[0] || null
  }

  async fetchBiofarmaOrders(
    params: SmileVsBiofarmaQueryParams
  ): Promise<BiofarmaOrderDTO[]> {
    const query = this.smileVsBiofarmaQuery.getQueryBiofarmaOrder(params)
    const result = await execQuery<BiofarmaOrderDTO[]>(query, params)
    return result
  }
}
