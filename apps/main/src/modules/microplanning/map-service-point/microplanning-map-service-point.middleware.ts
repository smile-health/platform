import { ValidationError } from "@smile-health/lib/error.js"
import { Context } from "hono"
import { MicroplanningMapServicePointRepository } from "./microplanning-map-service-point.repository.js"
import { BaseMiddleware } from "@smile-health/lib/base/middleware.js"
import { createMiddleware } from "hono/factory"

export class MicroplanningMapServicePointMiddleware extends BaseMiddleware {
  constructor(
    private readonly repository: MicroplanningMapServicePointRepository
  ) {
    super()
  }

  detail = createMiddleware(async (ctx: Context, next: () => Promise<void>) => {
    const servicePoint =
      await this.repository.getDetailMicroplanningMapServicePointId({
        context: ctx,
      })

    if (!servicePoint) {
      throw new ValidationError(
        ctx.var.t("validator.invalid_microplanning_map_service_point_not_found")
      )
    }
    await next()
  })

  submit = createMiddleware(async (ctx: Context, next: () => Promise<void>) => {
    const servicePoint =
      await this.repository.getDetailMicroplanningMapServicePointId({
        context: ctx,
      })
    const servicePointId = servicePoint?.id as number

    // If update action, check if exists
    if (servicePointId) {
      // Check if exists
      const exists =
        await this.repository.getDetailMicroplanningMapServicePointId({
          context: ctx,
        })
      if (!exists) {
        throw new ValidationError(
          ctx.var.t(
            "validator.invalid_microplanning_map_service_point_not_found"
          )
        )
      }
    }

    await next()
  })
}
