import { NotFoundError } from "@smile/lib/error.js"
import { Context, Next } from "hono"
import { TargetsRepository } from "../targets/targets.repository.js"
import { MicroplanningRepository } from "./microplanning.repository.js"

export class MicroplanningMiddleware {
  constructor(
    private readonly repository: MicroplanningRepository,
    private readonly targetsRepository: TargetsRepository,
  ) {}

  // Resolve the target microplanning year from the X-Microplanning-Year header,
  // falling back to next year (existing behavior) when missing or invalid.
  private resolveYear(c: Context): number {
    const headerValue = c.req.header("X-Microplanning-Year")
    const parsed = Number(headerValue)

    if (headerValue && Number.isInteger(parsed) && parsed > 0) {
      return parsed
    }

    return new Date().getFullYear() + 1
  }

  // Fetch microplanning id for the resolved year and its previous year, and set to context
  fetchMicroplanningId = async (c: Context, next: Next) => {
    const year = this.resolveYear(c)
    const [prevMicroplanningId, microplanningId] =
      await this.repository.getLastTwoYearMicroplanningIds(c, year)

    c.set("prevMicroplanningId", prevMicroplanningId)
    c.set("microplanningId", microplanningId)
    c.set("microplanningYear", year)

    await next()
  }

  fetchMicroplanningIdOrThrow = async (c: Context, next: Next) => {
    const year = this.resolveYear(c)
    const [prevMicroplanningId, microplanningId] =
      await this.repository.getLastTwoYearMicroplanningIds(c, year)

    if (!microplanningId) {
      throw new NotFoundError(
        c.var.t("validator.not_found", {
          field: c.var.t("microplanning.label.microplanning"),
        })
      )
    }

    c.set("prevMicroplanningId", prevMicroplanningId)
    c.set("microplanningId", microplanningId)
    c.set("microplanningYear", year)

    await next()
  }

  fetchMicroplanningIdOrCreate = async (c: Context, next: Next) => {
    const year = this.resolveYear(c)
    const entityId = Number(c.var.entityId)

    const result = await this.targetsRepository.findOrCreateMicroplanningByYear(
      c,
      entityId,
      year
    )
    const microplanningId = Number(result.id)
    c.set("microplanningId", microplanningId)
    c.set("microplanningYear", year)

    await next()
  }
}
