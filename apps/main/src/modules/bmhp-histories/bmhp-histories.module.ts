import { Context } from "hono"
import { BmhpHistoryRepository } from "./bmhp-histories.repository.js"
import { GetBmhpHistoryQueries } from "./bmhp-histories.schema.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { NotFoundError, BadRequestError } from "@smile/lib/error.js"
import moment from "moment-timezone"
import { BmhpHistoryTemplate } from "./bmhp-histories.excel.js"

export class BmhpHistoryModule {
  constructor(private readonly repository: BmhpHistoryRepository) {}

  async list(c: Context, query: GetBmhpHistoryQueries) {
    const entityId = c.var.userEntity?.global_id
    const effectiveQuery = this.applyUserEntityLocation(c, query)

    const { list, total } = await this.repository.findWithPagination(
      c,
      entityId,
      effectiveQuery
    )
    const formattedList = list.map((item) => {
      const {
        id_updated,
        username_updated,
        firstname_updated,
        lastname_updated,
        ...rest
      } = item as any
      return {
        ...rest,
        user_updated_by: id_updated
          ? {
              id: id_updated,
              username: username_updated,
              firstname: firstname_updated,
              lastname: lastname_updated,
            }
          : null,
      }
    })
    return new PaginatedResponse(query, formattedList, total)
    // return new PaginatedResponse(query, list, total)
  }

  async detail(c: Context, id: number) {
    const planning = await this.repository.findDetailPlanning(c, id)
    if (!planning) {
      throw new NotFoundError("BMHP History not found")
    }

    const [methods, targetGroups] = await Promise.all([
      this.repository.findDetailMethods(c, id),
      this.repository.findDetailTargetGroups(c, id),
    ])

    const targetGroupIds = targetGroups.map((tg: any) => tg.id)
    const materials =
      targetGroupIds.length > 0
        ? await this.repository.findDetailMaterials(c, targetGroupIds)
        : []

    const totalSample = targetGroups.reduce(
      (sum: number, tg: any) => sum + Number(tg.sample_count || 0),
      0
    )
    const totalTest = targetGroups.reduce(
      (sum: number, tg: any) => sum + Number(tg.test_count || 0),
      0
    )
    const uniqueMaterials = new Set(materials.map((m: any) => m.material_name))

    return {
      success: true,
      message: "Detail History Fetched Successfully.",
      data: {
        id: planning.id,
        entity: {
          id: planning.entity_id,
          name: planning.entity_name,
          address: planning.entity_address,
        },
        year: planning.year,
        status: planning.status,
        submitted_at: planning.submitted_at,
        approved_at: planning.approved_at,
        created_at: planning.created_at,
        updated_at: planning.updated_at,
        updated_by: planning.id_updated
          ? [planning.firstname_updated, planning.lastname_updated]
              .filter(Boolean)
              .join(" ") || planning.username_updated
          : null,
        examination_name: planning.examination_name,
        examination_type: planning.examination_type,
        examination_method: methods
          .map((m: any) => m.method_name)
          .filter(Boolean)
          .join(", "),
        summary: {
          total_sample: totalSample,
          total_test: totalTest,
          target_count: targetGroups.length,
          material_count: uniqueMaterials.size,
        },
        targets: targetGroups.map((tg: any) => ({
          id: tg.id,
          target_name: tg.target_name,
          sample_count: tg.sample_count,
          test_count: tg.test_count,
          materials: materials
            .filter((m: any) => m.planning_target_group_id === tg.id)
            .map((m: any) => ({
              id: m.id,
              tag: m.is_reagen ? "Reagen" : "BMHP",
              material_name: m.material_name,
              history_previous_year: m.lab_usage,
              product_template: m.product_template,
              product_variant: m.product_variant,
              unit: c.var.t(`material_unit.label.${m.unit_name}`),
              estimated_need: m.lab_usage,
              // estimated_need: m.calculated_requirement,
              test_qty: m.test_qty,
            })),
        })),
      },
    }
  }

