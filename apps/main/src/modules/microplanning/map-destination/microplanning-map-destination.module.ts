import { Context } from "hono"
import { MicroplanningMapDestinationRepository } from "./microplanning-map-destination.repository.js"
import {
  SubmitMicroplanningMapDestinationRequest,
  GetListMicroplanningMapDestinationParams,
} from "./microplanning-map-destination.schema.js"

export class MicroplanningMapDestinationModule {
  constructor(
    private readonly repository: MicroplanningMapDestinationRepository
  ) {}

  private autoLabel({ context, item }) {
    const result = { ...item }

    for (const key in result) {
      const value = result[key]

      if (
        value &&
        typeof value === "object" &&
        "name" in value &&
        typeof value.name === "string"
      ) {
        result[key] = {
          ...value,
          id: Number(value.id),
          name: context.var.t(`${key}.label.${value.name}`),
        }
      }
    }

    return result
  }

  async list({
    context,
    params,
  }: {
    context: Context
    params: GetListMicroplanningMapDestinationParams
  }) {
    const rawList = await this.repository.getListMicroplanningMapDestination({
      context,
      params,
    })
    const list = rawList.map((item) => this.autoLabel({ context, item }))
    return {
      data: list,
    }
  }

  async create({
    context,
    body,
  }: {
    context: Context
    body: SubmitMicroplanningMapDestinationRequest
  }) {
    const result = await this.repository.submitMicroplanningMapDestination({
      context,
      body,
    })
    return result
  }

  async delete({ context, id }: { context: Context; id: number }) {
    const result = await this.repository.deleteMicroplanningMapDestination({
      context,
      id,
    })
    return result
  }
}
