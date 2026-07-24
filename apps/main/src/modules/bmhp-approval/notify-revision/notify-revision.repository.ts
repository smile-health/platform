import { Context } from "hono"

export class NotifyRevisionRepository {
  /**
   * Insert a revision notification (called from notify endpoint).
   */
  async insertNotification(
    c: Context,
    data: {
      approval_period_id: number
      puskesmas_entity_id: number
      message: string
    }
  ) {
    const result = await c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insertInto("ws_bmhp_revision_notifications" as any)
      .values({
        approval_period_id: data.approval_period_id,
        puskesmas_entity_id: data.puskesmas_entity_id,
        message: data.message,
        sent_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return Number(result.insertId)
  }

  /**
   * Paginated list of revision notifications.
   * Filtered by year (via approval_period) and/or puskesmas entity id.
   */
  async listNotifications(
    c: Context,
    params: {
      page: number
      paginate: number
      programPlanId?: number
      puskesmasId?: number
    }
  ) {
    const { page, paginate, programPlanId, puskesmasId } = params
    const offset = (page - 1) * paginate

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (c.var.trx as any)
      .selectFrom("ws_bmhp_revision_notifications as rn")
      .innerJoin(
        "ws_bmhp_approval_periods as ap",
        "ap.id",
        "rn.approval_period_id"
      )
      .leftJoin("ws_program_plans as wpp", (join: any) =>
        join
          .onRef("wpp.year", "=", "ap.program_plan_id")
          .on("wpp.deleted_at", "is", null)
      )
      .leftJoin("entities as e", "e.id", "rn.puskesmas_entity_id")
      .select([
        "rn.id",
        "rn.approval_period_id",
        "rn.puskesmas_entity_id",
        "e.name as puskesmas_name",
        "ap.program_plan_id",
        "rn.message",
        "rn.sent_at",
        "rn.sent_by",
        "rn.read_at",
        "rn.resolved_at",
      ])

    if (programPlanId) {
      query = query.where("wpp.id", "=", programPlanId)
    }
    if (puskesmasId) {
      query = query.where("rn.puskesmas_entity_id", "=", puskesmasId)
    }

    const [rows, totalResult] = await Promise.all([
      query
        .orderBy("rn.sent_at", "desc")
        .limit(paginate)
        .offset(offset)
        .execute(),
      query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select((eb: any) => [eb.fn.count("rn.id").as("total")])
        .executeTakeFirst(),
    ])

    const total = Number(totalResult?.total ?? 0)

    return { rows, total }
  }

  /**
   * Get the global entities.id from ws_entities for the currently logged-in entity.
   * c.var.entityId is a ws_entities.id (workspace-scoped); global_id is the entities.id.
   */
  async getGlobalEntityId(c: Context): Promise<number | null> {
    if (!c.var.entityId) return null

    const result = await c.var.trx
      .selectFrom("ws_entities")
      .select("global_id")
      .where("id", "=", c.var.entityId)
      .executeTakeFirst()

    return result?.global_id ? Number(result.global_id) : null
  }

  /**
   * Get year from a program plan.
   */
  async getYearByProgramPlan(c: Context, programPlanId: number) {
    const result = await c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .selectFrom("ws_program_plans" as any)
      .select("year")
      .where("id", "=", programPlanId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return result?.year ? Number(result.year) : null
  }

  /**
   * Find or create an approval period for a regency entity + year.
   */
  async getOrCreateApprovalPeriod(
    c: Context,
    regencyEntityId: number,
    program_plan_id: number
  ): Promise<number> {
    const existing = await c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .selectFrom("ws_bmhp_approval_periods" as any)
      .select("id")
      .where("entity_id", "=", regencyEntityId)
      .where("program_plan_id", "=", program_plan_id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (existing) return Number(existing.id)

    const inserted = await c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insertInto("ws_bmhp_approval_periods" as any)
      .values({
        entity_id: regencyEntityId,
        program_plan_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: 0 as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        current_step: 1 as any,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirstOrThrow()

    return Number(inserted.insertId)
  }

  /**
   * Mark a notification as resolved.
   */
  async resolveNotification(c: Context, id: number) {
    const result = await c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .updateTable("ws_bmhp_revision_notifications" as any)
      .set({
        resolved_at: new Date(),
      })
      .where("id", "=", id)
      .executeTakeFirst()

    return Number(result.numUpdatedRows) > 0
  }
}
