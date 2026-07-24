import { Context } from "hono"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import momentTZ from "moment-timezone"
import { BmhpApprovalMinistryRepository } from "./bmhp-approval-ministry.repository.js"
import {
  GetMinistryApprovalListQuery,
  GetMinistryApprovalRecapitulationQuery,
} from "./bmhp-approval-ministry.schema.js"
import { BadRequestError } from "@smile/lib/error.js"
import {
  buildMinistryApprovalExcel,
  buildMinistryApprovalRecapitulationExcel,
} from "./bmhp-approval-ministry.excel.js"

export class BmhpApprovalMinistryModule {
  constructor(private readonly repository: BmhpApprovalMinistryRepository) {}

  /**
   * GET /bmhp-approval/ministry-of-health
   * Returns summary + paginated list of provinces with BMHP approval status.
   */
  async listMinistryApproval(c: Context, query: GetMinistryApprovalListQuery) {
    // Return empty data if program_plan_id is not provided
    if (!query.program_plan_id) {
      const paginated = new PaginatedResponse(query, [], 0)
      return {
        summary: {
          total_provinces: null,
          submitted: null,
          not_submitted: null,
          percentage_solution: null,
          daily_submissions: null,
        },
        ...paginated,
      }
    }

    let year: number | undefined
    let programId: number | undefined
    const planInfo = await this.repository.getProgramInfoFromProgramPlan(
      c,
      query.program_plan_id
    )
    year = planInfo?.year
    programId = planInfo?.program_id

    const { list, total } = await this.repository.findMinistryApprovalListBase(
      c,
      query,
      year,
      programId
    )

    // Fetch user info for created_by / updated_by
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latestIds: number[] = list
      .map((r: any) => (r.latest_ap_id ? Number(r.latest_ap_id) : null))
      .filter((id): id is number => id !== null)

    const userRows = await this.repository.findApprovalsUsers(c, latestIds)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userMap: Map<number, { created: any; updated: any }> = new Map()

    for (const row of userRows) {
      userMap.set(Number(row.ap_id), {
        created: row.created_id
          ? {
              id: Number(row.created_id),
              username: row.created_username,
              firstname: row.created_firstname,
              lastname: row.created_lastname,
            }
          : null,
        updated: row.updated_id
          ? {
              id: Number(row.updated_id),
              username: row.updated_username,
              firstname: row.updated_firstname,
              lastname: row.updated_lastname,
            }
          : null,
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = list.map((row: any, index: number) => {
      const latestApId = row.latest_ap_id ? Number(row.latest_ap_id) : null
      const users = latestApId ? userMap.get(latestApId) : null

      return {
        no: (query.page - 1) * query.paginate + index + 1,
        program_plan_id: latestApId,
        province_id: Number(row.province_id),
        province_name: row.province_name,
        status: row.approval_status ?? null,
        submitted_at: row.submitted_at ?? null,
        user_created_by: users?.created ?? null,
        user_updated_by: users?.updated ?? null,
      }
    })

    const { province_id, status } = query
    const totalProvinces = await this.repository.getTotalProvince(c, {
      province_id,
    })

    // Summary dihitung dari semua data propinsi
    const [aggRows, dailySubmissions] = await Promise.all([
      this.repository.getSummaryAggregates(c, {
        year,
        program_id: programId,
        province_id,
        status,
      }),
      this.repository.getTodaySubmissionCount(c, {
        programPlanId: query.program_plan_id,
        year,
        program_id: programId,
        province_id,
      }),
    ])

    const dikirim = aggRows.filter(
      (r) => Number(r.approval_status) === 1
    ).length
    const belumKirim = totalProvinces - dikirim
    const percentageSolution =
      totalProvinces > 0
        ? Math.round((dikirim / totalProvinces) * 1000) / 10
        : 0

    const summary = {
      total_provinces: totalProvinces,
      submitted: dikirim,
      not_submitted: belumKirim,
      percentage_solution: percentageSolution,
      daily_submissions: dailySubmissions,
    }

    const paginated = new PaginatedResponse(query, mapped, total)

    return {
      summary,
      ...paginated,
    }
  }

  /**
   * GET /bmhp-approval/ministry-of-health/xls
   * Exports the list of provinces with BMHP approval status to Excel.
   */
  async exportExcel(c: Context, query: GetMinistryApprovalListQuery) {
    const defaultPageLimit = 1000000 // Get all data
    const exportQuery = {
      ...query,
      paginate: defaultPageLimit,
      page: 1,
    }

    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = momentTZ().tz(timezone)
    const formatDate =
      currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase() +
      " GMT" +
      currentTime.format("Z").replace(":00", "")
    const filename = `BmhpApprovalMinistry_${currentTime.format("YYYYMMDD_HHmm")} ${formatDate}_en`

    const { data } = await this.listMinistryApproval(c, exportQuery)

    return buildMinistryApprovalExcel(data, filename)
  }

  /**
   * GET /bmhp-approval/ministry-of-health/:province_id
   * Returns national procurement recapitulation for a specific program plan id
   */
  async recapitulation(
    c: Context,
    provinceId: number,
    query: GetMinistryApprovalRecapitulationQuery
  ) {
    const { keyword, page, paginate, program_plan_id: programPlanId } = query

    const planInfo = await this.repository.getProgramInfoFromProgramPlan(
      c,
      programPlanId
    )
    if (!planInfo?.year) {
      throw new BadRequestError(
        c.var.t("bmhp-approval-ministry.message.program-plan-not-found")
      )
    }

    const year = planInfo.year
    const isPaginated = page !== undefined && paginate !== undefined

    if (!isPaginated) {
      const data = await this.repository.findRecapitulation(c, {
        programPlanId,
        keyword,
        year,
        province_id: provinceId,
      })
      return { data }
    }

    const [totalItem, data] = await Promise.all([
      this.repository.countAllRecapitulation(c, { programPlanId, keyword }),
      this.repository.findRecapitulation(c, {
        programPlanId,
        keyword,
        year,
        page,
        itemPerPage: paginate,
        province_id: provinceId,
      }),
    ])

    const totalPage = paginate > 0 ? Math.ceil(totalItem / paginate) : 0

    return {
      page,
      item_per_page: paginate,
      total_item: totalItem,
      total_page: totalPage,
      list_pagination: [10, 25, 50, 100],
      data,
    }
  }

  /**
   * GET /bmhp-approval/ministry-of-health/:province_id/xls
   * Exports the recapitulation for a program plan to Excel.
   */
  async exportRecapitulationExcel(
    c: Context,
    provinceId: number,
    query: GetMinistryApprovalRecapitulationQuery
  ) {
    // Avoid pagination to get all data
    const exportQuery: any = {
      ...query,
    }
    delete exportQuery.page
    delete exportQuery.paginate

    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = momentTZ().tz(timezone)
    const formatDate =
      currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase() +
      " GMT" +
      currentTime.format("Z").replace(":00", "")
    const filename = `BmhpApprovalMinistryRecapitulation_${currentTime.format("YYYYMMDD_HHmm")} ${formatDate}_en`

    const response = await this.recapitulation(c, provinceId, exportQuery)
    const { data } = response

    return buildMinistryApprovalRecapitulationExcel(c, data, filename)
  }
}
