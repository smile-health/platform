import { Context } from "hono"
import { execQuery } from "@/common/infrastructure/database/index.js"
import { ValueChainQuery } from "./value-chain.query.js"
import { SortingDataDTO, WeighingDataDTO, StorageDataDTO, TransportationDataDTO, ThirdPartyTreatmentDataDTO, InternalTreatmentDataDTO, TreatmentResultDataDTO, TransportationResultDataDTO, RecyclingBeneficialUseDataDTO, FinalDisposalDataDTO } from "./value-chain.schema.js"
import moment from "moment"

export class ValueChainRepository {
  constructor(private readonly query: ValueChainQuery) {}

  async fetchSortingData(c: Context): Promise<SortingDataDTO[]> {
    const query = this.query.getSortingDataQuery()
    const result = await execQuery<SortingDataDTO[]>(query, {})
    return result
  }

  async fetchWeighingData(c: Context): Promise<WeighingDataDTO[]> {
    const query = this.query.getWeighingDataQuery()
    const result = await execQuery<WeighingDataDTO[]>(query, {})
    return result
  }

  async fetchStorageData(c: Context): Promise<StorageDataDTO[]> {
    const query = this.query.getStorageDataQuery()
    const result = await execQuery<StorageDataDTO[]>(query, {})
    return result
  }

  async fetchTransportationData(c: Context): Promise<TransportationDataDTO[]> {
    const query = this.query.getTransportationDataQuery()
    const result = await execQuery<TransportationDataDTO[]>(query, {})
    return result
  }

  async fetchThirdPartyTreatmentData(c: Context): Promise<ThirdPartyTreatmentDataDTO[]> {
    const query = this.query.getThirdPartyTreatmentDataQuery()
    const result = await execQuery<ThirdPartyTreatmentDataDTO[]>(query, {})
    return result
  }

  async fetchInternalTreatmentData(c: Context): Promise<InternalTreatmentDataDTO[]> {
    const query = this.query.getInternalTreatmentDataQuery()
    const result = await execQuery<InternalTreatmentDataDTO[]>(query, {})
    return result
  }

  async fetchTreatmentResultData(c: Context): Promise<TreatmentResultDataDTO[]> {
    const query = this.query.getTreatmentResultDataQuery()
    const result = await execQuery<TreatmentResultDataDTO[]>(query, {})
    return result
  }

  async fetchTransportationResultData(c: Context): Promise<TransportationResultDataDTO[]> {
    const query = this.query.getTransportationResultDataQuery()
    const result = await execQuery<TransportationResultDataDTO[]>(query, {})
    return result
  }

  async fetchRecyclingBeneficialUseData(c: Context): Promise<RecyclingBeneficialUseDataDTO[]> {
    const query = this.query.getRecyclingBeneficialUseDataQuery()
    const result = await execQuery<RecyclingBeneficialUseDataDTO[]>(query, {})
    return result
  }

  async fetchFinalDisposalData(c: Context): Promise<FinalDisposalDataDTO[]> {
    const query = this.query.getFinalDisposalDataQuery()
    const result = await execQuery<FinalDisposalDataDTO[]>(query, {})
    return result
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
