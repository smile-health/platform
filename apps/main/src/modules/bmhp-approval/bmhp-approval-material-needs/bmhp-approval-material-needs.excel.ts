import Excel from "exceljs"
import { FileResponse } from "@smile/lib/types/file.js"
import { Context } from "hono"
import { formatNum } from "../excel.utils.js"

// ── Types (matches PuskesmasEntry from module) ────────────────────────────────

type MaterialItem = {
  wpm_id: number
  material_id: number
  material_name: string
  material_variant: string
  unit: string
  type: string
  total_needed: number
}

type ScreeningEntry = {
  material_id: number   // screening group key (ws_material_id)
  material_name: string // column group header
  materials: MaterialItem[]
}

type PuskesmasEntry = {
  puskesmas_id: number
  puskesmas_name: string
  sub_district_name: string
  screenings: ScreeningEntry[]
}

// ── Styles ────────────────────────────────────────────────────────────────────

const HEADER_FILL: Excel.Fill = {
  type: "pattern",
  pattern: "none",
}
const BLACK: Partial<Excel.Border>        = { style: "thin", color: { argb: "FFD0D0D0" } }
const BLACK_MEDIUM: Partial<Excel.Border> = { style: "thin", color: { argb: "FFD0D0D0" } }
const HEADER_BORDER: Partial<Excel.Borders> = {
  top: BLACK_MEDIUM, left: BLACK_MEDIUM, bottom: BLACK_MEDIUM, right: BLACK_MEDIUM,
}
const DATA_BORDER: Partial<Excel.Borders> = {
  top: BLACK, left: BLACK, bottom: BLACK, right: BLACK,
}
const HEADER_FONT: Partial<Excel.Font> = { bold: true }

