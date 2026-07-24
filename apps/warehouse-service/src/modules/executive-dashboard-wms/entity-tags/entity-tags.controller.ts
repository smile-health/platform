import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { USER_ROLE } from "@/common/constants/role.js"
import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { EntityTagsModule } from "./entity-tags.module.js"
import { EntityTagsQueryParamsSchema } from "./entity-tags.schema.js"

export class EntityTagsController extends BaseController {
  constructor(
    private readonly module: EntityTagsModule,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("entity_tags")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.use(
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
      ])
    )

    router.get("/entity-tags", async (c) => {
      const rawParams = c.req.query()
      const queryParams = EntityTagsQueryParamsSchema.parse(rawParams)

      const response = await this.module.getEntityTags(c, queryParams)
      return c.json(response, StatusCodes.OK)
    })

    return router
  }
}
