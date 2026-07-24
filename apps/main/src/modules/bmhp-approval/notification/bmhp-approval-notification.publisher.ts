import { Context } from "hono"
import { Publisher } from "@smile/lib/rabbitmq/publisher.js"
import { generateEventCode } from "@smile/lib/utils.js"
import {
  NOTIFICATION_MEDIA,
  NOTIFICATION_TYPE,
  NOTIFICATION_WORKER,
} from "@smile/lib/rabbitmq/notification.js"
import { ENTITY_TAG } from "@/common/constants/entity.js"

type RevisionDetail = {
  puskesmas_entity_id: number
  puskesmas_name: string
  examinations: Array<{
    id: number
    name: string
    target_group_name: string | null
  }>
}

type UserData = {
  id: number
  username: string | null
  email: string | null
  mobile_phone: string | null
  fcm_token: string | null
  entity_id: number | null   // ws_entities.id (workspace-scoped)
  entity_tag_id: number | null
  program_id: number | null
  global_entity_id: number | null // entities.id (global) — used to match revision rows
}

/**
 * BmhpApprovalNotificationPublisher
 *
 * Handles sending BMHP approval revision notifications via RabbitMQ.
 * Sends to Firebase (FCM) for mobile push notifications to all users
 * managing puskesmas entities that have target groups needing revision.
 */
export class BmhpApprovalNotificationPublisher {
  constructor(private readonly publisher: Publisher) {}

  /**
   * Send revision notification to all users managing puskesmas entities
   * that have target groups with verification_status = 2 (needs revision).
   *
   * @param c - Hono context
   * @param programPlanId - The program plan ID being revised
   */
  async sendRevisionNotification(
    c: Context,
    programPlanId: number
  ): Promise<{
    success: boolean
    message: string
    sent_count: number
    notified_user_ids: number[]
    details: Array<{
      puskesmas_entity_id: number
      puskesmas_name: string
      users_notified: number
      examinations: string[]
    }>
  }> {
    const revisions = await this._getRevisionsByProgramPlan(c, programPlanId)

    if (revisions.length === 0) {
      return {
        success: true,
        message: "Tidak ada data yang perlu direvisi",
        sent_count: 0,
        notified_user_ids: [],
        details: [],
      }
    }

    const puskesmasEntityIds = revisions.map((r) => r.puskesmas_entity_id)

    const users = await this._getUsersByPuskesmasEntityIds(
      c,
      puskesmasEntityIds
    )

    if (users.length === 0) {
      return {
        success: true,
        message: "Tidak ada pengguna yang terdaftar di puskesmas terkait",
        sent_count: 0,
        notified_user_ids: [],
        details: [],
      }
    }

    // Key by global_entity_id so it matches revision.puskesmas_entity_id (entities.id)
    const usersByPuskesmas = new Map<number, UserData[]>()
    for (const user of users) {
      if (user.global_entity_id === null) continue
      if (!usersByPuskesmas.has(user.global_entity_id)) {
        usersByPuskesmas.set(user.global_entity_id, [])
      }
      usersByPuskesmas.get(user.global_entity_id)!.push(user)
    }

    const notificationResults: Array<{
      puskesmas_entity_id: number
      puskesmas_name: string
      users_notified: number
      examinations: string[]
    }> = []

    const notifiedUserIds: number[] = []

    const title = "Bmhp Approval Needs Revision"

    for (const revision of revisions) {
      const puskesmasUsers =
        usersByPuskesmas.get(revision.puskesmas_entity_id) || []

      if (puskesmasUsers.length === 0) continue

      const examinationDetails = revision.examinations.map((exam) => {
        if (exam.target_group_name) {
          return `${exam.name} - ${exam.target_group_name}`
        }
        return exam.name
      })

      const message = `Please revise:\n${examinationDetails
        .map((d) => `- ${d}`)
        .join("\n")}`

      let usersNotified = 0
      for (const user of puskesmasUsers) {
        const notificationUser = {
          id: user.id,
          user_id: user.id,
          email: user.email ?? "",
          mobile_phone: user.mobile_phone ?? "",
          fcm_token: user.fcm_token,
          entity_id: user.entity_id ?? revision.puskesmas_entity_id,
          province_id: null,
          regency_id: null,
        }

        const payload = {
          user: notificationUser,
          user_entity_tag_id: user.entity_tag_id ?? null,
          program_id: user.program_id ?? c.var?.programId,
          event_code: await generateEventCode(),
          title: title,
          message: message,
          type: NOTIFICATION_TYPE.BMHP_REVISION,
          template: NOTIFICATION_TYPE.BMHP_REVISION.replaceAll("-", "_"),
          variables: [title, message],
          media: NOTIFICATION_MEDIA.FIREBASE,
          worker: NOTIFICATION_WORKER.FIREBASE,
          workerMedia: NOTIFICATION_MEDIA.FIREBASE,
          titleTranslation: title,
          messageTranslation: message,
          entity_id: revision.puskesmas_entity_id,
          program_plan_id: programPlanId,
        }

        await this.publisher.publishNotification(
          c,
          NOTIFICATION_WORKER.FIREBASE,
          payload
        )
        console.log(
          `[BMHP Revision] ✓ Notification published for user ${user.username}`
        )

        notifiedUserIds.push(user.id)
        usersNotified++
      }

      notificationResults.push({
        puskesmas_entity_id: revision.puskesmas_entity_id,
        puskesmas_name: revision.puskesmas_name,
        users_notified: usersNotified,
        examinations: examinationDetails,
      })
    }

    const totalUsersNotified = notificationResults.reduce(
      (sum, r) => sum + r.users_notified,
      0
    )

    return {
      success: true,
      message: `Notifikasi revisi berhasil dikirim ke ${totalUsersNotified} pengguna di ${notificationResults.length} puskesmas`,
      sent_count: totalUsersNotified,
      notified_user_ids: notifiedUserIds,
      details: notificationResults,
    }
  }

