import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { USER_ROLE } from "@/common/constants/role.js"
import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { ValueChainModule } from "./value-chain.module.js"
import { ValueChainQueryParamsSchema } from "./value-chain.schema.js"

export class ValueChainController extends BaseController {
  constructor(
    private readonly module: ValueChainModule,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("value_chain")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.use(
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
      ])
    )

    router.get(
      "/value-chain",
      async (c) => {
        const queryParams = {
        }
        const response = await this.module.getValueChainData(c, queryParams)
        return c.json(response, StatusCodes.OK)
      }
    )

    return router
  }
}
