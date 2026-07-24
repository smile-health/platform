import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"
import { BaseController } from "@smile/lib/base/controller.js"
import { NotifyRevisionModule } from "./notify-revision.module.js"
import {
  NotifyRevisionBodySchema,
  ListRevisionQuerySchema,
} from "./notify-revision.schema.js"

export class NotifyRevisionController extends BaseController {
  constructor(private readonly module: NotifyRevisionModule) {
    super()
  }

  getRoutes(): Hono {
    const router = new Hono()

    /**
     * POST /bmhp-approval/revisions/notify
     * Send a revision notification to a Puskesmas.
     * Body: { approval_period_id, puskesmas_entity_id, message }
     */
    router.post(
      "/revisions/notify",
      this.validateRequest("json", NotifyRevisionBodySchema),
      async (c) => {
        const body = c.req.valid("json")
        const result = await this.module.sendNotification(c, body)
        return c.json(result, StatusCodes.CREATED)
      }
    )

    /**
     * GET /bmhp-approval/revisions
     * List revision notifications (for Puskesmas mobile).
     * Query: ?year=2027&puskesmas_id=X&page=1&paginate=10
     */
    router.get(
      "/revisions",
      this.validateRequest("query", ListRevisionQuerySchema),
      async (c) => {
        const query = c.req.valid("query")
        const result = await this.module.listNotifications(c, query)
        return c.json(result, StatusCodes.OK)
      }
    )

    /**
     * PATCH /bmhp-approval/revisions/:id/resolve
     * Mark a revision notification as resolved (empty body).
     */
    router.patch("/revisions/:id/resolve", async (c) => {
      const id = Number(c.req.param("id"))
      const result = await this.module.resolveNotification(c, id)
      return c.json(result, StatusCodes.OK)
    })

    return router
  }
}