  /**
   * Get all target groups with verification_status = 2 for a program_plan_id.
   * Groups by puskesmas entity and returns examination names.
   */
  private async _getRevisionsByProgramPlan(
    c: Context,
    programPlanId: number
  ): Promise<RevisionDetail[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any = await (c.var.trx as any)
      .selectFrom("ws_bmhp_planning_target_groups as wptg")
      .innerJoin("ws_bmhp_planning as wp", "wp.id", "wptg.planning_id")
      .innerJoin(
        "ws_bmhp_approval_periods as wap",
        "wap.id",
        "wp.approval_period_id"
      )
      .innerJoin("bmhp_examinations as be", "be.id", "wp.examination_id")
      .innerJoin("entities as e", "e.id", "wp.entity_id")
      .leftJoin("target_groups as tg", "tg.id", "wptg.target_group_id")
      .select([
        "wp.entity_id as puskesmas_entity_id",
        "e.name as puskesmas_name",
        "be.id as examination_id",
        "be.name as examination_name",
        "tg.title as target_group_name",
      ])
      .where("wptg.verification_status", "=", 2)
      .where("wptg.deleted_at", "is", null)
      .where("wp.deleted_at", "is", null)
      .where("wap.deleted_at", "is", null)
      .where("be.deleted_at", "is", null)
      .where("e.deleted_at", "is", null)
      .where("wap.program_plan_id", "=", programPlanId)
      .execute()

    const grouped = new Map<
      number,
      {
        puskesmas_name: string
        examinations: Array<{
          id: number
          name: string
          target_group_name: string | null
        }>
      }
    >()

    for (const row of rows) {
      const entityId = Number(row.puskesmas_entity_id)
      if (!grouped.has(entityId)) {
        grouped.set(entityId, {
          puskesmas_name: row.puskesmas_name,
          examinations: [],
        })
      }
      grouped.get(entityId)!.examinations.push({
        id: row.examination_id,
        name: row.examination_name,
        target_group_name: row.target_group_name || null,
      })
    }

    return Array.from(grouped.entries()).map(([puskesmas_entity_id, data]) => ({
      puskesmas_entity_id,
      puskesmas_name: data.puskesmas_name,
      examinations: data.examinations,
    }))
  }

  /**
   * Get all users from puskesmas entities (entity_tag_id = 9).
   */
  private async _getUsersByPuskesmasEntityIds(
    c: Context,
    puskesmasEntityIds: number[]
  ): Promise<UserData[]> {
    if (puskesmasEntityIds.length === 0) return []

    // Query ws_users (program-scoped) joined through ws_entities.global_id
    // so that user.id and entity_id are workspace-scoped, matching what the
    // Firebase notification worker expects.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = await (c.var.trx as any)
      .selectFrom("ws_users as wu")
      .innerJoin("user_workspaces as uw", "uw.id", "wu.id")
      .innerJoin("ws_entities as we", "we.id", "wu.entity_id")
      .select([
        "wu.id",
        "wu.username",
        "wu.email",
        "wu.mobile_phone",
        "wu.fcm_token",
        "wu.entity_id",
        "wu.program_id",
        "we.entity_tag_id",
        "we.global_id as global_entity_id",
      ])
      .where("we.global_id", "in", puskesmasEntityIds)
      .where("wu.program_id", "=", c.var.programId)
      .where("we.entity_tag_id", "=", ENTITY_TAG.COMMUNITY_HEALTH_CENTER)
      .where("uw.deleted_at", "is", null)
      .where("wu.deleted_by", "is", null)
      .where("wu.fcm_token", "is not", null)
      .where("wu.fcm_token", "!=", "mock-fcm-token")
      .execute()

    const validUsers = users.filter(
      (user: UserData) => user.fcm_token !== null
    )

    return validUsers
  }
}
