import { Context } from "hono"
import { MicroplanningMapRouteRepository } from "./microplanning-map-route.repository.js"
import { SubmitMicroplanningMapRouteRequest } from "./microplanning-map-route.schema.js"

export class MicroplanningMapRouteModule {
  constructor(private readonly repository: MicroplanningMapRouteRepository) {}

  private autoLabel({ context, item }) {
    const cloned = structuredClone(item)

    if (!cloned.route_stops) return null
    for (const stop of cloned.route_stops) {
      // Prefix destination_category name
      stop.destination.destination_category.name = context.var.t(
        `destination_category.label.${stop.destination.destination_category.name}`
      )
      // Prefix road_type name
      stop.road_type.name = context.var.t(
        `road_type.label.${stop.road_type.name}`
      )
      // Prefix destination_type name
      stop.destination.destination_type.name = context.var.t(
        `destination_type.label.${stop.destination.destination_type.name}`
      )
    }

    return cloned
  }

  async detail({ context }: { context: Context }) {
    const rawData = await this.repository.getDetailMicroplanningMapRoute({
      context,
    })

    if (!rawData) return { data: null }

    return {
      data: this.autoLabel({
        context,
        item: rawData,
      }),
    }
  }

  async create({
    context,
    body,
  }: {
    context: Context
    body: SubmitMicroplanningMapRouteRequest
  }) {
    const result = await this.repository.submitMicroplanningMapRoute({
      context,
      body,
    })
    return result
  }

  async delete({ context }: { context: Context }) {
    const result = await this.repository.deleteMicroplanningMapRoute({
      context,
    })
    return result
  }
}
