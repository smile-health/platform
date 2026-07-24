import { BaseController } from "@smile/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { ExecutiveUserModule } from "./executive-user.module.js"
import {
  UpdateLastLoginSchema,
  ValidateUserExistsSchema,
} from "./executive-user.schema.js"

export class ExecutiveUserController extends BaseController {
  constructor(private readonly module: ExecutiveUserModule) {
    super("executive-user")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.post(
      "/update-last-login",
      this.validateRequest("json", UpdateLastLoginSchema),
      async (c) => {
        const data = c.req.valid("json")
        await this.module.updateUserLastAndFcmByUUID(
          c,
          data,
          c.var.user.keycloak_uuid ?? c.var.user.user_uuid ?? ""
        )
        return c.json({ success: true }, StatusCodes.OK)
      }
    )

    router.post(
      "/validate-exists",
      this.validateRequest("json", ValidateUserExistsSchema),
      async (c) => {
        const { username } = c.req.valid("json")
        const result = await this.module.validateUserExists(c, username)
        return c.json({
          code: StatusCodes.OK,
          success: true,
          data: result,
        })
      }
    )

    return router
  }
}
