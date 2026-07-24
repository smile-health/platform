import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { USER_ROLE } from "@/common/constants/role.js"
import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { Hono } from "hono"
import { BaseController } from "@smile/lib/base/controller.js"
import { StatusCodes } from "http-status-codes"
import { RabiesModule } from "./rabies.module.js"
import { RabiesQueryParamsSchema } from "./rabies.schema.js"

export class RabiesController extends BaseController {
  constructor(
    private readonly rabiesModule: RabiesModule,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("datamart_transactions_rabies")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.use(
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
        [USER_ROLE.SATUSEHAT, DEVICE_TYPE.web],
      ])
    )

    router.get(
      "/program-coverage",
      this.validateRequest("query", RabiesQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.rabiesModule.rabiesCoverage(queryParams)

        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/recipient-vaccine",
      this.validateRequest("query", RabiesQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.rabiesModule.recipientVaccine(queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/monthly-patient-injection",
      this.validateRequest("query", RabiesQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.rabiesModule.rabiesMonthlyInjection(queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/monthly-vaccine-sequence",
      this.validateRequest("query", RabiesQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.rabiesModule.monthlyVaccineSequences(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/provinces",
      this.validateRequest("query", RabiesQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.rabiesModule.consumptionByProvince(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/regencies",
      this.validateRequest("query", RabiesQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.rabiesModule.consumptionByRegency(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/entities",
      this.validateRequest("query", RabiesQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.rabiesModule.rabiesTransactionConsumptionDetail(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/export",
      this.validateRequest("query", RabiesQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const file = await this.rabiesModule.rabiesTransactionConsumptionExcel(c, queryParams)
        return this.downloadExcel(c, file)
      }
    )

    router.get(
      "/funnel-vaccine-sequence",
      this.validateRequest("query", RabiesQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        const response = await this.rabiesModule.rabiesCascade(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
