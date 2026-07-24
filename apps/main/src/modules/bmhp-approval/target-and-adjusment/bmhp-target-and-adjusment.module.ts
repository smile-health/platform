import { Context } from "hono"
import { BadRequestError } from "@smile/lib/error.js"
import BaseTemplate from "@smile/lib/excel/index.js"
import { PROCESSOR } from "@smile/lib/excel/types.js"
import momentTZ from "moment-timezone"
import { BmhpTargetAdjustmentRepository } from "./bmhp-target-and-adjusment.repository.js"
import { BmhpApprovalNotificationPublisher } from "../notification/bmhp-approval-notification.publisher.js"
import {
  GetVerifyBmhpPlanningQuery,
  GetTargetInputQuery,
  UpdateTargetInputBody,
  UpdateVerifyBmhpPlanningBody,
  BulkUpdateVerificationStatusBody,
  UpdateVerificationStatusBody,
  RevisionProgramPlanBody,
  TemplateVerificationQuery,
  GetMinistryRecapitulationQuery,
  GetMinistryRecapitulationDetailQuery,
} from "./bmhp-target-and-adjusment.schema.js"
import { buildMinistryRecapitulationExcel } from "./bmhp-target-and-adjusment.excel.js"

/** Convert 1-based column index to Excel letter (1→A, 26→Z, 27→AA, …) */
function numToCol(n: number): string {
  let result = ""
  while (n > 0) {
    const rem = (n - 1) % 26
    result = String.fromCodePoint(65 + rem) + result
    n = Math.floor((n - 1) / 26)
  }
  return result
}

// ── Shared target-entry builder ───────────────────────────────────────────────

type ScreeningStatus = "completed" | "not_applicable" | "not_submitted"

type TargetEntry = {
  id: number | null
  examination_id: number
  target_id: number | null
  target: number
  adjustment_target: number
  verification_status: number
  is_not_screening: boolean
  item_status: ScreeningStatus
}

type ExamDef = {
  id: number
  name: string
  target_groups: Array<{ id: number; name: string }>
}

function buildSingleTargetEntry(
  exam: ExamDef,
  examPlannings: Array<Record<string, any>>,
  hasPlanning: boolean
): TargetEntry {
  const firstPlanning = examPlannings[0]
  const adjustmentTarget = hasPlanning ? firstPlanning?.test_count || 0 : 0

  // completed: punya adjusted target
  // not_submitted: belum ada adjusted target
  let item_status: ScreeningStatus = "not_submitted"
  if (adjustmentTarget > 0) {
    item_status = "completed"
  }

  return {
    id: hasPlanning ? (firstPlanning?.planning_id ?? null) : null,
    examination_id: exam.id,
    target_id: null,
    target: hasPlanning ? firstPlanning?.original_target || 0 : 0,
    adjustment_target: adjustmentTarget,
    verification_status: hasPlanning
      ? (firstPlanning?.verification_status ?? 0)
      : 0,
    is_not_screening: true,
    item_status,
  }
}

/**
 * Build the flat target array for one entity across all examinations.
 * Shared by getVerifyPlanning and any future callers.
 */
function buildTargetEntries(
  examinations: ExamDef[],
  entityPlanningData: Array<Record<string, any>>
): TargetEntry[] {
  return examinations.flatMap((exam) => {
    const examPlannings = entityPlanningData.filter(
      (pd) => pd.examination_id === exam.id
    )
    const hasPlanning = examPlannings.length > 0

    if (exam.target_groups.length === 0) {
      return buildSingleTargetEntry(exam, examPlannings, hasPlanning)
    }

    // Calculate aggregate data for this examination (same as monitoring)
    const hasTargetGroup = examPlannings.some(
      (pd) => pd.target_group_planning_id !== null
    )
    // Determine if examination is "not_applicable" (has planning but no target groups)
    const isExamNotApplicable = hasPlanning && !hasTargetGroup

    return buildScreeningTargetEntries(
      exam,
      entityPlanningData,
      isExamNotApplicable
    )
  })
}

function buildScreeningTargetEntries(
  exam: ExamDef,
  entityPlanningData: Array<Record<string, any>>,
  isExamNotApplicable: boolean
): TargetEntry[] {
  return exam.target_groups.map((tg) => {
    const existingData = entityPlanningData.find(
      (pd) => pd.examination_id === exam.id && pd.target_group_id === tg.id
    )

    // Calculate status (same logic as monitoring)
    // not_applicable: examination has planning but no target groups at all
    // completed: has adjusted target (test_count > 0)
    // not_submitted: has no adjusted target
    // revision: target group row exists but was rejected (verification_status = 2)
    let item_status: ScreeningStatus = "not_submitted"

    const adjustmentTarget = existingData?.test_count || 0
    const verificationStatus = existingData?.verification_status ?? 0

    if (isExamNotApplicable) {
      item_status = "not_applicable"
    } else if (adjustmentTarget > 0 && verificationStatus !== 0) {
      item_status = "completed"
    } else if (
      existingData &&
      (verificationStatus === 1 || verificationStatus === 2)
    ) {
      // Record exists with test_count=0 and has gone through approval/rejection flow:
      // verification_status=2: rejected (revision needed)
      // verification_status=1: approved with zero adjustment — treat as not_applicable
      item_status = "not_applicable"
    }

    if (existingData) {
      return {
        id: existingData.target_group_planning_id,
        examination_id: exam.id,
        target_id: tg.id,
        target: existingData.original_target || 0,
        adjustment_target: adjustmentTarget,
        verification_status: verificationStatus,
        is_not_screening: adjustmentTarget === 0,
        item_status,
      }
    }

    return {
      id: null,
      examination_id: exam.id,
      target_id: tg.id,
      target: 0,
      adjustment_target: 0,
      verification_status: 0,
      is_not_screening: true,
      item_status,
    }
  })
}

