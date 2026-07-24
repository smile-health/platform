import Excel from "exceljs"
import { FileResponse } from "@smile/lib/types/file.js"
import { Context } from "hono"
import { formatNum } from "../excel.utils.js"

// ── Styles ────────────────────────────────────────────────────────────────────

const HEADER_FILL: Excel.Fill = {
  type: "pattern",
  pattern: "none",
}

const THIN_BORDER: Partial<Excel.Borders> = {
  top: { style: "thin", color: { argb: "FFD0D0D0" } },
  left: { style: "thin", color: { argb: "FFD0D0D0" } },
  bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
  right: { style: "thin", color: { argb: "FFD0D0D0" } },
}

const CENTER_WRAP: Partial<Excel.Alignment> = {
  vertical: "middle",
  horizontal: "center",
  wrapText: true,
}

const HEADER_FONT: Partial<Excel.Font> = {
  bold: true,
}

const DATA_BORDER: Partial<Excel.Borders> = {
  top: { style: "thin", color: { argb: "FFD0D0D0" } },
  left: { style: "thin", color: { argb: "FFD0D0D0" } },
  bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
  right: { style: "thin", color: { argb: "FFD0D0D0" } },
}

// ── Column definitions ────────────────────────────────────────────────────────

const buildColumns = (c: Context) => [
  { header: c.var.t("bmhp-approval-procurement-recapitulation.label.no"), key: "no", width: 6, horizontal: "center" as Excel.Alignment["horizontal"] },
  {
    header: c.var.t("bmhp-approval-procurement-recapitulation.label.name"),
    key: "name",
    width: 35,
    horizontal: "left" as Excel.Alignment["horizontal"],
  },
  { header: c.var.t("bmhp-approval-procurement-recapitulation.label.unit"), key: "unit", width: 12, horizontal: "center" as Excel.Alignment["horizontal"] },
  {
    header: c.var.t("bmhp-approval-procurement-recapitulation.label.total-needs"),
    key: "total_needs",
    width: 15,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: c.var.t("bmhp-approval-procurement-recapitulation.label.remaining-stock"),
    key: "remaining_stock",
    width: 18,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: c.var.t("bmhp-approval-procurement-recapitulation.label.procurement-proposal"),
    key: "procurement_proposal",
    width: 22,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: c.var.t("bmhp-approval-procurement-recapitulation.label.proposal-buffer"),
    key: "proposal_buffer",
    width: 22,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
]

// ── Main builder ──────────────────────────────────────────────────────────────

export async function buildProcurementRecapExcel(
  c: Context,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[],
  filename: string
): Promise<FileResponse> {
  const workbook = new Excel.Workbook()
  workbook.creator = "SMILE"
  const ws = workbook.addWorksheet(c.var.t("bmhp-approval-procurement-recapitulation.title"))

  const COLUMNS = buildColumns(c)

  // Set column widths
  COLUMNS.forEach((col, idx) => {
    ws.getColumn(idx + 1).width = col.width
  })

  // Header row
  const headerRow = ws.addRow(COLUMNS.map((c) => c.header))
  headerRow.height = 40

  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL
    cell.border = THIN_BORDER
    cell.font = HEADER_FONT
    cell.alignment = CENTER_WRAP
  })

  // Data rows
  rows.forEach((row, index) => {
    const values = [
      index + 1,
      row.name ?? "",
      row.unit ?? "",
      formatNum(row.total_needs),
      formatNum(row.remaining_stock),
      formatNum(row.procurement_proposal),
      formatNum(row.proposal_buffer),
    ]

    const dataRow = ws.addRow(values)
    dataRow.height = 20

    dataRow.eachCell((cell, colNumber) => {
      cell.border = DATA_BORDER
      cell.alignment = {
        vertical: "middle",
        horizontal: COLUMNS[colNumber - 1]?.horizontal ?? "center",
      }
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return { filename, buffer } as unknown as FileResponse
}
