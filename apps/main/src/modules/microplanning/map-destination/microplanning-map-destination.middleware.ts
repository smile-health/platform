import { ValidationError } from "@smile-health/lib/error.js"
import { Context } from "hono"
import { MicroplanningMapDestinationRepository } from "./microplanning-map-destination.repository.js"
import { BaseMiddleware } from "@smile-health/lib/base/middleware.js"
import { createMiddleware } from "hono/factory"
import { SubmitMicroplanningMapDestinationRequest } from "./microplanning-map-destination.schema.js"

export class MicroplanningMapDestinationMiddleware extends BaseMiddleware {
  constructor(
    private readonly repository: MicroplanningMapDestinationRepository
  ) {
    super()
  }

  submit = createMiddleware(async (ctx: Context, next: () => Promise<void>) => {
    const body = await ctx.req.json<SubmitMicroplanningMapDestinationRequest>()

    const { destinations } = body

    const idsInDestinations = destinations
      .filter((item) => item.id !== null)
      .map((item) => item.id)

    const hasDuplicates =
      new Set(idsInDestinations).size !== idsInDestinations.length

    if (hasDuplicates) {
      throw new ValidationError(ctx.var.t("validator.invalid_duplicate_ids"))
    }

    // Check Existing IDs
    const servicePoint = await this.repository.findServicePoint({
      c: ctx,
    })

    if (!servicePoint) {
      throw new ValidationError(ctx.var.t("validator.invalid_service_point_id"))
    }

    ctx.set("resolvedServicePoint", servicePoint)

    const servicePointId = servicePoint?.id

    const existingIds = await this.repository.getExistingItemsByServicePointId({
      c: ctx,
      service_point_id: servicePointId,
    })

    // Existing IDs must more or equals with body IDs
    if (existingIds.length < idsInDestinations.length) {
      throw new ValidationError(
        ctx.var.t("validator.invalid_microplanning_map_destination_not_found")
      )
    }

    // Avoid stranger ID from destinations
    const idsInDestinationsSet = new Set(idsInDestinations)
    const existingIdsSet = new Set(existingIds.map((item) => item.id))

    const diff = new Set(
      [...idsInDestinationsSet].filter((x) => !existingIdsSet.has(x as number))
    )
    if (diff.size > 0) {
      throw new ValidationError(
        ctx.var.t("validator.invalid_microplanning_map_destination_not_found")
      )
    }

    const [roadTypes, subTypes] = await Promise.all([
      this.repository.getMicroplanningConfigIds({
        context: ctx,
        key: "road_type",
      }),
      this.repository.getMicroplanningConfigIds({
        context: ctx,
        key: "destination_type",
      }),
    ])

    ctx.set("resolvedMPConfig", { subTypes })

    const roadTypeIds = new Set(roadTypes.map((item) => Number(item.id)))
    const subTypeIds = new Set(subTypes.map((item) => Number(item.id)))

    for (const destination of destinations) {
      if (!roadTypeIds.has(Number(destination.road_type))) {
        throw new ValidationError(ctx.var.t("validator.invalid_road_type_id"))
      }

      if (!subTypeIds.has(Number(destination.sub_type))) {
        throw new ValidationError(ctx.var.t("validator.invalid_sub_type_id"))
      }
    }

    await next()
  })

  delete = createMiddleware(async (ctx: Context, next: () => Promise<void>) => {
    const param = ctx.req.param()
    const { id } = param

    const servicePoint =
      await this.repository.getDetailMicroplanningMapDestination({
        context: ctx,
        id: Number(id),
      })
    if (!servicePoint) {
      throw new ValidationError(
        ctx.var.t("validator.invalid_microplanning_map_destination_not_found")
      )
    }
    await next()
  })
}
