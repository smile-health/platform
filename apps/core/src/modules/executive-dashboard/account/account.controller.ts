import { Hono } from "hono"
import { ExecutiveAccountModule } from "./account.module.js"
import {
  LoginRequest,
  LoginSchema,
  UpdatePasswordRequest,
  UpdateStatusSchema,
} from "./account.schema.js"
import { BaseController } from "@smile-health/lib/base/controller.js"
import { ExecutiveAccountMiddleware } from "./account.middleware.js"
import { StatusCodes } from "http-status-codes"
import { RoleValidationMiddleware } from "@/common/middlewares/role-validation.middleware.js"

export class ExecutiveAccountController extends BaseController {
  constructor(
    private readonly roleValidationMiddleware: RoleValidationMiddleware,
    private readonly module: ExecutiveAccountModule,
    private readonly middleware: ExecutiveAccountMiddleware
  ) {
    super("executive-account")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.post(
      "/",
      this.roleValidationMiddleware.onlySuperAdmin,
      this.validateRequest("json", this.middleware.create),
      async (c) => {
        const req = c.req.valid("json")
        const resp = await this.module.create(c, req)

        return c.json(resp, StatusCodes.OK)
      }
    )

    router.get(
      "/",
      this.roleValidationMiddleware.onlySuperAdmin,
      this.validateRequest("query", this.middleware.list),
      async (c) => {
        const data = c.req.valid("query")
        const resp = await this.module.getList(c, data)
        return c.json(resp, StatusCodes.OK)
      }
    )

    router.post(
      "/login",
      this.validateRequest("json", LoginSchema),
      async (c) => {
        const req: LoginRequest = c.req.valid("json")
        const { ...resp } = await this.module.login(c, req)

        return c.json(resp, StatusCodes.OK)
      }
    )

    router.post("/logout", async (c) => {
      await this.module.logout(c)
      return c.body(null, 204)
    })

    router.post(
      "/update-password",
      this.validateRequest("json", this.middleware.updatePassword),
      async (c) => {
        const data: UpdatePasswordRequest = c.req.valid("json")
        await this.module.updatePassword(c, data)
        return c.json({
          status: true,
          message: c.var.t("account.label.update_password_success"),
        })
      }
    )

    router.get("/profile", async (c) => {
      const id = c.var.accountID
      const { ...resp } = await this.module.detail(c, id)
      return c.json(resp, StatusCodes.OK)
    })

    router.put(
      "/profile",
      this.validateRequest("json", this.middleware.updateProfile),
      async (c) => {
        const id = c.var.accountID
        const data = c.req.valid("json")
        data.updated_by = c.var.accountID
        const rsp = await this.module.update(c, data, Number(id))
        return c.json(rsp)
      }
    )

    router.get(
      "/:id/chg_history",
      this.validateRequest("param", this.middleware.checkUserExist),
      async (c) => {
        const id = c.req.valid("param").id
        const result = await this.module.getChangeLogs(c, Number(id))
        return c.json(result, StatusCodes.OK)
      }
    )

    router.put(
      "/:id/status",
      this.validateRequest("param", this.middleware.checkUserExist),
      this.validateRequest("json", UpdateStatusSchema),
      async (c) => {
        const param = c.req.valid("param")
        const data = c.req.valid("json")
        const result = await this.module.updateStatus(c, Number(param.id), data)
        return c.json(result, StatusCodes.OK)
      }
    )

    router.put(
      "/:id",
      this.roleValidationMiddleware.onlySuperAdmin,
      this.validateRequest("json", this.middleware.updateUser),
      async (c) => {
        const id = c.req.param("id")
        const data = c.req.valid("json")
        data.updated_by = c.var.accountID
        const rsp = await this.module.update(c, data, Number(id))
        return c.json(rsp)
      }
    )

    router.get(
      "/:id",
      this.roleValidationMiddleware.onlySuperAdmin,
      async (c) => {
        const id = c.req.param("id")
        const resp = await this.module.detail(c, Number(id))
        return c.json(resp, StatusCodes.OK)
      }
    )

    return router
  }
}