// ── Types for getVerificationTemplate helper methods ───────────────────────────

type TargetGroupPair = {
  exam: ExamDef
  tgId: number | null
  tgName: string
}

type HeaderRows = {
  row1: (string | null)[]
  row2: (string | null)[]
  row3: (string | null)[]
}

export class BmhpTargetAdjustmentModule {
  constructor(
    public repository: BmhpTargetAdjustmentRepository,
    private readonly notificationPublisher: BmhpApprovalNotificationPublisher
  ) {}

  // ── Private helper methods for getVerificationTemplate ───────────────────────

  /**
   * Build ordered list of (exam, target_group) pairs for column headers.
   */
  private buildTargetGroupPairs(examinations: ExamDef[]): TargetGroupPair[] {
    const pairs: TargetGroupPair[] = []
    for (const exam of examinations) {
      if (exam.target_groups.length === 0) {
        pairs.push({ exam, tgId: null, tgName: "Bukan Skrining" })
      } else {
        for (const tg of exam.target_groups) {
          pairs.push({ exam, tgId: tg.id, tgName: tg.name })
        }
      }
    }
    return pairs
  }

  /**
   * Build the 3-row header structure for the Excel template.
   */
  private buildHeaderRows(tgPairs: TargetGroupPair[]): HeaderRows {
    return {
      row1: [null, null, null, ...tgPairs.map((p) => p.tgName)],
      row2: [null, null, null, ...tgPairs.map((p) => p.exam.name)],
      row3: [null, null, "Nama Layanan Kesehatan", ...tgPairs.map(() => "Target")],
    }
  }

  /**
   * Build entity data rows with pre-filled target values.
   */
  private buildDataRows(
    entities: any[],
    planningData: any[],
    tgPairs: TargetGroupPair[]
  ): any[][] {
    return entities.map((entity, index) => {
      const entityPlanningData = planningData.filter(
        (pd: { entity_id: number }) => pd.entity_id === entity.entity_id
      )

      const targets = tgPairs.map(({ exam, tgId }) => {
        if (tgId === null) {
          const pd = entityPlanningData.find(
            (p: { examination_id: number }) => p.examination_id === exam.id
          )
          return pd?.sample_count ?? 0
        }
        const pd = entityPlanningData.find(
          (p: { examination_id: number; target_group_id: number }) =>
            p.examination_id === exam.id && p.target_group_id === tgId
        )
        return pd?.sample_count ?? 0
      })

      return [index + 1, Number(entity.entity_id), entity.entity_name ?? "", ...targets]
    })
  }

  /**
   * Apply cell-level protection to the Excel sheet.
   */
  private async applyCellProtection(
    excelTemplate: any,
    title: string,
    dataRows: any[][],
    numTargetCols: number
  ): Promise<void> {
    const sheet = excelTemplate.processor.workbook.getWorksheet(title)
    if (!sheet) return

    const totalDataRows = dataRows.length
    const lastRow = 3 + totalDataRows
    const totalCols = 3 + numTargetCols

    // Unlock all cells first
    for (let r = 1; r <= lastRow; r++) {
      for (let col = 1; col <= totalCols; col++) {
        sheet.getRow(r).getCell(col).protection = { locked: false }
      }
    }

    // Lock header rows (1-3)
    for (let r = 1; r <= 3; r++) {
      for (let col = 1; col <= totalCols; col++) {
        sheet.getRow(r).getCell(col).protection = { locked: true }
      }
    }

    // Lock read-only columns (A, B, C) for data rows
    for (let r = 4; r <= lastRow; r++) {
      sheet.getRow(r).getCell(1).protection = { locked: true }
      sheet.getRow(r).getCell(2).protection = { locked: true }
      sheet.getRow(r).getCell(3).protection = { locked: true }
    }

    // Enable sheet protection
    await sheet.protect("", {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
    })
  }

