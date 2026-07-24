import { ValidationError } from "@smile/lib/error.js"
import { Context } from "hono"
import { MicroplanningMapRouteRepository } from "./microplanning-map-route.repository.js"
import { SubmitMicroplanningMapRouteRequest } from "./microplanning-map-route.schema.js"
import { BaseMiddleware } from "@smile/lib/base/middleware.js"
import { createMiddleware } from "hono/factory"

export class MicroplanningMapRouteMiddleware extends BaseMiddleware {
  constructor(private readonly repository: MicroplanningMapRouteRepository) {
    super()
  }

  createResolvedServicePoint = createMiddleware(
    async (ctx: Context, next: () => Promise<void>) => {
      const servicePoint = await this.repository.findServicePoint({
        c: ctx,
      })

      if (!servicePoint) {
        throw new ValidationError(
          ctx.var.t("validator.invalid_service_point_id")
        )
      }

      ctx.set("resolvedServicePoint", servicePoint)

      await next()
    }
  )

  submit = createMiddleware(async (ctx: Context, next: () => Promise<void>) => {
    const body = await ctx.req.json<SubmitMicroplanningMapRouteRequest>()
    const { destination_ids } = body

    // Avoid duplicates destination_id in body request
    const uniqueDestinationIds = [...new Set(destination_ids)]
    if (destination_ids.length !== uniqueDestinationIds.length) {
      throw new ValidationError(
        ctx.var.t("validator.invalid_destination_id_duplicate")
      )
    }

    const destinations = await this.repository.findDestinations({
      c: ctx,
      servicePointId: Number(ctx.var.resolvedServicePoint?.id),
      destinationIds: destination_ids,
    })

    if (destinations.length !== destination_ids.length) {
      throw new ValidationError(
        ctx.var.t("validator.invalid_destination_not_found")
      )
    }

    ctx.set("resolvedDestinations", destinations)

    await next()
  })

  delete = createMiddleware(async (ctx: Context, next: () => Promise<void>) => {
    const microplanningMapRoute =
      await this.repository.getIdMicroplanningMapRoute({
        context: ctx,
      })
    if (!microplanningMapRoute) {
      throw new ValidationError(
        ctx.var.t("validator.invalid_microplanning_map_route_not_found")
      )
    }
    await next()
  })
}
