import { ValidationError } from "@smile/lib/error.js"
import BaseTemplate from "@smile/lib/excel/index.js"
import { PROCESSOR } from "@smile/lib/excel/types.js"
import { Context } from "hono"
import { validator } from "hono/validator"
import { BmhpTargetAdjustmentRepository } from "./bmhp-target-and-adjusment.repository.js"

/**
 * Middleware that parses the imported xlsx template for
 * POST /bmhp-approval/verifications/import
 *
 * Template structure (image 2 style):
 *   Row 1: No | Nama Layanan Kesehatan | "<ExamName>\n<TGName>\nTarget" | ...
 *   Row 2: -  | -                      | (merged with row 1)            | ...
 *   Row 3+: pairs of rows per entity:
 *     Name row:    (empty) | PUSKESMAS NAME | (empty cells)
 *     Address row: entity_id | Jl. Address | target values  ← this is what we import
 *
 * Column A = entity_id (numeric, in address rows only)
 * Column B = entity_name/address (ignored on import)
 * Columns C+ = target values
 *
 * The TG name is extracted from row 1 header cells: the second line of
 * the stacked label "ExamName\nTGName\nTarget".
 */


const getNumOrZero = (v: unknown): number => {
  if (v == null || v === "") return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export class BmhpTargetAdjustmentExcelMiddleware {
  constructor(private readonly repository: BmhpTargetAdjustmentRepository) {}

  /**
   * Parse the uploaded buffer and return structured import rows.
   *
   * We use ExcelJS directly here to read multi-row headers accurately.
   * Row 2 contains target group names (or "Bukan Skrining").
   * Row 3 = "Adj. Target" labels (we use this to confirm data columns).
   * Data starts at row 4.
   */
  async #parseTemplate(
    c: Context,
    buffer: ArrayBuffer,
    programPlanId: number
  ): Promise<
    Array<{
      entity_id: number
      target_input: Array<{
        id: number | null
        examination_id: number
        target_id: number | null
        target: number
      }>
    }>
  > {
    // Load workbook via BaseTemplate to stay consistent
    const template = new BaseTemplate(4, 1, PROCESSOR.EXCELJS)
    await template.loadFromBuffer(buffer)

    // Access the underlying ExcelJS workbook via the processor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processor = (template as any).processor
    const sheet = processor.workbook.worksheets[0]

    if (!sheet) {
      throw new ValidationError("Template tidak valid: sheet tidak ditemukan")
    }

    const colMap = this.#buildColMap(sheet)

    if (colMap.size === 0) {
      throw new ValidationError(
        "Template tidak valid: kolom target group tidak ditemukan"
      )
    }

    // Resolve TG names → examination_id + target_group_id from DB
    const examinations = await this.repository.getExaminationsByProgramPlan(
      c,
      programPlanId
    )

    const tgLookup = this.#buildTgLookup(examinations)

    // Resolve column → examination_id + target_id
    const resolvedCols: Map<
      number,
      { examination_id: number; target_id: number | null }
    > = new Map()

    for (const [colNum, { tgName }] of colMap.entries()) {
      const resolved = tgLookup.get(tgName)
      if (resolved) {
        resolvedCols.set(colNum, { ...resolved })
      }
    }

    return this.#buildDataRows(sheet, resolvedCols)
  }

  // Build column mapping from the new layout:
  // Layout: No(1) | entity_id(2, hidden) | Nama(3) | Target_1..N (row3="Target")
  // Returns: Map<targetColNumber, { tgName: compositeKey }>
  // compositeKey = "examName||tgName" to avoid collision when multiple exams share the same TG name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #buildColMap(sheet: any): Map<number, { tgName: string }> {
    const colMap: Map<number, { tgName: string }> = new Map()
    const row1 = sheet.getRow(1) // TG names
    const row2 = sheet.getRow(2) // Exam names
    const row3 = sheet.getRow(3) // "Target" or "Nama Layanan Kesehatan"

    // Collect Target column positions (row3 = "Target")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    row3.eachCell({ includeEmpty: false }, (_cell: any, colNumber: number) => {
      const label = row3.getCell(colNumber).value?.toString()?.trim() ?? ""
      if (label === "Target") {
        const tgName = row1.getCell(colNumber).value?.toString()?.trim() ?? ""
        const examName = row2.getCell(colNumber).value?.toString()?.trim() ?? ""
        const compositeKey = `${examName}||${tgName}`
        if (tgName) {
          colMap.set(colNumber, { tgName: compositeKey })
        }
      }
    })

    return colMap
  }

  // Build lookup: compositeKey ("examName||tgName") → { examination_id, target_id } from DB examinations
  // Using composite key prevents collision when multiple exams share the same TG name
  #buildTgLookup(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    examinations: any[]
  ): Map<string, { examination_id: number; target_id: number | null }> {
    const tgLookup = new Map<
      string,
      { examination_id: number; target_id: number | null }
    >()

    for (const exam of examinations) {
      if (exam.target_groups.length === 0) {
        // Composite key: examName||Bukan Skrining
        tgLookup.set(`${exam.name}||Bukan Skrining`, {
          examination_id: exam.id,
          target_id: null,
        })
      } else {
        for (const tg of exam.target_groups) {
          // Composite key: examName||tgName
          tgLookup.set(`${exam.name}||${tg.name}`, { examination_id: exam.id, target_id: tg.id })
        }
      }
    }

    return tgLookup
  }

  // Parse data rows starting at row 4 and build the import result array
  #buildDataRows(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sheet: any,
    resolvedCols: Map<number, { examination_id: number; target_id: number | null }>
  ): Array<{
    entity_id: number
    target_input: Array<{
      id: number | null
      examination_id: number
      target_id: number | null
      target: number
    }>
  }> {
    const importRows: Array<{
      entity_id: number
      target_input: Array<{
        id: number | null
        examination_id: number
        target_id: number | null
        target: number
      }>
    }> = []

    for (
      let rowNum = 4;
      rowNum <= (sheet.lastRow?.number ?? sheet.rowCount);
      rowNum++
    ) {
      const row = sheet.getRow(rowNum)
      // Col B (2) stores entity_id (hidden)
      const entityIdRaw = row.getCell(2).value
      const entityId = entityIdRaw != null ? Number(entityIdRaw) : 0

      if (!entityId || !Number.isFinite(entityId) || entityId <= 0) continue

      const targetInput = Array.from(resolvedCols).map(
        ([colNum, { examination_id, target_id }]) => {
          return {
            id: null, // Always null — repository resolves existing ID from DB
            examination_id,
            target_id,
            target: getNumOrZero(row.getCell(colNum).value),
          }
        }
      ).filter(item => item.target > 0)

      importRows.push({ entity_id: entityId, target_input: targetInput })
    }

    return importRows
  }

  excel = validator("json", async (_val, c) => {
    const fileRequest = c.get("fileRequest")
    if (!fileRequest?.buffer) {
      throw new ValidationError("File tidak ditemukan")
    }

    // program_plan_id comes from the route query (already validated by validateRequest)
    // Access it via the raw query string since the validator hasn't run yet at middleware time
    const programPlanIdRaw = new URL(
      c.req.url,
      "http://localhost"
    ).searchParams.get("program_plan_id")
    const programPlanId = Number(programPlanIdRaw)

    if (!programPlanId || !Number.isFinite(programPlanId)) {
      throw new ValidationError("program_plan_id tidak valid")
    }

    const rows = await this.#parseTemplate(c, fileRequest.buffer, programPlanId)

    if (rows.length === 0) {
      throw new ValidationError("Tidak ada data yang dapat diimport dari file")
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    c.set("importRows" as any, rows)
    return rows
  })
}
