import { Context } from "hono"
import { BaseRepository } from "../../base.repository.js"
import { GetPreviewQuery } from "./bmhp-approval-preview.schema.js"

const VERIFICATION_STATUS_MAP: Record<number, string> = {
  0: "pending",
  1: "approved",
  2: "rejected",
  3: "revised",
}

type EntityEntry = {
  puskesmas_id: number
  puskesmas_name: string
  examMap: Map<number, ExamEntry>
}

type ExamEntry = {
  examination_id: number
  examination_name: string
  tgMap: Map<number, object>
}

export class BmhpApprovalPreviewRepository extends BaseRepository<"ws_bmhp_planning"> {
  constructor() {
    super("ws_bmhp_planning", false, false, true, true)
  }

  private upsertEntity(
    entityMap: Map<number, EntityEntry>,
    row: any
  ): EntityEntry {
    const entityId = Number(row.entity_id)
    if (!entityMap.has(entityId)) {
      entityMap.set(entityId, {
        puskesmas_id: entityId,
        puskesmas_name: row.entity_name ?? "",
        examMap: new Map(),
      })
    }
    return entityMap.get(entityId)!
  }

  private upsertTargetGroup(entity: EntityEntry, row: any): void {
    const examId = Number(row.examination_id)
    if (!entity.examMap.has(examId)) {
      entity.examMap.set(examId, {
        examination_id: examId,
        examination_name: row.examination_name ?? "",
        tgMap: new Map(),
      })
    }

    if (row.tg_id === null || row.tg_id === undefined) return

    const tgId = Number(row.tg_id)
    const exam = entity.examMap.get(examId)!
    if (exam.tgMap.has(tgId)) return

    const adjustedTarget =
      row.adjusted_target !== null && row.adjusted_target !== undefined
        ? Number(row.adjusted_target)
        : Number(row.original_target)

    const verificationStatus =
      VERIFICATION_STATUS_MAP[Number(row.verification_status ?? 0)] ?? "pending"

    exam.tgMap.set(tgId, {
      target_group_id: Number(row.target_group_id),
      target_group_name: row.target_group_name ?? "",
      original_target: Number(row.original_target),
      adjusted_target: adjustedTarget,
      final_target: adjustedTarget,
      verification_status: verificationStatus,
    })
  }

  async findWithPagination(c: Context, params: GetPreviewQuery) {
    const { program_plan_id, entity_id, examination_id } = params

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dbQuery = (c.var.trx as any)
      .selectFrom("ws_bmhp_planning as wp")
      .innerJoin("bmhp_examinations as be", "be.id", "wp.examination_id")
      .innerJoin("entities as e", "e.id", "wp.entity_id")
      .leftJoin(
        "ws_bmhp_planning_target_groups as tg",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (join: any) =>
          join
            .onRef("tg.planning_id", "=", "wp.id")
            .on("tg.deleted_at", "is", null)
      )
      .leftJoin("bmhp_target_groups as btg", "btg.id", "tg.target_group_id")
      .select([
        "wp.id as planning_id",
        "wp.entity_id",
        "e.name as entity_name",
        "wp.examination_id",
        "be.name as examination_name",
        "tg.id as tg_id",
        "tg.target_group_id",
        "btg.name as target_group_name",
        "tg.sample_count as original_target",
        "tg.adjusted_target",
        "tg.verification_status",
      ])
      .where("be.program_plan_id", "=", program_plan_id)
      .where("wp.deleted_at", "is", null)
      .where("wp.entity_id", "=", entity_id)
      .where("e.parent_id", "=", entity_id)
      .where("e.deleted_at", "is", null)

    if (examination_id) {
      dbQuery = dbQuery.where("wp.examination_id", "=", examination_id)
    }

    const rows: any[] = await dbQuery
      .orderBy("e.name", "asc")
      .orderBy("be.name", "asc")
      .execute()

    if (rows.length === 0) {
      return { list: [], total: 0 }
    }

    const entityMap = new Map<number, EntityEntry>()

    for (const row of rows) {
      const entity = this.upsertEntity(entityMap, row)
      this.upsertTargetGroup(entity, row)
    }

    const list = Array.from(entityMap.values()).map((entity) => ({
      puskesmas_id: entity.puskesmas_id,
      puskesmas_name: entity.puskesmas_name,
      examinations: Array.from(entity.examMap.values()).map((exam) => ({
        examination_id: exam.examination_id,
        examination_name: exam.examination_name,
        target_groups: Array.from(exam.tgMap.values()),
      })),
    }))

    return { list, total: list.length }
  }
}
