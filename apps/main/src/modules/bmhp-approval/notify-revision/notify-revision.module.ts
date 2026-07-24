import { Context } from "hono"
import { NotifyRevisionRepository } from "./notify-revision.repository.js"
import type {
  NotifyRevisionBody,
  ListRevisionQuery,
} from "./notify-revision.schema.js"

export class NotifyRevisionModule {
  constructor(private readonly repository: NotifyRevisionRepository) {}

  /**
   * POST /bmhp-approval/revisions/notify
   * Send a revision notification to a Puskesmas.
   */
  async sendNotification(c: Context, body: NotifyRevisionBody) {
    const year = await this.repository.getYearByProgramPlan(
      c,
      body.program_plan_id
    )
    if (!year) throw new Error("Program plan tidak ditemukan")

    const globalEntityId = await this.repository.getGlobalEntityId(c)
    if (!globalEntityId) throw new Error("Entity kabupaten tidak ditemukan")

    const approvalPeriodId = await this.repository.getOrCreateApprovalPeriod(
      c,
      globalEntityId,
      year
    )

    const id = await this.repository.insertNotification(c, {
      approval_period_id: approvalPeriodId,
      puskesmas_entity_id: body.puskesmas_entity_id,
      message: body.message,
    })

    // TODO: push Firebase notification to Puskesmas mobile app
    // await firebaseService.send({ entity_id: body.puskesmas_entity_id, title: "Revisi BMHP", body: body.message })

    return { id, message: "Notifikasi revisi berhasil dikirim" }
  }

  /**
   * GET /bmhp-approval/revisions
   * List revision notifications with pagination (mobile friendly).
   */
  async listNotifications(c: Context, query: ListRevisionQuery) {
    const { page = 1, paginate = 10, program_plan_id, puskesmas_id } = query

    const { rows, total } = await this.repository.listNotifications(c, {
      page,
      paginate,
      programPlanId: program_plan_id,
      puskesmasId: puskesmas_id,
    })

    const totalPage = Math.ceil(total / paginate)

    return {
      page,
      item_per_page: paginate,
      total_item: total,
      total_page: totalPage,
      data: rows,
    }
  }

  /**
   * PATCH /bmhp-approval/revisions/:id/resolve
   * Mark a revision notification as resolved.
   */
  async resolveNotification(c: Context, id: number) {
    const updated = await this.repository.resolveNotification(c, id)

    if (!updated) {
      return {
        success: false,
        message: "Notifikasi tidak ditemukan atau sudah dihapus",
      }
    }

    return { success: true, message: "Revisi berhasil ditandai selesai" }
  }
}