  /**
   * GET /bmhp-approval/verifications
   * Get all entities under a regency with their planning verification data (no pagination)
   * Always returns all puskesmas data, even if examination or target group data is unavailable
   */
  async getVerifyPlanning(c: Context, query: GetVerifyBmhpPlanningQuery) {
    const { program_plan_id: programPlanId, keyword, examination_id } = query

    // Handle regency_id parameter - it could be either:
    // 1. A location regency_id (e.g., "3323")
    // 2. An entity_id of a dinkes/kabupaten (e.g., 10987)
    let regency_id: number | undefined

    if (query.regency_id) {
      regency_id = await this.repository.findRegencyIdByEntityIdSatuSehat(
        c,
        Number(query.regency_id)
      )
    }

    // Fallback to user's regency_id if not provided
    if (!regency_id) {
      regency_id = Number((c.var as any).userEntity?.regency_id)
    }

    // Get examinations with their target groups for this year
    const examinations = await this.repository.getExaminationsByProgramPlan(
      c,
      programPlanId,
      examination_id
    )

    // Build flat target_group list: one entry per target_group+examination combo
    const target_group = examinations.flatMap((exam) =>
      exam.target_groups.map((tg) => ({
        id: tg.id,
        name: tg.name,
        examination_id: exam.id,
        examination: exam.name,
      }))
    )

    // Get ALL entities with their planning data (no pagination)
    const { entities, planningData, seeCalculation } =
      await this.repository.getAllEntitiesForExport(c, {
        regencyId: regency_id,
        programPlanId,
        keyword,
        examinationIds: examination_id,
      })

    // Build the data structure - always return all puskesmas
    const data = entities.map((entity) => {
      const entityPlanningData = planningData.filter(
        (pd) => pd.entity_id === entity.entity_id
      )

      const planningId = entityPlanningData[0]?.planning_id || null

      const latestPlanning = entityPlanningData.reduce(
        (latest, pd) => {
          if (!latest || (pd.updated_at && pd.updated_at > latest.updated_at)) {
            return pd
          }
          return latest
        },
        null as (typeof entityPlanningData)[0] | null
      )

      // Build flat target array: one item per examination+target_group combo
      // If no examinations exist, still return empty target array
      const target = buildTargetEntries(
        examinations as ExamDef[],
        entityPlanningData
      )

      return {
        id: planningId,
        entity_name: {
          id: entity.entity_id,
          name: entity.entity_name,
          address: entity.entity_address ?? null,
        },
        target,
        updated_at: latestPlanning?.updated_at ?? null,
        updated_by: latestPlanning?.updated_by ?? null,
        user_updated_by: latestPlanning?.updated_by
          ? {
              firstname: latestPlanning.updater_firstname ?? null,
              lastname: latestPlanning.updater_lastname ?? null,
            }
          : null,
      }
    })

    return {
      target_group,
      data,
      see_calculation: seeCalculation,
    }
  }