  private applyUserEntityLocation(c: Context, query: GetBmhpHistoryQueries): GetBmhpHistoryQueries {
    const userEntity = c.var.userEntity
    if (!userEntity) return query

    const overrides: Partial<GetBmhpHistoryQueries> = {}

    if (userEntity.province_id) {
      overrides.province_id = Number(userEntity.province_id)
    }
    if (userEntity.regency_id) {
      overrides.regency_id = Number(userEntity.regency_id)
    }
    if (userEntity.sub_district_id) {
      overrides.sub_district_id = Number(userEntity.sub_district_id)
    }

    return { ...query, ...overrides }
  }

  async delete(c: Context, id: number) {
    const existing = await this.repository.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP History not found")
    }

    await this.repository.delete(c, { id })
    return { message: "BMHP History deleted successfully" }
  }

  async exportList(c: Context, query: GetBmhpHistoryQueries) {
    const entityId = c.var.userEntity?.global_id
    const effectiveQuery = this.applyUserEntityLocation(c, query)

    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = moment().tz(timezone)
    const title = `BmhpHistory_${currentTime.format("YYYYMMDD_HHmm")}`

    // Fetch more per page for export, but respect same filters
    const exportQuery = { ...effectiveQuery, paginate: 1000, page: 1 }
    const { list } = await this.repository.findWithPagination(
      c,
      entityId,
      exportQuery
    )

    if (list.length === 0) {
      throw new BadRequestError("No data found to export")
    }

    const planningIds = list.map((p) => p.id)
    const [allMethods, allTargetGroups] = await Promise.all([
      this.repository.findDetailMethodsBulk(c, planningIds),
      this.repository.findDetailTargetGroupsBulk(c, planningIds),
    ])

    const targetGroupIds = allTargetGroups.map((tg) => tg.id)
    const allMaterials =
      targetGroupIds.length > 0
        ? await this.repository.findDetailMaterials(c, targetGroupIds)
        : []

    const columns = this.getExportColumns()
    const template = new BmhpHistoryTemplate()
    const sheetName = "Riwayat BMHP"
    await template.initSheet(sheetName)
    template.setTitle(title)
    template.setTimezone(timezone)
    template.setColumns(columns)

    let index = 1
    let currentRow = 2
    for (const p of list) {
      const { planningRow, pTgs, pMaterials } = this.preparePlanningData(
        c, 
        p,
        allMethods,
        allTargetGroups,
        allMaterials,
        index++
      )
      currentRow = await this.processPlanningItem(
        c, 
        template,
        sheetName,
        planningRow,
        pTgs,
        pMaterials,
        currentRow
      )
    }

    return await template.generate()
  }

  private getExportColumns() {
    return [
      { header: "No", width: 5 },
      { header: "Year", width: 10 },
      { header: "Entity Name", width: 25 },
      { header: "Entity Address", width: 30 },
      { header: "Examination Name", width: 25 },
      { header: "Examination Type", width: 20 },
      { header: "Examination Method", width: 30 },
      // { header: "Status", width: 15 },
      // { header: "Submitted At", width: 20 },
      // { header: "Approved At", width: 20 },
      { header: "Created At", width: 20 },
      { header: "Total Sample", width: 15 },
      { header: "Total Test", width: 15 },
      { header: "Target Count", width: 15 },
      { header: "Material Count", width: 15 },
      { header: "Target Name", width: 25 },
      { header: "Sample Count", width: 15 },
      { header: "Test Count", width: 15 },
      { header: "Material Name", width: 25 },
      { header: "Product Template", width: 25 },
      { header: "Product Variant", width: 25 },
      { header: "Estimated Need", width: 15 },
      { header: "Test Qty", width: 15 },
      { header: "Unit", width: 10 },
    ]
  }

  private preparePlanningData(
    c: Context,
    p: any,
    allMethods: any[],
    allTargetGroups: any[],
    allMaterials: any[],
    index: number
  ) {
    const pMethods = allMethods
      .filter((m: any) => m.planning_id === p.id)
      .map((m: any) => m.method_name)
      .join(", ")
    const pTgs = allTargetGroups.filter((tg: any) => tg.planning_id === p.id)
    const pMaterials = allMaterials.filter((m: any) =>
      pTgs.some((tg: any) => tg.id === m.planning_target_group_id)
    )

    const totalSample = pTgs.reduce(
      (sum, tg: any) => sum + Number(tg.sample_count || 0),
      0
    )
    const totalTest = pTgs.reduce(
      (sum, tg: any) => sum + Number(tg.test_count || 0),
      0
    )

    const planningRow = {
      no: index,
      year: p.year,
      entity_name: p.entity_name || "-",
      entity_address: p.entity_address || "-",
      examination_name: p.examination_name,
      examination_type: p.examination_type || "-",
      examination_method: pMethods || "-",
      // status: p.status,
      // submitted_at: p.submitted_at
      //   ? moment(p.submitted_at).format("YYYY-MM-DD HH:mm")
      //   : "-",
      // approved_at: p.approved_at
      //   ? moment(p.approved_at).format("YYYY-MM-DD HH:mm")
      //   : "-",
      created_at: moment(p.created_at).format("YYYY-MM-DD HH:mm"),
      total_sample: totalSample,
      total_test: totalTest,
      target_count: pTgs.length,
      material_count: new Set(pMaterials.map((m: any) => m.material_name)).size,
    }

    return { planningRow, pTgs, pMaterials }
  }

  private async processPlanningItem(
    c: Context,
    template: BmhpHistoryTemplate,
    sheetName: string,
    planningRow: any,
    pTgs: any[],
    pMaterials: any[],
    currentRow: number
  ) {
    const startPlanningRow = currentRow
    const rowsNeeded = Math.max(1, pMaterials.length)

    if (pTgs.length === 0) {
      await template.addRows(
        sheetName,
        [
          {
            ...planningRow,
            target_name: "-",
            sample_count: "-",
            test_count: "-",
            material_name: "-",
            product_template: "-",
            product_variant: "-",
            estimated_need: "-",
            test_qty: "-",
            unit: "-",
          },
        ],
        currentRow
      )
      return currentRow + 1
    }

    for (const tg of pTgs) {
      const tgMaterials = pMaterials.filter(
        (m: any) => m.planning_target_group_id === tg.id
      )
      currentRow = await this.processTargetGroup(
        c,
        template,
        sheetName,
        planningRow,
        tg,
        tgMaterials,
        currentRow
      )
    }

    if (rowsNeeded > 1) {
      const cols = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]
      for (const col of cols) {
        template.mergeCells(
          sheetName,
          `${col}${startPlanningRow}`,
          `${col}${startPlanningRow + rowsNeeded - 1}`,
          true
        )
      }
    }

    return currentRow
  }

  private async processTargetGroup(
    c: Context,
    template: BmhpHistoryTemplate,
    sheetName: string,
    planningRow: any,
    tg: any,
    tgMaterials: any[],
    currentRow: number
  ) {
    const startTargetRow = currentRow
    const tgRowsNeeded = Math.max(1, tgMaterials.length)

    if (tgMaterials.length === 0) {
      await template.addRows(
        sheetName,
        [
          {
            ...planningRow,
            target_name: tg.target_name,
            sample_count: tg.sample_count,
            test_count: tg.test_count,
            material_name: "-",
            product_template: "-",
            product_variant: "-",
            estimated_need: "-",
            test_qty: "-",
            unit: "-",
          },
        ],
        currentRow
      )
      currentRow++
    } else {
      for (const m of tgMaterials) {
        await template.addRows(
          sheetName,
          [
            {
              ...planningRow,
              target_name: tg.target_name,
              sample_count: tg.sample_count,
              test_count: tg.test_count,
              material_name: m.material_name,
              product_template: m.product_template || "-",
              product_variant: m.product_variant || "-",
              estimated_need: m.lab_usage,
              test_qty: m.test_qty,
              unit: m.unit_name ? c.var.t(`material_unit.label.${m.unit_name}`) : "-",
            },
          ],
          currentRow
        )
        currentRow++
      }
    }

    if (tgRowsNeeded > 1) {
      for (const col of ["M", "N", "O"]) {
        template.mergeCells(
          sheetName,
          `${col}${startTargetRow}`,
          `${col}${startTargetRow + tgRowsNeeded - 1}`,
          true
        )
      }
    }
    return currentRow
  }
}
