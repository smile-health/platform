import { Context } from "hono"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import momentTZ from "moment-timezone"
import {
  BmhpApprovalMonitoringRepository,
  PuskesmasRow,
} from "./bmhp-approval-monitoring.repository.js"
import { GetMonitoringQuery } from "./bmhp-approval-monitoring.schema.js"
import { buildMonitoringExcel } from "./bmhp-approval-monitoring.excel.js"

type ScreeningStatus = "completed" | "not_applicable" | "not_submitted"

type ScreeningEntry = {
  examination_id: number
  examination_name: string
  status: ScreeningStatus
}

type PuskesmasEntry = {
  puskesmas_id: number
  puskesmas_name: string
  sub_district_name: string | null
  screenings: ScreeningEntry[]
  progress: { completed: number; total: number }
}

export class BmhpApprovalMonitoringModule {
  constructor(private readonly repository: BmhpApprovalMonitoringRepository) {}

  groupByPuskesmas(
    rows: PuskesmasRow[],
    examinations: { id: number; name: string }[]
  ): PuskesmasEntry[] {
    const entityMap = new Map<
      number,
      {
        id: number
        name: string
        sub_district_name: string | null
        screeningMap: Map<
          number,
          {
            hasTg: number
            tgVerif1Or2: number
            tgVerif0: number
            tgTestZero: number
            tgComplete: number
          } | null
        >
      }
    >()

    for (const row of rows) {
      const entityId = Number(row.puskesmas_entity_id)
      if (!entityMap.has(entityId)) {
        entityMap.set(entityId, {
          id: entityId,
          name: row.puskesmas_name ?? "",
          sub_district_name: row.sub_district_name ?? null,
          screeningMap: new Map(),
        })
      }

      if (row.examination_id !== null && row.examination_id !== undefined) {
        const examId = Number(row.examination_id)
        entityMap.get(entityId)!.screeningMap.set(examId, {
          hasTg: Number(row.has_target_group),
          tgVerif1Or2: Number(row.tg_verif_1_or_2),
          tgVerif0: Number(row.tg_verif_0),
          tgTestZero: Number(row.tg_test_zero),
          tgComplete: Number(row.tg_complete),
        })
      }
    }

    return Array.from(entityMap.values()).map((entity) => {
      const screenings: ScreeningEntry[] = examinations.map((exam) => {
        if (!entity.screeningMap.has(exam.id)) {
          // No planning row for this examination
          return {
            examination_id: exam.id,
            examination_name: exam.name,
            status: "not_submitted" as const,
          }
        }
        const data = entity.screeningMap.get(exam.id)!

        // all tgs unverified (verification_status=0) → treat as not_submitted regardless of test_count
        const allUnverified = data.hasTg > 0 && data.tgVerif0 === data.hasTg

        // completed: has target group AND at least one tg with test_count!=0 AND sample_count!=0 AND at least one tg is verified
        const isCompleted = data.hasTg > 0 && data.tgComplete > 0 && !allUnverified

        // not_applicable: has target group AND ALL verification_status IN (1,2) AND ALL test_count=0
        const isNotApplicable =
          data.hasTg > 0 &&
          data.tgVerif1Or2 === data.hasTg &&
          data.tgTestZero === data.hasTg

        // not_submitted: hasTg=0, OR ALL verification_status=0 (pending/unverified)
        const isNotSubmitted =
          data.hasTg === 0 || allUnverified

        let status: ScreeningStatus = "not_submitted"
        if (isCompleted) {
          status = "completed"
        } else if (isNotApplicable) {
          status = "not_applicable"
        } else if (isNotSubmitted) {
          status = "not_submitted"
        }

        return {
          examination_id: exam.id,
          examination_name: exam.name,
          status,
        }
      })

      const completed = screenings.filter(
        (s) => s.status === "completed"
      ).length
      const notApplicable = screenings.filter(
        (s) => s.status === "not_applicable"
      ).length
      const total = examinations.length - notApplicable

      return {
        puskesmas_id: entity.id,
        puskesmas_name: entity.name,
        sub_district_name: entity.sub_district_name,
        screenings,
        progress: { completed, total },
      }
    })
  }

  private applyFilters(
    allRows: PuskesmasEntry[],
    status?: string,
    not_submitted?: string
  ): PuskesmasEntry[] {
    let result = allRows

    if (status === "completed") {
      // completed: minimal satu screening berstatus "completed"
      result = result.filter((r) => r.progress.completed > 0)
    } else if (status === "not_applicable") {
      // not_applicable: ada screening yang "not_applicable" (punya planning tapi tidak punya target group)
      result = result.filter((r) =>
        r.screenings.some((s) => s.status === "not_applicable")
      )
    } else if (status === "not_submitted") {
      // not_submitted: tidak ada data planning sama sekali
      result = result.filter((r) =>
        r.screenings.every((s) => s.status === "not_submitted")
      )
    }

    if (not_submitted === "1") {
      result = result.filter((r) =>
        r.screenings.some((s) => s.status === "not_submitted")
      )
    } else if (not_submitted === "0") {
      result = result.filter(
        (r) => !r.screenings.some((s) => s.status === "not_submitted")
      )
    }

    return result
  }

  async list(c: Context, query: GetMonitoringQuery) {
    const { status, not_submitted, paginate = 10, page = 1 } = query

    const { rows, examinations } = await this.repository.findRows(c, query)

    if (rows.length === 0) {
      return new PaginatedResponse({ ...query, paginate, page }, [], 0)
    }

    let allRows = this.groupByPuskesmas(rows, examinations)
    allRows = this.applyFilters(allRows, status, not_submitted)

    const total = allRows.length
    const offset = (page - 1) * paginate
    const list = allRows.slice(offset, offset + paginate)

    return new PaginatedResponse({ ...query, paginate, page }, list, total)
  }

  async exportExcel(c: Context, query: GetMonitoringQuery) {
    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = momentTZ().tz(timezone)
    const formatDate =
      currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase() +
      " GMT" +
      currentTime.format("Z").replace(":00", "")
    const filename = `BmhpApprovalMonitoring_${currentTime.format("YYYYMMDD_HHmm")} ${formatDate}_en`

    const { rows, examinations } = await this.repository.findRows(c, {
      ...query,
      paginate: 999999,
      page: 1,
    })

    const list = this.groupByPuskesmas(rows, examinations)
    return buildMonitoringExcel(c, list, examinations, filename)
  }
}
