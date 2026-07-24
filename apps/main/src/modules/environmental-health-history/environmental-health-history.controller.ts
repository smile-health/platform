import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { EnvironmentalHealthHistoryModule } from "./environmental-health-history.module.js"
import { EnvironmentalHealthHistoryMiddleware } from "./environmental-health-history.middleware.js"
import {
  GetHistoryParamSchema,
  DeleteHistoryParamSchema,
  ExportPdfHistoryParamSchema,
} from "./environmental-health-history.schema.js"
import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { USER_ROLE } from "@/common/constants/user.js"
import { DEVICE_TYPE } from "@/common/constants/device.js"

export class EnvironmentalHealthHistoryController extends BaseController {
  constructor(
    private readonly module: EnvironmentalHealthHistoryModule,
    private readonly middleware: EnvironmentalHealthHistoryMiddleware,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("environmental_health_history")
  }

  getRoutes(): Hono {
    const router = new Hono()

    // GET / — List (paginated, filterable, sortable)
    router.get(
      "/",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
      ]),
      this.validateRequest("query", this.middleware.list),
      async (c) => {
        const params = c.req.valid("query")
        const response = await this.module.list(c, params)
        return c.json(response, StatusCodes.OK)
      }
    )

    // GET /export/xls — Export Excel
    router.get(
      "/export/xls",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
      ]),
      this.validateRequest("query", this.middleware.list),
      async (c) => {
        const params = c.req.valid("query")
        const file = await this.module.exportExcel(c, params)

        const base64 = Buffer.from(file.buffer).toString("base64")

        return c.json({
          filename: file.filename,
          base64: base64,
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      }
    )

    // GET /export/pdf/:id — Export PDF single record
    router.get(
      "/export/pdf/:id",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
      ]),
      this.validateRequest("param", ExportPdfHistoryParamSchema),
      this.middleware.exportPdf,
      async (c) => {
        const param = c.req.valid("param")
        const result = await this.module.exportPdf(c, Number(param.id))
        return c.json(result, StatusCodes.OK)
      }
    )

    // GET /:id — Detail
    router.get(
      "/:id",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
      ]),
      this.validateRequest("param", GetHistoryParamSchema),
      this.middleware.detail,
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, Number(param.id))
        return c.json(response, StatusCodes.OK)
      }
    )

    // DELETE /:id — Soft delete
    router.delete(
      "/:id",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
      ]),
      this.validateRequest("param", DeleteHistoryParamSchema),
      this.middleware.delete,
      async (c) => {
        const param = c.req.valid("param")
        await this.module.delete(c, Number(param.id))
        return c.json(undefined, StatusCodes.NO_CONTENT)
      }
    )

    return router
  }
}
