import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { USER_ROLE } from "@/common/constants/role.js"
import { BaseController } from "@smile/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { AssetModule } from "./asset.module.js"
import { AssetQueryParamsSchema } from "./asset.schema.js"

export class AssetController extends BaseController {
  constructor(
    private readonly module: AssetModule,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("asset")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.use(
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
      ])
    )

    router.get("/asset", async (c) => {
      const rawParams = c.req.query()
      const queryParams = AssetQueryParamsSchema.parse(rawParams)
      
      const response = await this.module.getAssetData(c, queryParams)
      return c.json(response, StatusCodes.OK)
    })

    return router
  }
}
