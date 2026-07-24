import { Context } from "hono"
import { BadRequestError } from "@smile/lib/error.js"
import { BmhpPlanningRepository } from "./bmhp-planning.repository.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import {
  CreateBmhpPlanningBody,
  CreateTargetGroupsBody,
  CreateExaminationTargetMaterialsBody,
  SetupExaminationBody,
  CreateBmhpParameterBody,
  CreateBmhpTargetGroupBody,
  CreateBmhpExaminationMethodBody,
  CreateBmhpMaterialBody,
  CheckPlanningQuery,
  UpdatePlanningEditBody,
  type GetListPlanningQuery,
  type GetProgramPlansWithStatusQuery,
  type CityDistrictHealthOfficeTargetBody,
} from "./bmhp-planning.schema.js"
import moment from "moment"
import { BmhpPlanningTemplate } from "./bmhp-planning.excel.js"

export class BmhpPlanningModule {
  constructor(public repository: BmhpPlanningRepository) {}

  async list(c: Context, query: GetListPlanningQuery) {
    const entityId = c.var.userEntity?.global_id
    if (!entityId) {
      throw new Error("Entity ID not found")
    }

    const { list, total } = await this.repository.findList(c, entityId, query)
    return new PaginatedResponse(query, list, total)
  }

  async getProgramPlansWithStatus(
    c: Context,
    query: GetProgramPlansWithStatusQuery
  ) {
    const { list, total } = await this.repository.findProgramPlansWithStatus(
      c,
      query
    )
    return new PaginatedResponse(query, list, total)
  }

  async exportList(c: Context, query: GetListPlanningQuery) {
    const entityId = c.var.userEntity?.global_id
    if (!entityId) {
      throw new Error("Entity ID not found")
    }

    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = moment().tz(timezone)
    const title = `BmhpPlanningHistory_${currentTime.format("YYYYMMDD_HHmm")}`

    const exportQuery = { ...query, paginate: 1000, page: 1 }
    const { list } = await this.repository.findList(c, entityId, exportQuery)

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
    const template = new BmhpPlanningTemplate()
    const sheetName = "Riwayat Perencanaan BMHP"
    await template.initSheet(sheetName)
    template.setTitle(title)
    template.setTimezone(timezone)
    template.setColumns(columns)

    let currentRow = 2
    let index = 1
    for (const p of list) {
      const { planningRow, pTgs, pMaterials } = this.preparePlanningData(
        p,
        allMethods,
        allTargetGroups,
        allMaterials,
        index++
      )
      currentRow = await this.processPlanningItem(
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
      { header: "Status", width: 15 },
      { header: "Submitted At", width: 20 },
      { header: "Approved At", width: 20 },
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
      { header: "Estimated Unit", width: 15 },
      { header: "Unit", width: 10 },
    ]
  }

  private preparePlanningData(
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
      status: p.status,
      submitted_at: p.submitted_at
        ? moment(p.submitted_at).format("YYYY-MM-DD HH:mm")
        : "-",
      approved_at: p.approved_at
        ? moment(p.approved_at).format("YYYY-MM-DD HH:mm")
        : "-",
      created_at: moment(p.created_at).format("YYYY-MM-DD HH:mm"),
      total_sample: totalSample,
      total_test: totalTest,
      target_count: pTgs.length,
      material_count: pMaterials.length,
    }

    return { planningRow, pTgs, pMaterials }
  }

