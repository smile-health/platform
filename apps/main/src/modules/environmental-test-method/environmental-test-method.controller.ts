import { BaseController } from "@smile-health/lib/base/controller.js"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { EnvironmentalTestMethodModule } from "./environmental-test-method.module.js"
import { EnvironmentalTestMethodMiddleware } from "./environmental-test-method.middleware.js"
import {
  GetEnvironmentalTestMethodParamSchema,
  UpdateEnvironmentalTestMethodParamSchema,
  DeleteEnvironmentalTestMethodParamSchema,
} from "./environmental-test-method.schema.js"
import { RoleMiddleware } from "@/common/middlewares/role-validation.middleware.js"
import { USER_ROLE } from "@/common/constants/user.js"
import { DEVICE_TYPE } from "@/common/constants/device.js"

export class EnvironmentalTestMethodController extends BaseController {
  constructor(
    private readonly module: EnvironmentalTestMethodModule,
    private readonly middleware: EnvironmentalTestMethodMiddleware,
    private readonly roleMiddleware: RoleMiddleware
  ) {
    super("environmental_test_method")
  }

  getRoutes(): Hono {
    const router = new Hono()

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

    router.get(
      "/:id",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
        [USER_ROLE.MANAGER, DEVICE_TYPE.web],
      ]),
      this.validateRequest("param", GetEnvironmentalTestMethodParamSchema),
      this.middleware.detail,
      async (c) => {
        const param = c.req.valid("param")
        const response = await this.module.detail(c, Number(param.id))
        return c.json(response, StatusCodes.OK)
      }
    )

    router.post(
      "/",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
      ]),
      this.validateRequest("json", this.middleware.create),
      async (c) => {
        const body = c.req.valid("json")
        const response = await this.module.create(c, body)
        return c.json(response, StatusCodes.CREATED)
      }
    )

    router.put(
      "/:id",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
      ]),
      this.validateRequest("param", UpdateEnvironmentalTestMethodParamSchema),
      this.middleware.detail,
      this.validateRequest("json", this.middleware.update),
      async (c) => {
        const param = c.req.valid("param")
        const body = c.req.valid("json")
        await this.module.update(c, Number(param.id), body)
        return c.json(undefined, StatusCodes.NO_CONTENT)
      }
    )

    router.delete(
      "/:id",
      this.roleMiddleware.allowWithDeviceType([
        [USER_ROLE.SUPERADMIN, DEVICE_TYPE.web],
        [USER_ROLE.ADMIN, DEVICE_TYPE.web],
      ]),
      this.validateRequest("param", DeleteEnvironmentalTestMethodParamSchema),
      this.middleware.detail, // Changed from delete if delete middleware was not defined or used detail instead
      async (c) => {
        const param = c.req.valid("param")
        await this.module.delete(c, Number(param.id))
        return c.json(undefined, StatusCodes.NO_CONTENT)
      }
    )

    return router
  }
}