  /**
   * GET /bmhp-approval/verifications/export
   * Export verification data to Excel with merged-header layout:
   *
   * | Entity Name | ---- Examination 1 ---- | ---- Examination 2 ---- |
   * |             | - TG 1 - | - TG 2 -    | - TG 1 - | ...          |
   * |             | Target | Adj. Target   | Target | Adj. Target     |
   * | Puskesmas A | 100    | 90            | 200    | 180             |
   */
  async exportVerifyPlanning(c: Context, query: GetVerifyBmhpPlanningQuery) {
    const { program_plan_id: programPlanId, keyword, examination_id } = query
    const regency_id = Number((c.var as any).userEntity?.regency_id)
    const title = c.var.t("bmhp-target-adjustment.title-verify")
    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = momentTZ().tz(timezone)
    const formatDate =
      currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase() +
      " GMT" +
      currentTime.format("Z").replace(":00", "")
    const filename = `BmhpTargetAdjustmentVerification_${currentTime.format("YYYYMMDD_HHmm")} ${formatDate}_${c.var.language || "en"}`

    const examinations = await this.repository.getExaminationsByProgramPlan(
      c,
      programPlanId,
      examination_id
    )

    const { entities, planningData } =
      await this.repository.getAllEntitiesForExport(c, {
        regencyId: regency_id,
        programPlanId,
        keyword,
        examinationIds: examination_id,
      })

    // --- Build header structure ---
    // Row 1: null (A1 placeholder) | ExamName (repeated per TG count) | ...
    // Row 2: null                  | TGName (repeated 2 times)        | ...
    // Row 3: "Nama Entitas"        | "Target" | "Adj. Target"         | ...
    const headerRow1: (string | null)[] = [null]
    const headerRow2: (string | null)[] = [null]
    const headerRow3: (string | null)[] = [
      c.var.t("bmhp-target-adjustment.export.entity-name"),
    ]

    // colIndex is 1-based; col 1 = A (entity name)
    let colIndex = 2
    const examMerges: { start: number; end: number; name: string }[] = []
    const tgMerges: { start: number; end: number; name: string }[] = []
    const entityNameColWidth = Math.min(
      60,
      Math.max(20, ...entities.map((e) => (e.entity_name ?? "").length))
    )
    const columnWidths: number[] = [entityNameColWidth] // col A

    for (const exam of examinations) {
      const examStart = colIndex
      if (exam.target_groups.length === 0) {
        // Bukan Skrining: no target groups, just show 1 column set "Target | Adj. Target"
        headerRow1.push(null, null)
        headerRow2.push(null, null)
        headerRow3.push(
          c.var.t("bmhp-target-adjustment.export.target"),
          c.var.t("bmhp-target-adjustment.export.adj-target")
        )
        tgMerges.push({ start: colIndex, end: colIndex + 1, name: exam.name })
        columnWidths.push(12, 14)
        colIndex += 2
      } else {
        for (const tg of exam.target_groups) {
          // Each target group = 2 sub-columns: Target, Adj. Target
          headerRow1.push(null, null)
          headerRow2.push(null, null)
          headerRow3.push("Target", "Adj. Target")
          tgMerges.push({ start: colIndex, end: colIndex + 1, name: tg.name })
          columnWidths.push(12, 14)
          colIndex += 2
        }
      }
      examMerges.push({ start: examStart, end: colIndex - 1, name: exam.name })
    }

    // Set exam/TG names at their starting column in header rows
    for (const em of examMerges) {
      headerRow1[em.start - 1] = em.name
    }
    for (const tg of tgMerges) {
      headerRow2[tg.start - 1] = tg.name
    }

    // --- Build data rows ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataRows = (entities as any[]).map((entity) => {
      const entityPlanningData = planningData.filter(
        (pd: { entity_id: number }) => pd.entity_id === entity.entity_id
      )
      const row: (string | number | null)[] = [entity.entity_name ?? ""]
      for (const exam of examinations) {
        if (exam.target_groups.length === 0) {
          const pd = entityPlanningData.find(
            (p: { examination_id: number }) => p.examination_id === exam.id
          )
          row.push(pd?.sample_count ?? 0, pd?.test_count ?? 0)
        } else {
          for (const tg of exam.target_groups) {
            const pd = entityPlanningData.find(
              (p: { examination_id: number; target_group_id: number }) =>
                p.examination_id === exam.id && p.target_group_id === tg.id
            )
            row.push(pd?.sample_count ?? 0, pd?.test_count ?? 0)
          }
        }
      }
      return row
    })

    // --- Build Excel ---
    const excelTemplate = new BaseTemplate(4, 1, PROCESSOR.EXCELJS)
    await excelTemplate.initSheet(title)
    excelTemplate.setTitle(title)
    excelTemplate.setLanguage(c.var.language)
    excelTemplate.setTimezone(timezone)

    excelTemplate.setColumns(
      columnWidths.map((width) => ({ header: "", width })),
      "A1",
      title
    )

    // Add 3 header rows starting at row 1
    await excelTemplate.addRows(
      title,
      [headerRow1, headerRow2, headerRow3],
      1,
      "A"
    )

    // A1:A3 — entity name header spanning all 3 rows
    // NOTE: updateMergedCellValue handles the merge internally; do NOT also call mergeCells for it
    await excelTemplate.updateMergedCellValue(
      title,
      "A1",
      "A3",
      c.var.t("bmhp-target-adjustment.export.entity-name")
    )

    // Merge examination name cells across row 1
    for (const em of examMerges) {
      const startCell = `${numToCol(em.start)}1`
      const endCell = `${numToCol(em.end)}1`
      excelTemplate.mergeCells(title, startCell, endCell, true)
    }

    // Merge target group name cells across row 2
    for (const tg of tgMerges) {
      const startCell = `${numToCol(tg.start)}2`
      const endCell = `${numToCol(tg.end)}2`
      excelTemplate.mergeCells(title, startCell, endCell, true)
    }

    await excelTemplate.setRowFontBold(title, 1, "A")
    await excelTemplate.setRowFontBold(title, 2, "A")
    await excelTemplate.setRowFontBold(title, 3, "A")

    if (dataRows.length > 0) {
      await excelTemplate.addRows(title, dataRows, 4, "A")
    }

    return await excelTemplate.generate(filename)
  }

  /**
   * GET /bmhp-approval/verifications/template
   * Generates a blank xlsx template for adjustment_target bulk input.
   *
   * Layout (3-row merged header, 1 data row per entity):
   *
   * Row 1: "No" | "Nama Layanan Kesehatan" | ExamName (merged per TG count) | ...
   * Row 2:      |                           | TGName                         | ...
   * Row 3:      |                           | Target                         | ...
   * Row 4+: entity_id | Nama Puskesmas | (empty) | ...
   *
   * Column A (entity_id) is the DB entity_id — label "No" to users.
   * On import, col A is read as the entity_id for upsert.
   */
  async getVerificationTemplate(c: Context, query: TemplateVerificationQuery) {
    const { program_plan_id: programPlanId } = query
    const regency_id = Number((c.var as any).userEntity?.regency_id)
    const title = "Template Adjustment Target BMHP"
    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = momentTZ().tz(timezone)
    const formatDate =
      currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase() +
      " GMT" +
      currentTime.format("Z").replace(":00", "")
    const filename = `TemplateAdjustmentTargetBMHP_${currentTime.format("YYYYMMDD_HHmm")} ${formatDate}_en`

    const examinations = await this.repository.getExaminationsByProgramPlan(c, programPlanId)
    const { entities, planningData } = await this.repository.getAllEntitiesForExport(c, {
      regencyId: regency_id,
      programPlanId,
    })

    // Build target group pairs for column headers
    const tgPairs = this.buildTargetGroupPairs(examinations as ExamDef[])
    const N = tgPairs.length

    // Calculate column widths
    const entityNameColWidth = Math.min(
      60,
      Math.max(20, ...entities.map((e: any) => (e.entity_name ?? "").length))
    )
    const columnWidths: number[] = [8, 0.1, entityNameColWidth, ...new Array(N).fill(20)]

    // Build header rows using helper method
    const { row1: headerRow1, row2: headerRow2, row3: headerRow3 } = this.buildHeaderRows(tgPairs)

    // Build entity data rows using helper method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataRows = this.buildDataRows(entities as any[], planningData, tgPairs)

    // --- Build Excel ---
    const excelTemplate = new BaseTemplate(4, 1, PROCESSOR.EXCELJS)
    await excelTemplate.initSheet(title)
    excelTemplate.setTitle(title)
    excelTemplate.setLanguage(c.var.language)
    excelTemplate.setTimezone(timezone)

    excelTemplate.setColumns(columnWidths.map((width) => ({ header: "", width })), "A1", title)

    // Add 3 header rows starting at row 1
    await excelTemplate.addRows(title, [headerRow1, headerRow2, headerRow3], 1, "A")

    // Merge header cells
    await excelTemplate.updateMergedCellValue(title, "A1", "A3", "No")
    await excelTemplate.updateMergedCellValue(title, "C1", "C3", "Nama Layanan Kesehatan")

    // Format header rows
    for (let r = 1; r <= 3; r++) {
      await excelTemplate.setRowFontBold(title, r, "A")
      await excelTemplate.setRowAlignCenter(title, r, "A")
    }

    // Add data rows
    if (dataRows.length > 0) {
      await excelTemplate.addRows(title, dataRows, 4, "A")
      for (let i = 0; i < dataRows.length; i++) {
        await excelTemplate.setRowAlignCenter(title, 4 + i, "D")
      }
    }

    // Apply cell protection using helper method
    await this.applyCellProtection(excelTemplate, title, dataRows, N)

    return await excelTemplate.generate(filename)
  }

  /**
   * POST /bmhp-approval/verifications/import
   * Processes rows parsed by the excel middleware and saves adjustment_target
   * for each entity+target_group combination.
   *
   * Each importRow looks like:
   * {
   *   entity_id: number,
   *   targetInput: Array<{ examination_id: number; target_id: number | null; current_id: number | null }>
   *     — with adjustment_target value injected at this level
   * }
   *
   * The middleware resolves examination_id and target_id from the column headers,
   * then passes structured rows here.
   */
  async importVerificationTemplate(
    c: Context,
    programPlanId: number,
    rows: Array<{
      entity_id: number
      target_input: Array<{
        id: number | null
        examination_id: number
        target_id: number | null
        target: number
      }>
    }>
  ) {
    const year = await this.repository.getYearByProgramPlan(c, programPlanId)
    if (!year) {
      throw new BadRequestError("Program plan not found or year is not set.")
    }

    const summary = {
      total: rows.length,
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; message: string }>,
    }

    for (const [i, row] of rows.entries()) {
      try {
        if (row.target_input.length === 0) {
          summary.success++
          continue
        }
        await this.repository.upsertTargetInput(c, {
          programPlanId,
          entityId: row.entity_id,
          year,
          targetInput: row.target_input,
        })
        summary.success++
      } catch (e) {
        summary.failed++
        summary.errors.push({
          row: i + 4, // data starts at excel row 4
          message: (e as Error)?.message || "Unknown error",
        })
      }
    }

    return {
      status: true,
      message: "Import adjustment target selesai",
      data: summary,
    }
  }

  /**
   * PATCH /bmhp-approval/verifications
   * Update planning verification data.
   * Only send items that have changed (delta from frontend).
   * Items with status=false trigger revision notifications to puskesmas.
   */
  async updateVerifyPlanning(c: Context, body: UpdateVerifyBmhpPlanningBody) {
    const { program_plan_id, data } = body
    const kabupatenEntityId = Number(c.var.userEntity.global_id)

    // Find or create kabupaten-level approval period (needed for revision notifications)
    const approvalPeriodId = await this.repository.getOrCreateApprovalPeriod(
      c,
      kabupatenEntityId,
      program_plan_id
    )

    const results: Array<{ planning_id: number; entity_id: number }> = []

    for (const entityData of data) {
      const entityResults = await this._processEntityVerification(
        c,
        entityData,
        approvalPeriodId
      )
      results.push(...entityResults)
    }

    return {
      status: true,
      message: c.var.t("bmhp-target-adjustment.message.planning-updated"),
      data: results,
    }
  }

  private async _processEntityVerification(
    c: Context,
    entityData: UpdateVerifyBmhpPlanningBody["data"][0],
    approvalPeriodId: number
  ) {
    const { entity_id, target } = entityData
    const results: Array<{ planning_id: number; entity_id: number }> = []

    // Group target items by examination_id using a Map
    const targetByExamination = new Map<number, typeof target>()
    for (const item of target) {
      const existing = targetByExamination.get(item.examination_id) ?? []
      existing.push(item)
      targetByExamination.set(item.examination_id, existing)
    }

    // Process each examination separately
    for (const [examinationId, targetItems] of targetByExamination) {
      const planningResult = await this.repository.upsertPlanning(c, {
        entity_id,
        approval_period_id: approvalPeriodId,
        examination_id: examinationId,
        status: "DRAFT",
      })

      const actualPlanningId = Number(planningResult.id)

      const rejectedItems = await this._processExaminationTargets(
        c,
        targetItems,
        actualPlanningId
      )

      if (rejectedItems.length > 0) {
        await this.repository.insertRevisionNotification(c, {
          approval_period_id: approvalPeriodId,
          puskesmas_entity_id: entity_id,
          message:
            rejectedItems[0]?.revision_note ??
            c.var.t("bmhp-target-adjustment.message.revision-needed"),
        })
      }

      results.push({ planning_id: actualPlanningId, entity_id })
    }

    return results
  }

  private async _lookupExistingTargetGroupId(
    c: Context,
    id: number | null,
    planningId: number
  ): Promise<number | undefined> {
    if (id === null) return undefined
    return await this.repository.findPlanningTargetGroupIdByIdAndPlanning(
      c,
      id,
      planningId
    )
  }

  private async _processExaminationTargets(
    c: Context,
    targetItems: UpdateVerifyBmhpPlanningBody["data"][0]["target"],
    actualPlanningId: number
  ) {
    const rejectedItems: UpdateVerifyBmhpPlanningBody["data"][0]["target"] = []

    for (const targetItem of targetItems) {
      const isRejected = await this._processSingleExaminationTarget(
        c,
        targetItem,
        actualPlanningId
      )

      if (isRejected) {
        rejectedItems.push(targetItem)
      }
    }

    return rejectedItems
  }

  private async _processSingleExaminationTarget(
    c: Context,
    targetItem: UpdateVerifyBmhpPlanningBody["data"][0]["target"][0],
    actualPlanningId: number
  ): Promise<boolean> {
    const {
      id,
      target_id,
      target: sampleCount,
      adjustment_target: testCount,
      status,
      revision_note,
    } = targetItem

    // status=true → approved (1), status=false → rejected/needs revision (2)
    const verificationStatus = status ? 1 : 2
    const finalSampleCount = status ? sampleCount : 0
    const finalTestCount = status ? testCount : 0

    let existingId: number | undefined = undefined
    if (id !== null) {
      existingId = await this.repository.findPlanningTargetGroupIdByIdAndPlanning(
        c,
        id,
        actualPlanningId
      )
    }

    if (target_id !== null) {
      await this.repository.upsertPlanningTargetGroup(c, {
        id: existingId,
        planning_id: actualPlanningId,
        target_group_id: target_id,
        sample_count: finalSampleCount,
        test_count: finalTestCount,
        verification_status: verificationStatus,
        revision_note,
      })
    }

    return !status
  }

  /**
   * GET /bmhp-approval/verifications/target-input
   * Returns entity metadata + full target_input list for the Add Target Drawer.
   * program_plan_id in the query is a YEAR value (e.g. 2026).
   */
  async getTargetInput(c: Context, query: GetTargetInputQuery) {
    const { program_plan_id: programPlanId, entity_id } = query

    const result = await this.repository.getTargetInputForEntity(
      c,
      programPlanId,
      entity_id
    )

    if (!result) {
      throw new BadRequestError(
        c.var.t("bmhp-target-adjustment.message.entity-not-found")
      )
    }

    const { programPlan, entity, examinations, planningData } = result

    // Build the flat target_input array covering every examination × target-group combo
    const target_input: Array<{
      id: number | null
      examination_id: number
      examination_name: string
      target_id: number | null
      target_group_name: string | null
      target: number
      adjustment_target: number
      is_not_screening: boolean
      item_status: ScreeningStatus
    }> = []

    for (const exam of examinations) {
      target_input.push(
        ...this._buildTargetInputEntries(exam as ExamDef, planningData as any[])
      )
    }

    return {
      entity: {
        id: entity.entity_id,
        name: entity.entity_name,
        address: entity.entity_address ?? null,
      },
      program_plan: {
        id: Number(programPlan.id),
        year: Number(programPlan.year),
      },
      province: {
        id: entity.province_id ? Number(entity.province_id) : null,
        name: entity.province_name ?? null,
      },
      regency: {
        id: entity.regency_id ? Number(entity.regency_id) : null,
        name: entity.regency_name ?? null,
      },
      target_input,
    }
  }

  /**
   * PATCH /bmhp-approval/verifications/target-input
   * Saves adjustment targets entered from the Add Target Drawer for one entity.
   * program_plan_id in the body is the ACTUAL DB id (not year).
   * Only adjustment_target (test_count) is written — the original target is never overwritten.
   */
  async updateTargetInput(c: Context, body: UpdateTargetInputBody) {
    const { program_plan_id, entity_id, target_input } = body

    // Resolve year from the real program_plan_id
    const year = await this.repository.getYearByProgramPlan(c, program_plan_id)
    if (!year) {
      throw new BadRequestError(
        c.var.t("bmhp-target-adjustment.message.program-plan-not-found")
      )
    }

    const updatedCount = await this.repository.upsertTargetInput(c, {
      programPlanId: program_plan_id,
      entityId: entity_id,
      year,
      targetInput: target_input,
    })

    return {
      status: true,
      message: c.var.t("bmhp-target-adjustment.message.adjustment-saved"),
      data: {
        entity_id,
        updated_count: updatedCount,
      },
    }
  }

  /**
   * POST /bmhp-approval/verifications/status
   * Approve/reject all planning data for an entity.
   * program_plan_id in the body is the ACTUAL DB id (not year).
   * status=true means approve, false means reject (needs revision).
   * Rejected entities will receive a revision notification.
   * If approving, all verification_status for the entity's target groups will be set to 1 (approved).
   * If rejecting, all verification_status will be set to 2 (rejected/needs revision) and a notification will be sent.
   */
  async bulkUpdateVerificationStatus(
    c: Context,
    body: BulkUpdateVerificationStatusBody
  ) {
    const { program_plan_id, status } = body
    const global_id = Number(c.var.userEntity?.global_id)
    const verificationStatus = status == 0 ? 2 : status

    const result = await this.repository.bulkUpdateVerificationStatus(c, {
      programPlanId: program_plan_id,
      status: verificationStatus,
      entityId: global_id,
    })

    return {
      status: true,
      message: "Verification status updated successfully",
      data: result,
    }
  }

  /**
   * PATCH /bmhp-approval/verifications/status
   * Approve/reject specific planning data for an entity.
   * body {
   *   program_plan_id: number (actual DB id, not year)
   *   target_group_id: number
   *   entity_id: number
   *   status: boolean (true=approve, false=reject)
   * }
   * If approving, the specified target group will be set to verification_status=1.
   * If rejecting, it will be set to 2 and a revision notification will be sent.
   */
  async updateVerificationStatus(
    c: Context,
    body: UpdateVerificationStatusBody
  ) {
    const { program_plan_id, target_group_id, material_id, entity_id, status } =
      body

    const result = await this.repository.updateVerificationStatus(c, {
      programPlanId: program_plan_id,
      targetGroupId: target_group_id,
      materialId: material_id,
      entityId: entity_id,
      status,
    })

    return {
      status: true,
      message: "Verification status updated successfully",
      data: result,
    }
  }

  /**
   * POST /bmhp-approval/verifications/revision
   * Updates the program plan's approval_status to 2 (Revision) and 1 for Approve
   * When status is 2 (revision), sends notification to all puskesmas users
   * that have target groups with verification_status = 2 (needs revision).
   */
  async revisionProgramPlan(c: Context, body: RevisionProgramPlanBody) {
    const { program_plan_id, status } = body
    const kabupatenEntityId = Number(c.var.userEntity.global_id)
    const finalStatus = status ?? 2
    const requireSignature = status !== undefined

    await this.repository.updateProgramPlanApprovalStatus(
      c,
      program_plan_id,
      finalStatus,
      kabupatenEntityId,
      requireSignature
    )

    if (finalStatus === 2) {
      // For plannings currently in "not_applicable" state (has target_groups,
      // all verification_status=1, all test_count=0), bump ws_bmhp_planning.status
      // to REVISION so puskesmas sees it needs action.
      await this.repository.markNotApplicablePlanningsAsRevision(
        c,
        program_plan_id
      )
    }

    if (finalStatus === 2) {
      try {
        const result =
          await this.notificationPublisher.sendRevisionNotification(
            c,
            program_plan_id
          )

        console.log(
          `[BMHP Revision] Notification result:`,
          JSON.stringify(result)
        )

        // Save notification logs to database for each notified user
        if (result.notified_user_ids && result.notified_user_ids.length > 0) {
          for (const userId of result.notified_user_ids) {
            try {
              await this.repository.saveRevisionNotificationLog(c, {
                user_id: userId,
                program_plan_id: program_plan_id,
                notification_type: "bmhp-revision",
                message: "Bmhp Approval Needs Revision",
                status: "SENT",
              })
            } catch (logError) {
              console.error(
                `[BMHP Revision] ⚠️ Failed to save log for user ${userId}:`,
                logError
              )
            }
          }
          console.log(
            `[BMHP Revision] ✓ Saved ${result.notified_user_ids.length} notification logs to database`
          )
        }
      } catch (error) {
        console.error(`[BMHP Revision] Failed to send notification:`, error)
      }
    }

    const message =
      finalStatus === 1
        ? "Program plan status successfully updated to approved"
        : "Program plan status successfully updated to revision"

    return {
      status: true,
      message,
      data: {
        entity_id: kabupatenEntityId,
        status: finalStatus,
        program_plan_id,
      },
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Build target_input entries for one examination row in getTargetInput.
   * Note: status field is hidden in this endpoint (unlike /verifications)
   */
  private _buildTargetInputEntries(
    exam: ExamDef,
    planningData: Array<Record<string, any>>
  ): Array<{
    id: number | null
    examination_id: number
    examination_name: string
    target_id: number | null
    target_group_name: string | null
    target: number
    adjustment_target: number
    is_not_screening: boolean
    item_status: ScreeningStatus
  }> {
    if (exam.target_groups.length === 0) {
      const existingData = planningData.find(
        (pd) => pd.examination_id === exam.id
      )
      const adjustmentTarget = existingData?.test_count ?? 0
      const verificationStatus = existingData?.verification_status ?? 0

      const item_status: ScreeningStatus =
        adjustmentTarget > 0 && verificationStatus !== 0 ? "completed" : "not_submitted"

      return [
        {
          id: existingData?.planning_id ?? null,
          examination_id: exam.id,
          examination_name: exam.name,
          target_id: null,
          target_group_name: "Bukan Skrining",
          target: existingData?.original_target ?? 0,
          adjustment_target: adjustmentTarget,
          is_not_screening: true,
          item_status,
        },
      ]
    }

    const examPlannings = planningData.filter(
      (pd) => pd.examination_id === exam.id
    )
    const hasPlanning = examPlannings.length > 0
    const tgRows = examPlannings.filter(
      (pd) => pd.target_group_planning_id !== null
    )
    const hasTargetGroup = tgRows.length > 0
    // not_applicable cases:
    // 1. exam has planning but zero target groups, OR
    // 2. has target groups AND all have verification_status IN (1,2) AND all test_count=0
    const allNaState =
      hasTargetGroup &&
      tgRows.every(
        (pd) =>
          (Number(pd.verification_status) === 1 ||
            Number(pd.verification_status) === 2) &&
          Number(pd.test_count) === 0
      )
    const isExamNotApplicable =
      (hasPlanning && !hasTargetGroup) || allNaState

    return exam.target_groups.map((tg) => {
      const existingData = planningData.find(
        (pd) => pd.examination_id === exam.id && pd.target_group_id === tg.id
      )

      const adjustmentTarget = existingData?.test_count ?? 0
      const verificationStatus = existingData?.verification_status ?? 0

      let item_status: ScreeningStatus = "not_submitted"
      if (isExamNotApplicable) {
        item_status = "not_applicable"
      } else if (adjustmentTarget > 0 && verificationStatus !== 0) {
        item_status = "completed"
      }

      if (existingData) {
        return {
          id: existingData.target_group_planning_id ?? null,
          examination_id: exam.id,
          examination_name: exam.name,
          target_id: tg.id,
          target_group_name: tg.name,
          target: existingData.original_target ?? 0,
          adjustment_target: adjustmentTarget,
          is_not_screening: adjustmentTarget === 0,
          item_status,
        }
      }

      return {
        id: null,
        examination_id: exam.id,
        examination_name: exam.name,
        target_id: tg.id,
        target_group_name: tg.name,
        target: 0,
        adjustment_target: 0,
        is_not_screening: true,
        item_status,
      }
    })
  }

  /**
   * GET /bmhp-approval/ministry-recapitulation/detail
   */
  async getMinistryRecapitulationDetail(
    c: Context,
    query: GetMinistryRecapitulationDetailQuery
  ) {
    const { program_plan_id, entity_id, province_id } = query
    const data = await this.repository.getMinistryRecapitulationDetail(c, {
      programPlanId: program_plan_id,
      entityId: entity_id,
      provinceId: province_id,
    })

    return {
      status: true,
      message: "Success get ministry recapitulation detail",
      data: {
        ...data,
        remaining_stock_date: data.remaining_stock_date
          ? new Date(data.remaining_stock_date).toISOString().split("T")[0]
          : null,
      },
    }
  }

  /**
   * GET /bmhp-approval/ministry-recapitulation
   * Get aggregated verification data grouped by material for a specific entity
   * Returns material-level data with unit, total_kebutuhan, sisa_stok, usulan_pengadaan, proposal_buffer, hasil_desk
   */
  async getMinistryRecapitulation(
    c: Context,
    query: GetMinistryRecapitulationQuery
  ) {
    const { program_plan_id, entity_id, page, paginate } = query

    const isPaginated = page !== undefined && paginate !== undefined

    if (!isPaginated) {
      const data = await this.repository.getMinistryRecapitulationByEntity(c, {
        programPlanId: program_plan_id,
        entityId: entity_id,
      })

      return {
        data: data.map((row: any) => ({
          id: row.id,
          material_id: row.material_id,
          variant_id: row.variant_id,
          name: row.name,
          unit: row.unit,
          total_kebutuhan: row.total_kebutuhan,
          sisa_stok: row.sisa_stok,
          usulan_pengadaan: row.usulan_pengadaan,
          proposal_buffer: row.proposal_buffer,
          hasil_desk: row.hasil_desk,
        })),
      }
    }

    const [totalItem, data] = await Promise.all([
      this.repository.countAllMinistryRecapitulation(c, {
        programPlanId: program_plan_id,
        entityId: entity_id,
      }),
      this.repository.getMinistryRecapitulationByEntity(c, {
        programPlanId: program_plan_id,
        entityId: entity_id,
        page,
        itemPerPage: paginate,
      }),
    ])

    const totalPage = paginate > 0 ? Math.ceil(totalItem / paginate) : 0

    return {
      page,
      item_per_page: paginate,
      total_item: totalItem,
      total_page: totalPage,
      list_pagination: [10, 25, 50, 100],
      data: data.map((row: any) => ({
        id: row.id,
        material_id: row.material_id,
        variant_id: row.variant_id,
        name: row.name,
        unit: row.unit,
        total_kebutuhan: row.total_kebutuhan,
        sisa_stok: row.sisa_stok,
        usulan_pengadaan: row.usulan_pengadaan,
        proposal_buffer: row.proposal_buffer,
        hasil_desk: row.hasil_desk,
      })),
    }
  }

  /**
   * GET /bmhp-approval/ministry-recapitulation/xls
   * Export ministry recapitulation as Excel file.
   */
  async exportMinistryRecapitulationExcel(
    c: Context,
    query: GetMinistryRecapitulationQuery
  ) {
    const { program_plan_id, entity_id } = query

    const data = await this.repository.getMinistryRecapitulationByEntity(c, {
      programPlanId: program_plan_id,
      entityId: entity_id,
    })

    const formattedData = data.map((row: any) => ({
      id: row.id,
      material_id: row.material_id,
      variant_id: row.variant_id,
      name: row.name,
      unit: row.unit,
      total_kebutuhan: row.total_kebutuhan,
      sisa_stok: row.sisa_stok,
      usulan_pengadaan: row.usulan_pengadaan,
      proposal_buffer: row.proposal_buffer,
      hasil_desk: row.hasil_desk,
    }))

    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = momentTZ().tz(timezone)
    const formatDate =
      currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase() +
      " GMT" +
      currentTime.format("Z").replace(":00", "")
    const filename = `MinistryRecapitulation_${currentTime.format("YYYYMMDD_HHmm")} ${formatDate}_en`

    return buildMinistryRecapitulationExcel(c, formattedData, filename)
  }
}
