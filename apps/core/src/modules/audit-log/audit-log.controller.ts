import { RoleValidationMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BaseController } from "../base.controller.js"
import { AuditLogMiddleware } from "./audit-log.middleware.js"
import { AuditLogModule } from "./audit-log.module.js"
import { UpdateAuditLogSettingsSchema } from "./audit-log.schema.js"

export class AuditLogController extends BaseController {
  constructor(
    private readonly roleValidationMiddleware: RoleValidationMiddleware,
    private readonly module: AuditLogModule,
    private readonly middleware: AuditLogMiddleware
  ) {
    super()
  }

  getRoutes(): Hono {
    const router = new Hono()

    // list audit trail — superadmin only, read-only (Global Settings)
    router.get(
      "/",
      this.roleValidationMiddleware.onlySuperAdmin,
      this.validateRequest("query", this.middleware.list),
      async (c) => {
        const query = c.req.valid("query")
        const response = await this.module.list(c, query)
        return c.json(response, StatusCodes.OK)
      }
    )

    // Static routes stay above any future "/:id" route.
    router.get(
      "/settings",
      this.roleValidationMiddleware.onlySuperAdmin,
      async (c) => {
        const response = await this.module.getSettings(c)
        return c.json(response, StatusCodes.OK)
      }
    )

    router.put(
      "/settings",
      this.roleValidationMiddleware.onlySuperAdmin,
      this.validateRequest("json", UpdateAuditLogSettingsSchema),
      async (c) => {
        const body = c.req.valid("json")
        const response = await this.module.updateSettings(c, body)
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
