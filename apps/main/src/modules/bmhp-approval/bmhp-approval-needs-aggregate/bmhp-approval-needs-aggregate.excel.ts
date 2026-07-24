import Excel from "exceljs"
import { FileResponse } from "@smile/lib/types/file.js"
import { formatNum } from "../excel.utils.js"

// ── Types ──────────────────────────────────────────────────────────────────────

type MaterialRow = {
  type: string
  template_name: string
  variant_name: string
  unit: string
  total_needs: number
}

type MaterialGroup = {
  bm_material_id: number
  bm_material_name: string
  rows: MaterialRow[]
}

type CityEntry = {
  city_id: number
  city_name: string
  status: string
  updated_by: string
  updated_at: Date | null
  material_groups: MaterialGroup[]
}

// ── Styles ─────────────────────────────────────────────────────────────────────

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

// ── Constants ──────────────────────────────────────────────────────────────────

/** Sub-columns rendered under each material group header */
const SUB_HEADERS = ["Tipe", "Template Produk", "Varian Produk", "Jumlah Kebutuhan", "Unit"] as const
const SUB_COL_COUNT = SUB_HEADERS.length // 5
const DATA_START_COL = 3 // col 1=No, col 2=Nama Puskesmas/Kabupaten

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Collect every unique material group (by bm_material_id) across ALL cities,
 * ordered by first-seen. This guarantees each material appears only ONCE as a
 * column-group header.
 */
function collectMaterialGroups(
  data: CityEntry[]
): Array<{ bm_material_id: number; bm_material_name: string }> {
  const seen = new Map<number, { bm_material_id: number; bm_material_name: string }>()
  for (const city of data) {
    for (const g of city.material_groups) {
      if (!seen.has(g.bm_material_id)) {
        seen.set(g.bm_material_id, {
          bm_material_id: g.bm_material_id,
          bm_material_name: g.bm_material_name,
        })
      }
    }
  }
  return Array.from(seen.values())
}

/**
 * Return the maximum number of material sub-rows across all groups for one city.
 * At minimum 1 so we always write at least one data row per city.
 */
function getMaxRows(cityEntry: CityEntry): number {
  let max = 1
  for (const g of cityEntry.material_groups) {
    if (g.rows.length > max) max = g.rows.length
  }
  return max
}

// ── Main builder ───────────────────────────────────────────────────────────────

export async function buildNeedsAggregateExcel(
  rows: any[],
  filename: string
): Promise<FileResponse> {
  const data = rows as CityEntry[]
  const materialGroups = collectMaterialGroups(data)

  const workbook = new Excel.Workbook()
  workbook.creator = "SMILE"
  const ws = workbook.addWorksheet("Needs Aggregate")

  // ── Column widths ────────────────────────────────────────────────────────────
  ws.getColumn(1).width = 6   // No
  ws.getColumn(2).width = 36  // Nama Puskesmas/Kabupaten

  for (let g = 0; g < materialGroups.length; g++) {
    const baseCol = DATA_START_COL + g * SUB_COL_COUNT
    ws.getColumn(baseCol + 0).width = 14  // Tipe
    ws.getColumn(baseCol + 1).width = 36  // Template Produk
    ws.getColumn(baseCol + 2).width = 30  // Varian Produk
    ws.getColumn(baseCol + 3).width = 18  // Jumlah Kebutuhan
    ws.getColumn(baseCol + 4).width = 12  // Unit
  }

  // ── Row 1: material group headers ────────────────────────────────────────────
  const row1 = ws.getRow(1)
  row1.height = 40

  // "No" – spans 2 header rows
  row1.getCell(1).value = "No"
  ws.mergeCells(1, 1, 2, 1)
  styleHeaderCell(row1.getCell(1))

  // "Nama Puskesmas/Kabupaten" – spans 2 header rows
  row1.getCell(2).value = "Nama Puskesmas/Kabupaten"
  ws.mergeCells(1, 2, 2, 2)
  styleHeaderCell(row1.getCell(2))

  // One merged header per unique material group
  for (let g = 0; g < materialGroups.length; g++) {
    const group    = materialGroups[g]!
    const startCol = DATA_START_COL + g * SUB_COL_COUNT
    const endCol   = startCol + SUB_COL_COUNT - 1
    row1.getCell(startCol).value = group.bm_material_name
    ws.mergeCells(1, startCol, 1, endCol)
    styleHeaderCell(row1.getCell(startCol))
  }

  // ── Row 2: sub-column headers ────────────────────────────────────────────────
  const row2 = ws.getRow(2)
  row2.height = 36

  // Style the already-merged cells for No and Nama columns
  styleHeaderCell(row2.getCell(1))
  styleHeaderCell(row2.getCell(2))

  for (let g = 0; g < materialGroups.length; g++) {
    const baseCol = DATA_START_COL + g * SUB_COL_COUNT
    for (let s = 0; s < SUB_HEADERS.length; s++) {
      const cell = row2.getCell(baseCol + s)
      cell.value = SUB_HEADERS[s]
      styleHeaderCell(cell)
    }
  }

  // ── Data rows ────────────────────────────────────────────────────────────────

  let currentRow = 3 // rows 1–2 are headers
  let si_no      = 1

  for (const cityEntry of data) {
    // Build a lookup: bm_material_id → MaterialRow[]
    const groupLookup = new Map<number, MaterialRow[]>()
    for (const g of cityEntry.material_groups) {
      groupLookup.set(g.bm_material_id, g.rows)
    }

    const maxRows = getMaxRows(cityEntry)
    const lastRow = currentRow + maxRows - 1

    for (let mi = 0; mi < maxRows; mi++) {
      const wsRow  = ws.getRow(currentRow + mi)
      wsRow.height = 20

      // No
      const noCell     = wsRow.getCell(1)
      noCell.border    = DATA_BORDER
      noCell.alignment = { vertical: "middle", horizontal: "center" }
      if (mi === 0) noCell.value = si_no

      // City name (only on first sub-row; merged below if needed)
      const nameCell     = wsRow.getCell(2)
      nameCell.border    = DATA_BORDER
      nameCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true }
      if (mi === 0) nameCell.value = cityEntry.city_name

      // Material group cells
      for (let g = 0; g < materialGroups.length; g++) {
        const group   = materialGroups[g]!
        const baseCol = DATA_START_COL + g * SUB_COL_COUNT
        const items   = groupLookup.get(group.bm_material_id) ?? []
        const item    = items[mi]

        //            [0]Tipe          [1]Template Produk    [2]Varian Produk    [3]Jumlah     [4]Unit
        const vals: (string | number | undefined)[] = [
          item?.type,
          item?.template_name,
          item?.variant_name,
          item !== undefined ? formatNum(item.total_needs) : undefined,
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

    // Merge No and City Name vertically when there are multiple sub-rows
    if (maxRows > 1) {
      ws.mergeCells(currentRow, 1, lastRow, 1)
      ws.mergeCells(currentRow, 2, lastRow, 2)
    }

    currentRow += maxRows
    si_no++
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return { filename, buffer }
}
