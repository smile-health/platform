import { Hono } from "hono"
import { ExecutiveWorkspaceModule } from "./workspace.module.js"
import { BaseController } from "@smile/lib/base/controller.js"
import { ExecutiveWorkspaceMiddleware } from "./workspace.middleware.js"

export class ExecutiveWorkspaceController extends BaseController {
  constructor(
    private readonly module: ExecutiveWorkspaceModule,
    private readonly middleware: ExecutiveWorkspaceMiddleware
  ) {
    super("executive-workspace")
  }

  getRoutes(): Hono {
    const router = new Hono()

    router.get(
      "/",
      this.validateRequest("query", this.middleware.list),
      async (c) => {
        const q = c.req.valid("query")
        const result = await this.module.getList(c, q)
        return c.json(result, 200)
      }
    )

    return router
  }
}
