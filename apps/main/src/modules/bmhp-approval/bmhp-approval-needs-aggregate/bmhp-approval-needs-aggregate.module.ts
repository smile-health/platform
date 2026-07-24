import { Context } from "hono"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import momentTZ from "moment-timezone"
import { buildNeedsAggregateExcel } from "./bmhp-approval-needs-aggregate.excel.js"
import { BmhpApprovalNeedsAggregateRepository } from "./bmhp-approval-needs-aggregate.repository.js"
import {
  GetNeedsAggregateQuery,
  GetNeedsAggregateDetailQuery,
  UpdateNeedsAggregateStatusBody,
} from "./bmhp-approval-needs-aggregate.schema.js"

export class BmhpApprovalNeedsAggregateModule {
  constructor(
    private readonly repository: BmhpApprovalNeedsAggregateRepository
  ) {}

  async list(c: Context, query: GetNeedsAggregateQuery) {
    const { program_plan_id } = query
    const paginate = query.paginate ?? 10
    const page = query.page ?? 1
    
    // Extract province_id from the logged in user's entity context
    const province_id = Number((c.var as any).userEntity?.province_id)

    if (!province_id) {
      return {
        success: false,
        message: "Province ID not found for the current user entity",
        data: null,
      }
    }

    // 1. Get Summary
    const summaryRows = await this.repository.getSummary(
      c,
      program_plan_id,
      province_id
    )

    const labels: string[] = []
    const total: number[] = []
    const unit: string[] = []

    for (const row of summaryRows) {
      labels.push(row.material_name || "Unknown")
      total.push(Number(row.total_needed))
      unit.push(row.unit || "")
    }

    const summary = { labels, total, unit }

    // 2. Get Table data
    const listResult = await this.repository.getList(c, {
      programPlanId: program_plan_id,
      provinceId: province_id,
      page,
      paginate,
    })

    const paginatedResponse = new PaginatedResponse(
      { paginate, page },
      listResult.list,
      listResult.total
    )

    return {
      ...JSON.parse(JSON.stringify(paginatedResponse)),
      summary,
    }
  }

  async getDetails(
    c: Context,
    cityId: number,
    query: GetNeedsAggregateDetailQuery
  ) {
    const { program_plan_id } = query

    const details = await this.repository.getDetails(
      c,
      program_plan_id,
      cityId
    )

    return {
      success: true,
      message: "Details retrieved successfully",
      data: details.map((d: any) => ({
        ...d,
        total_target: Number(d.total_target),
        total_adjustment: Number(d.total_adjustment),
      })),
    }
  }

  async updateStatus(
    c: Context,
    cityId: number,
    body: UpdateNeedsAggregateStatusBody
  ) {
    const { program_plan_id, status } = body

    let statusValue = 0 // pending
    if (status === "approved") {
      statusValue = 1
    } else if (status === "rejected") {
      statusValue = 2
    }

    const updated = await this.repository.updateStatus(
      c,
      program_plan_id,
      cityId,
      statusValue
    )

    if (!updated) {
      return {
        success: false,
        message: "Failed to update status. Please make sure the Dinkes Entity or Program Plan exists.",
        data: null,
      }
    }

    return {
      success: true,
      message: "Status updated successfully",
      data: null,
    }
  }

  async preview(c: Context, query: GetNeedsAggregateQuery) {
    const { program_plan_id } = query
    const province_id = Number((c.var as any).userEntity?.province_id)

    if (!province_id) {
      return {
        success: false,
        message: "Province ID not found for the current user entity",
        data: null,
      }
    }

    const rows = await this.repository.getExcelData(c, program_plan_id, province_id)

    const examinationMap = new Map<number, { id: number; name: string; unit: string }>()
    for (const row of rows) {
      if (row.exams) {
        for (const ex of row.exams) {
          if (!examinationMap.has(ex.exam_id)) {
            examinationMap.set(ex.exam_id, {
              id: ex.exam_id,
              name: ex.exam,
              unit: ex.unit || "vials",
            })
          }
        }
      }
    }

    const allExaminations = Array.from(examinationMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    )

    const data = rows.map((row: any) => {
      const rowExamMap = new Map((row.exams || []).map((ex: any) => [ex.exam_id, ex.needs]))
      
      return {
        id: row.city_id,
        name: row.city_name,
        update_by: row.updated_by !== "-" ? row.updated_by : null,
        update_at: row.updated_at,
        examination: allExaminations.map((ex) => ({
          id: ex.id,
          name: ex.name,
          unit: ex.unit,
          total_needs: rowExamMap.get(ex.id) || 0,
        })),
      }
    })

    return {
      success: true,
      message: "Preview retrieved successfully",
      data,
    }
  }

  async exportExcel(c: Context, query: GetNeedsAggregateQuery) {
    const { program_plan_id } = query
    const province_id = Number((c.var as any).userEntity?.province_id)

    if (!province_id) {
      throw new Error("Province ID not found for the current user entity")
    }

    const rows = await this.repository.getExcelData(c, program_plan_id, province_id)

    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = momentTZ().tz(timezone)
    const formatDate =
      currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase() +
      " GMT" +
      currentTime.format("Z").replace(":00", "")
    const filename = `BmhpApprovalNeedsAggregate_${currentTime.format("YYYYMMDD_HHmm")} ${formatDate}_en`

    return buildNeedsAggregateExcel(rows, filename)
  }
}

