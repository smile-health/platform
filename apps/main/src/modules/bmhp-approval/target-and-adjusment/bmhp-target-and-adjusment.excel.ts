import Excel from "exceljs"
import { FileResponse } from "@smile/lib/types/file.js"
import { Context } from "hono"

// ── Styles ────────────────────────────────────────────────────────────────────

const HEADER_FILL: Excel.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF4472C4" }, // blue
}

const THIN_BORDER: Partial<Excel.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
}

const CENTER_WRAP: Partial<Excel.Alignment> = {
  vertical: "middle",
  horizontal: "center",
  wrapText: true,
}

const HEADER_FONT: Partial<Excel.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
}

const DATA_BORDER: Partial<Excel.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
}

// ── Column definitions ────────────────────────────────────────────────────────

const COLUMNS = [
  { header: "No", key: "no", width: 6, horizontal: "center" as Excel.Alignment["horizontal"] },
  {
    header: "Nama Material",
    key: "name",
    width: 40,
    horizontal: "left" as Excel.Alignment["horizontal"],
  },
  { header: "Satuan", key: "unit", width: 12, horizontal: "center" as Excel.Alignment["horizontal"] },
  {
    header: "Total Kebutuhan",
    key: "total_kebutuhan",
    width: 18,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: "Sisa Stok",
    key: "sisa_stok",
    width: 15,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: "Usulan Pengadaan",
    key: "usulan_pengadaan",
    width: 20,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: "Proposal Buffer",
    key: "proposal_buffer",
    width: 18,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: "Hasil Desk",
    key: "hasil_desk",
    width: 15,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
]

// ── Main builder ──────────────────────────────────────────────────────────────

export async function buildMinistryRecapitulationExcel(
  c: Context,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[],
  filename: string
): Promise<FileResponse> {
  const workbook = new Excel.Workbook()
  workbook.creator = "SMILE"
  const ws = workbook.addWorksheet("Rekapitulasi Kemenkes")

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
      Number(row.total_kebutuhan ?? 0),
      Number(row.sisa_stok ?? 0),
      Number(row.usulan_pengadaan ?? 0),
      Number(row.proposal_buffer ?? 0),
      Number(row.hasil_desk ?? 0),
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