function styleHeaderCell(cell: Excel.Cell): void {
  cell.fill      = HEADER_FILL
  cell.border    = HEADER_BORDER
  cell.font      = HEADER_FONT
  cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Collect every unique screening group across ALL puskesmas, deduped by material_name */
function collectScreeningGroups(data: PuskesmasEntry[]): Array<{ material_id: number; material_name: string }> {
  const seen = new Map<string, { material_id: number; material_name: string }>()
  for (const p of data) {
    for (const s of p.screenings) {
      if (!seen.has(s.material_name)) {
        seen.set(s.material_name, { material_id: s.material_id, material_name: s.material_name })
      }
    }
  }
  return Array.from(seen.values())
}

/** Return the maximum materials count across all screening groups for one puskesmas */
function getMaxMaterials(pEntry: PuskesmasEntry): number {
  let max = 1
  for (const s of pEntry.screenings) {
    if (s.materials.length > max) max = s.materials.length
  }
  return max
}

/** Write screening-group cells for a single material sub-row */
function writeScreeningCells(
  wsRow: Excel.Row,
  screeningGroups: Array<{ material_id: number; material_name: string }>,
  screeningLookup: Map<string, MaterialItem[]>,  // keyed by material_name
  mi: number,
): void {
  for (const group of screeningGroups) {
    const baseCol = DATA_START_COL + screeningGroups.indexOf(group) * SUB_COL_COUNT
    const items   = screeningLookup.get(group.material_name) ?? []  // lookup by name
    const item    = items[mi]

    const vals: (string | number | undefined)[] = [
      item?.type,
      item?.material_name,
      item?.material_variant,
      item !== undefined ? formatNum(item.total_needed) : undefined,
      item?.unit,
    ]

    for (let s = 0; s < vals.length; s++) {
      const c     = wsRow.getCell(baseCol + s)
      c.value     = vals[s] ?? ""
      c.border    = DATA_BORDER
      c.alignment = {
        vertical:   "middle",
        horizontal: s === 1 || s === 2 ? "left" : "center",
        wrapText:   true,
      }
    }
  }
}

/** Write all data rows for one puskesmas entry; returns the number of rows consumed */
function writePuskesmasRows(
  ws: Excel.Worksheet,
  pEntry: PuskesmasEntry,
  screeningGroups: Array<{ material_id: number; material_name: string }>,
  startRow: number,
  si_no: number,
): number {
  const screeningLookup = new Map<string, MaterialItem[]>()  // keyed by material_name
  for (const s of pEntry.screenings) {
    screeningLookup.set(s.material_name, s.materials)
  }

  const maxMaterials = getMaxMaterials(pEntry)
  const lastRow      = startRow + maxMaterials - 1

  for (let mi = 0; mi < maxMaterials; mi++) {
    const wsRow = ws.getRow(startRow + mi)
    wsRow.height = 20

    const noCell     = wsRow.getCell(1)
    noCell.border    = DATA_BORDER
    noCell.alignment = { vertical: "middle", horizontal: "center" }
    if (mi === 0) noCell.value = si_no

    const nameCell     = wsRow.getCell(2)
    nameCell.border    = DATA_BORDER
    nameCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true }
    if (mi === 0) {
      nameCell.value = pEntry.sub_district_name
        ? `${pEntry.puskesmas_name} (${pEntry.sub_district_name})`
        : pEntry.puskesmas_name
    }

    writeScreeningCells(wsRow, screeningGroups, screeningLookup, mi)
  }

  if (maxMaterials > 1) {
    ws.mergeCells(startRow, 1, lastRow, 1)
    ws.mergeCells(startRow, 2, lastRow, 2)
  }

  return maxMaterials
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Sub-columns per screening group */
const SUB_HEADERS = ["Tipe", "Nama Produk", "Varian", "Jumlah Kebutuhan", "Satuan"] as const
const SUB_COL_COUNT = SUB_HEADERS.length // 5
const DATA_START_COL = 3 // col 1=No, col 2=Nama Faskes

// ── Main builder ──────────────────────────────────────────────────────────────

const SUB_HEADER_I18N_KEYS: readonly string[] = [
  "bmhp-approval-material-needs.export.type",
  "bmhp-approval-material-needs.export.template-produk",
  "bmhp-approval-material-needs.export.varian",
  "bmhp-approval-material-needs.export.kebutuhan",
  "bmhp-approval-material-needs.export.satuan",
]

export async function buildMaterialNeedsExcel(
  c: Context,
  data: PuskesmasEntry[],
  filename: string
): Promise<FileResponse> {
  const screeningGroups = collectScreeningGroups(data)

  const workbook = new Excel.Workbook()
  workbook.creator = "SMILE"
  const ws = workbook.addWorksheet(c.var.t("bmhp-approval-material-needs.title"))

  // ── Column widths ───────────────────────────────────────────────────────────
  ws.getColumn(1).width = 6   // No
  ws.getColumn(2).width = 36  // Nama Faskes

  for (let g = 0; g < screeningGroups.length; g++) {
    const baseCol = DATA_START_COL + g * SUB_COL_COUNT
    ws.getColumn(baseCol + 0).width = 14  // Tipe
    ws.getColumn(baseCol + 1).width = 40  // Nama Produk
    ws.getColumn(baseCol + 2).width = 30  // Varian
    ws.getColumn(baseCol + 3).width = 18  // Jumlah Kebutuhan
    ws.getColumn(baseCol + 4).width = 12  // Satuan
  }

  // ── Row 1: group headers ────────────────────────────────────────────────────
  const row1 = ws.getRow(1)
  row1.height = 40

  // "No" – merged 2 rows
  row1.getCell(1).value = c.var.t("bmhp-approval-material-needs.label.no")
  ws.mergeCells(1, 1, 2, 1)
  styleHeaderCell(row1.getCell(1))

  // "Nama Puskesmas Kecamatan" – merged 2 rows
  row1.getCell(2).value = c.var.t("bmhp-approval-material-needs.export.puskesmas-name")
  ws.mergeCells(1, 2, 2, 2)
  styleHeaderCell(row1.getCell(2))

  for (let g = 0; g < screeningGroups.length; g++) {
    const group    = screeningGroups[g]!
    const startCol = DATA_START_COL + g * SUB_COL_COUNT
    const endCol   = startCol + SUB_COL_COUNT - 1
    row1.getCell(startCol).value = group.material_name
    ws.mergeCells(1, startCol, 1, endCol)
    styleHeaderCell(row1.getCell(startCol))
  }

  // ── Row 2: sub-column headers ───────────────────────────────────────────────
  const row2 = ws.getRow(2)
  row2.height = 36

  // Style already-merged header cells for No and Faskes
  styleHeaderCell(row2.getCell(1))
  styleHeaderCell(row2.getCell(2))

  for (let g = 0; g < screeningGroups.length; g++) {
    const baseCol = DATA_START_COL + g * SUB_COL_COUNT
    for (let s = 0; s < SUB_HEADERS.length; s++) {
      const cell = row2.getCell(baseCol + s)
      cell.value = c.var.t(SUB_HEADER_I18N_KEYS[s] ?? "")
      styleHeaderCell(cell)
    }
  }

  // ── Data rows ───────────────────────────────────────────────────────────────

  let currentRow = 3 // next Excel row to write (1-indexed, rows 1-2 are headers)
  let si_no      = 1 // sequential display number

  for (const pEntry of data) {
    const rowsConsumed = writePuskesmasRows(ws, pEntry, screeningGroups, currentRow, si_no)
    currentRow += rowsConsumed
    si_no++
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return { filename, buffer }
}

