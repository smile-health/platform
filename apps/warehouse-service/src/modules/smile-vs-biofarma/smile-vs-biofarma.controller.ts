import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { USER_ROLE } from "@/common/constants/role.js"
import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { BaseController } from "@smile/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { SmileVsBiofarmaModule } from "./smile-vs-biofarma.module.js"
import { SmileVsBiofarmaQueryParamsSchema } from "./smile-vs-biofarma.schema.js"

export class SmileVsBiofarmaController extends BaseController {
  constructor(
    private readonly module: SmileVsBiofarmaModule,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("smile_vs_biofarma")
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
      "/summary",
      this.validateRequest("query", SmileVsBiofarmaQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        queryParams.program_id = c.var.programId
        const response = await this.module.getSummaryData(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/material",
      this.validateRequest("query", SmileVsBiofarmaQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        queryParams.program_id = c.var.programId
        const response = await this.module.getListDataByMaterial(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/material/search",
      this.validateRequest("query", SmileVsBiofarmaQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        queryParams.program_id = c.var.programId
        const response = await this.module.searchMaterial(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/entity",
      this.validateRequest("query", SmileVsBiofarmaQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        queryParams.program_id = c.var.programId
        const response = await this.module.getListDataByEntity(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.get(
      "/export",
      this.validateRequest("query", SmileVsBiofarmaQueryParamsSchema),
      async (c) => {
        const queryParams = c.req.valid("query")
        queryParams.program_id = c.var.programId
        const file = await this.module.getExport(c, queryParams)
        return this.downloadExcel(c, file)
      }
    )

    return router
  }
}