  private async processPlanningItem(
    template: BmhpPlanningTemplate,
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
            estimated_unit: "-",
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
        template,
        sheetName,
        planningRow,
        tg,
        tgMaterials,
        currentRow
      )
    }

    if (rowsNeeded > 1) {
      const cols = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
      ]
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
    template: BmhpPlanningTemplate,
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
            estimated_unit: "-",
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
              estimated_need: m.calculated_requirement,
              estimated_unit: "kemasan",
              unit: m.test_qty || "-",
            },
          ],
          currentRow
        )
        currentRow++
      }
    }

    if (tgRowsNeeded > 1) {
      for (const col of ["P", "Q", "R"]) {
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

  async detail(c: Context, id: number) {
    const planning = await this.repository.findDetailPlanning(c, id)
    if (!planning) {
      throw new Error("Planning not found")
    }

    const entityId = c.var.userEntity?.global_id
    if (!entityId) {
      throw new Error("Entity ID not found")
    }

    const [methods, targetGroups, prevMaterials] = await Promise.all([
      this.repository.findDetailMethods(c, id),
      this.repository.findDetailTargetGroups(c, id),
      this.repository.findPreviousYearMaterials(c, id, planning.year, entityId),
    ])

    const targetGroupIds = targetGroups.map((tg: any) => tg.id)
    const materials =
      targetGroupIds.length > 0
        ? await this.repository.findDetailMaterials(c, targetGroupIds)
        : []

    // Map previous year materials by target_group_id + material_name
    const prevMaterialMap = new Map<string, number>()
    prevMaterials.forEach((pm) => {
      prevMaterialMap.set(
        `${pm.target_group_id}_${pm.material_name}`,
        Number(pm.prev_lab_usage || 0)
      )
    })

    const filteredTargetGroups = targetGroups.filter(
      (tg: any) => Number(tg.test_count || 0) > 0
    )

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
        program_plan_id: planning.program_plan_id,
        year: planning.year,
        status: planning.status,
        examination_id: planning.examination_id,
        examination_name: planning.examination_name,
        examination_type: planning.examination_type,
        examination_method: methods
          .map((m: any) => m.method_name)
          .filter(Boolean)
          .join(", "),
        is_approved: planning.is_approved ?? 0,
        created_at: planning.created_at,
        summary: {
          total_sample: totalSample,
          total_test: totalTest,
          target_count: filteredTargetGroups.length,
          material_count: uniqueMaterials.size,
        },
        targets: filteredTargetGroups.map((tg) => ({
          id: tg.id,
          target_group_id: tg.target_group_id,
          target_name: tg.target_name,
          sample_count: tg.sample_count,
          test_count: tg.test_count,
          verification_status: tg.verification_status,
          revision: tg.revision ?? false,
          materials: materials
            .filter((m: any) => m.planning_target_group_id === tg.id)
            .map((m: any) => {
              const prevLabUsage =
                prevMaterialMap.get(
                  `${tg.target_group_id}_${m.material_name}`
                ) ?? 0
              return {
                id: m.id,
                revision: m.revision ?? 0,
                tag: m.material_subtype
                  ? c.var.t(`material_subtype.label.${m.material_subtype}`)
                  : "BMHP",
                material_name: m.material_name,
                history_previous_year: prevLabUsage,
                product_template: m.product_template,
                product_variant: m.is_variant
                  ? (m.product_variant ?? m.product_template)
                  : m.product_variant,
                unit: m.test_qty,
                estimated_need: m.lab_usage,
                // estimated_need: m.calculated_requirement,
                estimated_unit: c.var.t(
                  `material_unit.label.${m.estimated_unit}`
                ),
              }
            }),
        })),
      },
    }
  }

  async delete(c: Context, id: number) {
    const existing = await this.repository.findPlanningById(c, id)
    if (!existing) {
      throw new Error("Planning not found")
    }

    await this.repository.deletePlanning(c, id)

    return { status: true, message: "Planning deleted successfully" }
  }

  async check(c: Context, query: CheckPlanningQuery) {
    const entityId = c.var.userEntity?.global_id
    if (!entityId) {
      throw new Error("Entity ID not found")
    }

    const existing = await this.repository.findPlanningByEntityYearExamination(
      c,
      entityId,
      query.year,
      query.examination_id
    )

    // Return false if no planning exists
    if (!existing) {
      return { status: false }
    }

    // Check if planning has submitted data (has target_group with test_count > 0)
    // If planning exists but only has test_count=0 AND verification_status=0, treat as not submitted
    const hasSubmittedData =
      await this.repository.planningHasSubmittedTargetGroup(c, existing.id)

    return { status: hasSubmittedData }
  }

  /**
   * GET /bmhp-planning/edit/:history_id/:target_group_id
   * Get planning edit data for mobile apps
   */
  async getPlanningEdit(c: Context, historyId: number, targetGroupId: number) {
    const data = await this.repository.findPlanningEditData(
      c,
      historyId,
      targetGroupId
    )

    return {
      success: true,
      message: data?.id
        ? "Planning edit data fetched successfully"
        : "No planning found, returning empty data",
      data: {
        id: data?.id || null,
        program_plan_id: data?.program_plan_id || null,
        examination_id: data?.examination_id || null,
        target_group_id: data?.target_group_id || targetGroupId,
        target_name: data?.target_name || null,
        sample_count: data?.sample_count || 0,
        test_count: data?.test_count || 0,
        verification_status: data?.verification_status || 0,
        revision: data?.revision ?? 0,
        materials: (data?.materials || []).map((m: any) => ({
          id: m.id,
          revision: m.revision ?? 0,
          tag: m.material_subtype
            ? c.var.t(`material_subtype.label.${m.material_subtype}`)
            : "BMHP",
          material_name: m.material_name,
          history_previous_year: m.lab_usage,
          product_template: m.product_template,
          product_variant: m.is_variant
            ? (m.product_variant ?? m.product_template)
            : m.product_variant,
          unit: m.test_qty,
          estimated_need: m.lab_usage,
          estimated_unit: c.var.t(`material_unit.label.${m.estimated_unit}`),
          method: m.method || "",
        })),
      },
    }
  }

  /**
   * PUT /bmhp-planning/edit
   * Update planning with target groups and materials (mobile edit)
   */
  async updatePlanningEdit(c: Context, body: UpdatePlanningEditBody) {
    const userEntityId = c.var.userEntity?.global_id
    const userEntity = c.var.userEntity
    if (!userEntityId || !userEntity) {
      throw new BadRequestError("Entity ID not found")
    }

    // Planning entity_id should be the entity where the planning belongs
    const planningEntityId = userEntityId

    // Approval period entity_id should be the dinkes/kabupaten entity_id
    // This is used for the approval workflow at regency level
    let approvalPeriodEntityId: number

    // If the entity is already a dinkes/kabupaten (entity_tag_id = 7), use it directly.
    // Otherwise, find the parent dinkes via regency_id.
    if (userEntity.entity_tag_id === 7) {
      approvalPeriodEntityId = userEntityId
    } else if (userEntity.regency_id) {
      const kabupaten = await this.repository.findKabupatenByRegencyId(
        c,
        userEntity.regency_id
      )
      if (!kabupaten) {
        throw new BadRequestError(
          "No dinkes/kabupaten entity found for the entity's regency"
        )
      }
      approvalPeriodEntityId = Number(kabupaten.id)
    } else {
      throw new BadRequestError(
        "Entity does not have a regency_id and is not a dinkes/kabupaten"
      )
    }

    await this.repository.updatePlanningEdit(
      c,
      planningEntityId,
      approvalPeriodEntityId,
      body
    )

    return {
      success: true,
      message: "Planning updated successfully",
    }
  }

  async createPlanning(c: Context, body: CreateBmhpPlanningBody) {
    const userEntityId = c.var.userEntity?.global_id
    const userEntity = c.var.userEntity
    if (!userEntityId || !userEntity) {
      throw new BadRequestError("Entity ID not found")
    }

    // Planning entity_id should be the entity where the planning belongs
    const planningEntityId = userEntityId

    // Approval period entity_id should be the dinkes/kabupaten entity_id
    // This is used for the approval workflow at regency level
    let approvalPeriodEntityId: number

    // If the entity is already a dinkes/kabupaten (entity_tag_id = 7), use it directly.
    // Otherwise, find the parent dinkes via regency_id.
    if (userEntity.entity_tag_id === 7) {
      approvalPeriodEntityId = userEntityId
    } else if (userEntity.regency_id) {
      const kabupaten = await this.repository.findKabupatenByRegencyId(
        c,
        userEntity.regency_id
      )
      if (!kabupaten) {
        throw new BadRequestError(
          "No dinkes/kabupaten entity found for the entity's regency"
        )
      }
      approvalPeriodEntityId = Number(kabupaten.id)
    } else {
      throw new BadRequestError(
        "Entity does not have a regency_id and is not a dinkes/kabupaten"
      )
    }

    // Check if planning already exists for this entity, year and examination (including soft-deleted)
    // to avoid UNIQUE constraint violation on (entity_id, year, examination_id)
    const existing =
      await this.repository.findPlanningByEntityYearExaminationAny(
        c,
        planningEntityId,
        body.year,
        body.examination_id
      )

    let planningId: number

    if (existing) {
      // Upsert: Update existing planning and clear old child records
      planningId = existing.id
      const newstatus = body.status === "REVISION" ? "DRAFT" : body.status
      await this.repository.updatePlanning(c, planningId, {
        status: newstatus,
      })

      await this.repository.deletePlanningMaterialsAndMethods(c, planningId)
      
    } else {
      // Create new main planning

      // Need to find or create approval period with dinkes/kabupaten entity_id
      const approvalPeriod =
        await this.repository.findOrCreateApprovalPeriodByEntityAndYear(
          c,
          approvalPeriodEntityId,
          body.year
        )

      const planning = await this.repository.createPlanning(c, {
        entity_id: planningEntityId,
        approval_period_id: approvalPeriod.id,
        examination_id: body.examination_id,
        status: body.status,
      })
      planningId = planning.id
    }

    // Create / update target groups and store their IDs
    const targetGroupIds: number[] = []
    if (body.target_groups.length === 0) {
      // Empty body: seed target_groups from examination relation.
      await this.repository.seedPlanningTargetGroupsFromExamination(
        c,
        planningId,
        body.examination_id
      )
    } else {
      // Upsert each target group from body. Existing rows are preserved.
      for (const tg of body.target_groups) {
        const id = await this.repository.upsertPlanningTargetGroup(
          c,
          planningId,
          {
            target_group_id: tg.target_group_id,
            sample_count: tg.sample_count,
            test_count: tg.test_count,
          }
        )
        targetGroupIds.push(id)
      }
      // For target_groups already in DB but NOT in body: keep them, only
      // reset verification_status=0 (preserve sample_count and test_count).
      await this.repository.setUnselectedTargetGroupsVerification(
        c,
        planningId,
        body.target_groups.map((tg) => tg.target_group_id),
        0
      )
    }

    // Create methods
    for (const method of body.methods) {
      await this.repository.createPlanningMethod(c, {
        planning_id: planningId,
        method_id: method.method_id,
      })
    }

    // Create materials if provided
    await this.createPlanningMaterials(c, body.materials, targetGroupIds)

    return { id: planningId }
  }

  private async resolveExistingPlanning(
    c: Context,
    existing: { id: number } | undefined,
    planningEntityId: number,
    approvalPeriodEntityId: number,
    body: CreateBmhpPlanningBody
  ): Promise<number> {
    if (existing) {
      const newstatus = body.status === "REVISION" ? "DRAFT" : body.status
      await this.repository.updatePlanning(c, existing.id, { status: newstatus })

      if (body.target_groups && body.target_groups.length > 0) {
        await this.repository.deletePlanningChildren(c, existing.id)
      } else {
        await this.repository.resetPlanningTargetGroups(c, existing.id)
        await this.syncPlanningTargetGroupsWithExamination(c, existing.id, body.examination_id)
      }
      return existing.id
    }

    const approvalPeriod = await this.repository.findOrCreateApprovalPeriodByEntityAndYear(
      c,
      approvalPeriodEntityId,
      body.year
    )
    const planning = await this.repository.createPlanning(c, {
      entity_id: planningEntityId,
      approval_period_id: approvalPeriod.id,
      examination_id: body.examination_id,
      status: body.status,
    })
    return planning.id
  }

  private async createPlanningMaterials(
    c: Context,
    materials: CreateBmhpPlanningBody["materials"],
    targetGroupIds: number[]
  ): Promise<void> {
    if (!materials || materials.length === 0) return

    for (const material of materials) {
      const planningTargetGroupId = targetGroupIds[material.target_group_index]
      if (!planningTargetGroupId) {
        throw new BadRequestError(
          `Invalid target_group_index: ${material.target_group_index}`
        )
      }
      await this.repository.createPlanningMaterial(c, {
        planning_target_group_id: planningTargetGroupId,
        material_id: material.material_id,
        material_template_id: material.material_template_id,
        variant_id: material.variant_id,
        method_id: material.method_id,
        lab_usage: material.lab_usage,
        calculated_requirement: material.calculated_requirement,
      })
    }
  }

  private async syncPlanningTargetGroupsWithExamination(
    c: Context,
    planningId: number,
    examinationId: number
  ) {
    // Get all target groups that should be associated with the examination
    const examinationTargetGroups =
      await this.repository.findExaminationTargetGroups(c, examinationId)
    const examinationTargetGroupIds = examinationTargetGroups.map(
      (tg: any) => tg.target_group_id
    )

    // Get existing planning target groups
    const existingPlanningTargetGroups =
      await this.repository.findPlanningTargetGroups(c, planningId)
    const existingTargetGroupIds = new Set(
      existingPlanningTargetGroups.map((tg: any) => tg.target_group_id)
    )

    // Find missing target groups
    const missingTargetGroupIds = examinationTargetGroupIds.filter(
      (tgId: number) => !existingTargetGroupIds.has(tgId)
    )

    // Create missing target groups with sample_count: 0, test_count: 0
    for (const targetGroupId of missingTargetGroupIds) {
      await this.repository.createPlanningTargetGroup(
        c,
        {
          planning_id: planningId,
          target_group_id: targetGroupId,
          sample_count: 0,
          test_count: 0,
        },
        false
      )
    }
  }

  async createPlanningTargetGroups(c: Context, body: CreateTargetGroupsBody) {
    const planningId = body.planning_id

    // Insert target groups
    const results: any[] = []
    for (const tg of body.target_groups) {
      const result = await this.repository.createPlanningTargetGroup(c, {
        planning_id: planningId,
        target_group_id: tg.target_group_id,
        sample_count: tg.sample_count,
        test_count: tg.test_count,
      })
      results.push({
        id: result.id,
        target_group_id: tg.target_group_id,
        sample_count: tg.sample_count,
        test_count: tg.test_count,
      })
    }

    return results
  }

  async createExaminationTargetMaterials(
    c: Context,
    body: CreateExaminationTargetMaterialsBody
  ) {
    const results: any[] = []
    for (const mat of body.materials) {
      const result = await this.repository.createExaminationTargetMaterial(c, {
        exam_target_group_id: mat.exam_target_group_id,
        bmhp_material_id: mat.bmhp_material_id,
      })
      results.push({
        id: result.id,
        exam_target_group_id: mat.exam_target_group_id,
        bmhp_material_id: mat.bmhp_material_id,
      })
    }

    return results
  }

  private async insertParameters(
    c: Context,
    examinationId: number,
    parameters: { parameter_id: number }[]
  ) {
    const results: any[] = []
    for (const param of parameters) {
      const result = await this.repository.createExaminationParameter(c, {
        examination_id: examinationId,
        parameter_id: param.parameter_id,
      })
      results.push({
        id: result.id,
        parameter_id: param.parameter_id,
      })
    }
    return results
  }

  private async insertTargetGroupMaterials(
    c: Context,
    examTargetGroupId: number,
    materials: { bmhp_material_id: number }[]
  ) {
    const materialResults: any[] = []
    const targetMaterialResults: any[] = []

    for (const mat of materials) {
      const matResult = await this.repository.createTargetMaterial(c, {
        exam_target_group_id: examTargetGroupId,
        bmhp_material_id: mat.bmhp_material_id,
      })
      materialResults.push({
        id: matResult.id,
        bmhp_material_id: mat.bmhp_material_id,
      })
      targetMaterialResults.push({
        id: matResult.id,
        exam_target_group_id: examTargetGroupId,
        bmhp_material_id: mat.bmhp_material_id,
      })
    }

    return { materialResults, targetMaterialResults }
  }

  private async insertTargetGroupsWithMaterials(
    c: Context,
    examinationId: number,
    targetGroups: {
      target_group_id: number
      materials?: { bmhp_material_id: number }[]
    }[]
  ) {
    const targetGroupResults: any[] = []
    const allTargetMaterials: any[] = []

    for (const tg of targetGroups) {
      const tgResult = await this.repository.createExaminationTargetGroup(c, {
        examination_id: examinationId,
        target_group_id: tg.target_group_id,
      })

      const targetGroupData: any = {
        id: tgResult.id,
        target_group_id: tg.target_group_id,
        materials: [],
      }

      if (tg.materials && tg.materials.length > 0) {
        const { materialResults, targetMaterialResults } =
          await this.insertTargetGroupMaterials(c, tgResult.id, tg.materials)
        targetGroupData.materials = materialResults
        allTargetMaterials.push(...targetMaterialResults)
      }

      targetGroupResults.push(targetGroupData)
    }

    return { targetGroupResults, allTargetMaterials }
  }

  private async insertMethods(
    c: Context,
    examinationId: number,
    methods: { method_id: number }[]
  ) {
    const results: any[] = []
    for (const method of methods) {
      const result = await this.repository.createExaminationMethod(c, {
        examination_id: examinationId,
        method_id: method.method_id,
      })
      results.push({
        id: result.id,
        method_id: method.method_id,
      })
    }
    return results
  }

  async createExamination(c: Context, body: SetupExaminationBody) {
    const examinationId = body.examination_id

    const parameters = body.parameters?.length
      ? await this.insertParameters(c, examinationId, body.parameters)
      : []

    const { targetGroupResults, allTargetMaterials } = body.target_groups
      ?.length
      ? await this.insertTargetGroupsWithMaterials(
          c,
          examinationId,
          body.target_groups
        )
      : { targetGroupResults: [], allTargetMaterials: [] }

    const methods = body.methods?.length
      ? await this.insertMethods(c, examinationId, body.methods)
      : []

    return {
      examination_id: examinationId,
      parameters,
      target_groups: targetGroupResults,
      methods,
      target_materials: allTargetMaterials,
    }
  }

  async createBmhpParameter(c: Context, body: CreateBmhpParameterBody) {
    const result = await this.repository.createBmhpParameter(c, {
      name: body.name,
      description: body.description,
      is_active: body.is_active,
    })

    return { id: result.id, name: body.name }
  }

  async createBmhpTargetGroup(c: Context, body: CreateBmhpTargetGroupBody) {
    const result = await this.repository.createBmhpTargetGroup(c, {
      name: body.name,
      description: body.description,
      is_active: body.is_active,
    })

    return { id: result.id, name: body.name }
  }

  async createBmhpExaminationMethod(
    c: Context,
    body: CreateBmhpExaminationMethodBody
  ) {
    const result = await this.repository.createBmhpExaminationMethod(c, {
      name: body.name,
      description: body.description,
      is_active: body.is_active,
    })

    return { id: result.id, name: body.name }
  }

  async createBmhpMaterial(c: Context, body: CreateBmhpMaterialBody) {
    const result = await this.repository.createBmhpMaterial(c, {
      name: body.name,
      is_reagen: body.is_reagen,
      description: body.description,
      is_active: body.is_active,
    })

    return { id: result.id, name: body.name }
  }

  async getCityDistrictHealthOfficeTarget(
    c: Context,
    body: CityDistrictHealthOfficeTargetBody
  ) {
    const entityId = c.var.userEntity?.global_id
    if (!entityId) {
      throw new BadRequestError("Entity ID not found")
    }

    // Get program_plan_ids for requested and previous years
    const [requestedYearPlan, targetYearPlan] = await Promise.all([
      this.repository.findProgramPlansByYearAndApproach(c, body.year),
      this.repository.findProgramPlansByYearAndApproach(c, body.year - 1),
    ])

    if (!requestedYearPlan) {
      return {
        success: true,
        message: "Previous year data fetched successfully",
        data: body.target_group_ids.map((tgId) => ({
          target_group_id: tgId,
          target_group_name: null,
          previous_sample_count: 0,
          previous_test_count: 0,
          original_target: 0,
        })),
      }
    }

    const [rows, targetGroups, originalTargetRows] = await Promise.all([
      targetYearPlan
        ? this.repository.findCityDistrictHeatlOfficeTargetData(
            c,
            entityId,
            body.examination_id,
            requestedYearPlan.id,
            targetYearPlan.id,
            body.target_group_ids
          )
        : Promise.resolve([]),
      this.repository.findTargetGroupsByIds(c, body.target_group_ids),
      this.repository.findRequestedYearOriginalTarget(
        c,
        entityId,
        body.examination_id,
        requestedYearPlan.id,
        body.target_group_ids
      ),
    ])

    // Map target group names — always available regardless of planning data
    const nameMap = new Map<number, string>(
      targetGroups.map((tg: any) => [Number(tg.id), tg.name as string])
    )

    // Map planning data keyed by target_group_id
    const planningMap = new Map<
      number,
      { sample_count: number; test_count: number }
    >(
      rows.map((r: any) => [
        Number(r.target_group_id),
        {
          sample_count: Number(r.sample_count),
          test_count: Number(r.test_count),
        },
      ])
    )

    // Map requested-year original_target keyed by target_group_id
    const originalTargetMap = new Map<number, number>(
      originalTargetRows.map((r: any) => [
        Number(r.target_group_id),
        Number(r.original_target),
      ])
    )

    const data = body.target_group_ids.map((tgId) => {
      const planning = planningMap.get(tgId)
      return {
        target_group_id: tgId,
        target_group_name: nameMap.get(tgId) ?? null,
        previous_sample_count: planning?.sample_count ?? 0,
        previous_test_count: planning?.test_count ?? 0,
        original_target: originalTargetMap.get(tgId) ?? 0,
      }
    })

    return {
      success: true,
      message: "Previous year data fetched successfully",
      data,
    }
  }
}
