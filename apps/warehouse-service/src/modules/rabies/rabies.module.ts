import { PaginatedResponse } from "@smile-health/lib/types/paginate.js"
import { RabiesRepository } from "./rabies.repostitory.js"
import { RabiesQueryParams } from "./rabies.schema.js"
import { Context } from "hono"
import { RabiesExcel } from "./rabies.excel.js"

export class RabiesModule {
  constructor(
    private readonly rabiesRepo: RabiesRepository,
    private readonly rabiesExcel: RabiesExcel
  ) { }

  async rabiesCoverage(queryParams: RabiesQueryParams) {
    const data = await this.rabiesRepo.getRabiesCoverage(queryParams)

    return {
      data
    }
  }

  async recipientVaccine(queryParams: RabiesQueryParams) {
    const data = await this.rabiesRepo.getRecipientVaccine(queryParams)

    return {
      data
    }
  }

  async rabiesMonthlyInjection(queryParams: RabiesQueryParams) {
    const data = await this.rabiesRepo.getRabiesMonthlyInjection(queryParams)
    return {
      data
    }
  }

  async monthlyVaccineSequences(c: Context, queryParams: RabiesQueryParams) {
    const data_sequences = await this.rabiesRepo.getRabiesVaccineSequences(queryParams)
    const data_monthly = await this.rabiesRepo.getDataMonthlySequences(queryParams)
    const data = this.rabiesRepo.transformDataMonthlySequences(c, data_monthly, data_sequences)
    return {
      data
    }
  }

  async consumptionByProvince(c: Context, queryParams: RabiesQueryParams) {
    const { data, headers, count, grand_total } = await this.rabiesRepo.rabiesConsumptionByProvince(c, queryParams)
    return {
      ...new PaginatedResponse(queryParams, data, count),
      headers,
      grand_total
    }
  }

  async consumptionByRegency(c: Context, queryParams: RabiesQueryParams) {
    const { data, headers, count } = await this.rabiesRepo.rabiesConsumptionByRegency(c, queryParams)
    return {
      ...new PaginatedResponse(queryParams, data, count),
      headers
    }
  }

  async rabiesTransactionConsumptionDetail(c: Context, queryParams: RabiesQueryParams) {
    const { data, count } = await this.rabiesRepo.rabiesTransactionConsumptionDetail(c, queryParams)
    return {
      ...new PaginatedResponse(queryParams, data, count)
    }
  }

  async rabiesTransactionConsumptionExcel(c: Context, queryParams: RabiesQueryParams) {
    const data = await this.rabiesRepo.getTransactionConsumptionsXLS(c, queryParams)
    return await this.rabiesExcel.generateReportExport(c, queryParams, data)
  }

  async rabiesCascade(c: Context, queryParams: RabiesQueryParams) {
    const data = await this.rabiesRepo.getRabiesCascade(c, queryParams)
    return {
      data
    }
  }

}
