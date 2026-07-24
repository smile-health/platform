import { Context } from "hono"
import { HumidityThresholdRepository } from "./humidity-threshold.repository"
import { GetHumidityThresholdsQueryParams } from "./humidity-threshold.schema"
import { PaginatedResponse } from "@smile/lib/types/paginate"

export class HumidityThresholdModule {
  constructor(private readonly repository: HumidityThresholdRepository) {}

  async list(c: Context, params: GetHumidityThresholdsQueryParams) {
    const { data, total } = await this.repository.list(c, params)

    if (data.length === 0) {
      return new PaginatedResponse(params)
    }

    return new PaginatedResponse(params, data, total)
  }
}