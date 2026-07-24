import { Context } from "hono"
import { ValueChainRepository } from "./value-chain.repository.js"
import {
  ValueChainQueryParams,
  ValueChainResponse,
} from "./value-chain.schema.js"
import { buildSortingPhase, buildWeighingPhase, buildStoragePhase, buildTransportationPhase, buildThirdPartyTreatmentPhase, buildInternalTreatmentPhase, buildTreatmentResultPhase, buildTransportationResultPhase, buildRecyclingBeneficialUsePhase, buildFinalDisposalPhase } from "./value-chain.util.js"

export class ValueChainModule {
  constructor(private readonly repository: ValueChainRepository) {}

  async getValueChainData(
    c: Context,
    queryParams: ValueChainQueryParams
  ): Promise<ValueChainResponse> {
    const [sortingData, weighingData, storageData, transportationData, thirdPartyTreatmentData, internalTreatmentData, treatmentResultData, transportationResultData, recyclingBeneficialUseData, finalDisposalData, lastUpdated] = await Promise.all([
      this.repository.fetchSortingData(c),
      this.repository.fetchWeighingData(c),
      this.repository.fetchStorageData(c),
      this.repository.fetchTransportationData(c),
      this.repository.fetchThirdPartyTreatmentData(c),
      this.repository.fetchInternalTreatmentData(c),
      this.repository.fetchTreatmentResultData(c),
      this.repository.fetchTransportationResultData(c),
      this.repository.fetchRecyclingBeneficialUseData(c),
      this.repository.fetchFinalDisposalData(c),
      this.repository.getLastUpdate(c),
    ])

    // Build phases
    const sortingPhase = buildSortingPhase(c, sortingData)
    const weighingPhase = buildWeighingPhase(c, weighingData)
    const storagePhase = buildStoragePhase(c, storageData)
    const transportationPhase = buildTransportationPhase(c, transportationData)
    const thirdPartyTreatmentPhase = buildThirdPartyTreatmentPhase(c, thirdPartyTreatmentData)
    const internalTreatmentPhase = buildInternalTreatmentPhase(c, internalTreatmentData)
    const treatmentResultPhase = buildTreatmentResultPhase(c, treatmentResultData)
    const transportationResultPhase = buildTransportationResultPhase(c, transportationResultData)
    const recyclingBeneficialUsePhase = buildRecyclingBeneficialUsePhase(c, recyclingBeneficialUseData)
    const finalDisposalPhase = buildFinalDisposalPhase(c, finalDisposalData)

    return {
      last_updated: lastUpdated,
      data: {
        "01": sortingPhase,
        "02": weighingPhase,
        "03": storagePhase,
        "external_processing": {
          "04_a": transportationPhase,
          "05": thirdPartyTreatmentPhase,
        },
        "internal_processing": {
          "04_b": internalTreatmentPhase,
          "05": treatmentResultPhase,
          "06": transportationResultPhase,
          "07_a": recyclingBeneficialUsePhase,
          "07_b": finalDisposalPhase,
        }
      },
    }
  }
}
