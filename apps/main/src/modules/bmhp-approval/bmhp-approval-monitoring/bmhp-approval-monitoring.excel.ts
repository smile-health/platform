import Excel from "exceljs"
import { FileResponse } from "@smile/lib/types/file.js"
import { Context } from "hono"

// ── Styles ────────────────────────────────────────────────────────────────────

const THIN_BORDER: Partial<Excel.Borders> = {
  top: { style: "thin", color: { argb: "FFD0D0D0" } },
  left: { style: "thin", color: { argb: "FFD0D0D0" } },
  bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
  right: { style: "thin", color: { argb: "FFD0D0D0" } },
}

const HEADER_FILL: Excel.Fill = { type: "pattern", pattern: "none" }
const HEADER_FONT: Partial<Excel.Font> = { bold: true }

// ── Main builder ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildMonitoringExcel(
  c: Context,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  examinations: any[],
  filename: string
): Promise<FileResponse> {
  const workbook = new Excel.Workbook()
  workbook.creator = "SMILE"
  const ws = workbook.addWorksheet(c.var.t("bmhp-approval-monitoring.title"))

  const columns = [
    { key: "no", header: c.var.t("bmhp-approval-monitoring.label.no"), width: 8 },
    { key: "puskesmas_name", header: c.var.t("bmhp-approval-monitoring.label.puskesmas-name"), width: 40 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...examinations.map((exam: any) => ({
      key: `exam_${exam.id}`,
      header: exam.name,
      width: 20,
    })),
    { key: "progress", header: c.var.t("bmhp-approval-monitoring.label.progress"), width: 15 },
  ]

  ws.columns = columns

  const headerRow = ws.getRow(1)
  headerRow.height = 30
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.border = THIN_BORDER
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list.forEach((row: any, index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rowData: Record<string, any> = {
      no: index + 1,
      puskesmas_name: row.puskesmas_name ?? "",
    }

    for (const screening of row.screenings ?? []) {
      let statusLabel: string
      if (screening.status === "completed") {
        statusLabel = "Completed"
      } else if (screening.status === "not_applicable") {
        statusLabel = "N/A"
      } else {
        statusLabel = "Not Submitted"
      }
      rowData[`exam_${screening.examination_id}`] = statusLabel
    }

    rowData["progress"] =
      `${row.progress?.completed ?? 0}/${row.progress?.total ?? 0}`

    const dr = ws.addRow(rowData)
    dr.height = 20
    dr.eachCell((cell, colNumber) => {
      cell.border = THIN_BORDER
      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber === 2 ? "left" : "center",
      }
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return { filename, buffer } as unknown as FileResponse
}
