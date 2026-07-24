import Excel from "exceljs"
import { FileResponse } from "@smile/lib/types/file.js"
import { formatNum } from "../excel.utils.js"

// ── Types ─────────────────────────────────────────────────────────────────────
type ColDef = { examination_name: string; target_group_name: string; key: string }
type TgEntry = { original: number; adjusted: number }

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveHorizontalAlign(colIdx: number): Excel.Alignment["horizontal"] {
  if (colIdx === 1) return "center"
  if (colIdx === 2) return "left"
  return "center"
}

function collectColumns(list: any[]): ColDef[] {
  const colMap = new Map<string, ColDef>()
  for (const puskesmas of list) {
    for (const exam of puskesmas.examinations ?? []) {
      for (const tg of exam.target_groups ?? []) {
        const key = `${exam.examination_id}_${tg.target_group_id}`
        if (!colMap.has(key)) {
          colMap.set(key, {
            examination_name: exam.examination_name,
            target_group_name: tg.target_group_name,
            key,
          })
        }
      }
    }
  }
  return Array.from(colMap.values())
}

function buildTgLookup(puskesmas: any): Map<string, TgEntry> {
  const lookup = new Map<string, TgEntry>()
  for (const exam of puskesmas.examinations ?? []) {
    for (const tg of exam.target_groups ?? []) {
      const key = `${exam.examination_id}_${tg.target_group_id}`
      lookup.set(key, {
        original: tg.original_target ?? 0,
        adjusted: tg.adjusted_target ?? tg.original_target ?? 0,
      })
    }
  }
  return lookup
}

function applyHeaderStyles(worksheet: Excel.Worksheet, totalDataCols: number): void {
  const headerFill: Excel.Fill = { type: "pattern", pattern: "none" }
  const headerBorder: Partial<Excel.Borders> = {
    top: { style: "thin", color: { argb: "FFD0D0D0" } },
    left: { style: "thin", color: { argb: "FFD0D0D0" } },
    bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
    right: { style: "thin", color: { argb: "FFD0D0D0" } },
  }
  const headerFont: Partial<Excel.Font> = { bold: true }
  const centerAlign: Partial<Excel.Alignment> = { vertical: "middle", horizontal: "center", wrapText: true }

  for (let rowIdx = 1; rowIdx <= 2; rowIdx++) {
    worksheet.getRow(rowIdx).height = 36
    for (let colIdx = 1; colIdx <= totalDataCols; colIdx++) {
      const cell = worksheet.getRow(rowIdx).getCell(colIdx)
      cell.fill      = headerFill
      cell.border    = headerBorder
      cell.font      = headerFont
      cell.alignment = centerAlign
    }
  }
}

function fillDataRow(
  dataRow: Excel.Row,
  puskesmas: any,
  index: number,
  cols: ColDef[],
  totalDataCols: number,
  headerBorder: Partial<Excel.Borders>
): void {
  dataRow.getCell(1).value = index + 1
  dataRow.getCell(2).value = puskesmas.puskesmas_name ?? ""

  const tgLookup = buildTgLookup(puskesmas)

  for (let i = 0; i < cols.length; i++) {
    const col = cols[i]
    if (!col) continue
    const data = tgLookup.get(col.key)
    dataRow.getCell(3 + i * 2).value = data !== undefined ? formatNum(data.original) : null
    dataRow.getCell(4 + i * 2).value = data !== undefined ? formatNum(data.adjusted) : null
  }

  for (let colIdx = 1; colIdx <= totalDataCols; colIdx++) {
    const cell = dataRow.getCell(colIdx)
    cell.border    = headerBorder
    cell.alignment = { vertical: "middle", horizontal: resolveHorizontalAlign(colIdx) }
  }

  dataRow.height = 20
}

export async function buildPreviewExcel(list: any[], filename: string): Promise<FileResponse> {
  const cols = collectColumns(list)

  const workbook = new Excel.Workbook()
  workbook.creator = "SMILE"
  const worksheet = workbook.addWorksheet("BMHP Approval Preview")

  worksheet.getColumn(1).width = 6
  worksheet.getColumn(2).width = 30
  for (let i = 0; i < cols.length; i++) {
    worksheet.getColumn(3 + i * 2).width = 12
    worksheet.getColumn(4 + i * 2).width = 20
  }

  const row1 = worksheet.getRow(1)
  row1.getCell(1).value = "No"
  worksheet.mergeCells(1, 1, 2, 1)
  row1.getCell(2).value = "Nama Puskesmas\nKecamatan"
  worksheet.mergeCells(1, 2, 2, 2)
  for (let i = 0; i < cols.length; i++) {
    const col = cols[i]
    if (!col) continue
    const leftCol  = 3 + i * 2
    const rightCol = 4 + i * 2
    row1.getCell(leftCol).value = `${col.examination_name}\n${col.target_group_name}`
    worksheet.mergeCells(1, leftCol, 1, rightCol)
  }

  const row2 = worksheet.getRow(2)
  for (let i = 0; i < cols.length; i++) {
    row2.getCell(3 + i * 2).value = "Target"
    row2.getCell(4 + i * 2).value = "Target Penyesuaian"
  }

  const totalDataCols = 2 + cols.length * 2
  applyHeaderStyles(worksheet, totalDataCols)

  const headerBorder: Partial<Excel.Borders> = {
    top: { style: "thin", color: { argb: "FFD0D0D0" } },
    left: { style: "thin", color: { argb: "FFD0D0D0" } },
    bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
    right: { style: "thin", color: { argb: "FFD0D0D0" } },
  }
  for (let p = 0; p < list.length; p++) {
    fillDataRow(worksheet.getRow(3 + p), list[p], p, cols, totalDataCols, headerBorder)
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return { filename, buffer }
}
