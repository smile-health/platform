import { Context } from "hono"
import { MicroplanningMapServicePointRepository } from "./microplanning-map-service-point.repository.js"
import { SubmitMicroplanningMapServicePointRequest } from "./microplanning-map-service-point.schema.js"

export class MicroplanningMapServicePointModule {
  constructor(
    private readonly repository: MicroplanningMapServicePointRepository
  ) {}

  async data({ context }: { context: Context }) {
    const result = await this.repository.getDetailMicroplanningMapServicePoint({
      context,
    })

    if (!result) {
      const { userEntity } = context.var

      return {
        entity: {
          id: userEntity.id,
          name: userEntity.name,
        },
        latitude: Number(userEntity.lat),
        longitude: Number(userEntity.lng),
      }
    }

    return result
  }

  async submit({
    context,
    body,
  }: {
    context: Context
    body: SubmitMicroplanningMapServicePointRequest
  }) {
    const result = await this.repository.submitMicroplanningMapServicePoint({
      context,
      body,
    })
    return result
  }

  async delete({ context }: { context: Context }) {
    const result = await this.repository.deleteMicroplanningMapServicePoint({
      context,
    })
    return result
  }
}
