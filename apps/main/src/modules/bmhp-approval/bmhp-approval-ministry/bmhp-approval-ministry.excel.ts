import Excel from "exceljs"
import { FileResponse } from "@smile/lib/types/file.js"
import dayjs from "dayjs"
import { Context } from "hono"
import { formatNum } from "../excel.utils.js"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildMinistryApprovalExcel(list: any[], filename: string): Promise<FileResponse> {
  const workbook = new Excel.Workbook()
  workbook.creator = "SMILE"
  const worksheet = workbook.addWorksheet("BMHP Approval Kemenkes")

  worksheet.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Provinsi", key: "province_name", width: 30 },
    { header: "Status Kirim", key: "status", width: 20 },
    { header: "Tanggal Kirim", key: "submitted_at", width: 25 },
    { header: "Dikirim Oleh", key: "sent_by", width: 30 },
  ]

  // Header style styling
  const headerRow = worksheet.getRow(1)
  headerRow.height = 25
  headerRow.eachCell((cell) => {
    cell.font = { bold: true }
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    cell.border = {
      top: { style: "thin", color: { argb: "FFD0D0D0" } },
      left: { style: "thin", color: { argb: "FFD0D0D0" } },
      bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
      right: { style: "thin", color: { argb: "FFD0D0D0" } },
    }
  })

  // Data rows
  list.forEach((item, index) => {
    let approvalLabel = "Belum Dikirim"
    if (item.status === 1) approvalLabel = "Dikirim"

    const sentBy = item.user_updated_by
      ? [item.user_updated_by.firstname, item.user_updated_by.lastname].filter(Boolean).join(" ") || item.user_updated_by.username
      : "-"

    const row = worksheet.addRow({
      no: index + 1,
      province_name: item.province_name ?? "-",
      status: approvalLabel,
      submitted_at: item.submitted_at ? dayjs(item.submitted_at).format("YYYY-MM-DD HH:mm:ss") : "-",
      sent_by: sentBy,
    })
    
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD0D0D0" } },
        left: { style: "thin", color: { argb: "FFD0D0D0" } },
        bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
        right: { style: "thin", color: { argb: "FFD0D0D0" } },
      }
      // col 1=No, 2=Provinsi, 3=Status, 4=Tanggal, 5=Dikirim Oleh
      if (colNumber === 2 || colNumber === 5) {
        cell.alignment = { vertical: "middle", horizontal: "left" }
      } else {
        cell.alignment = { vertical: "middle", horizontal: "center" }
      }
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return { filename, buffer }
}

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
  { header: c.var.t("bmhp-approval-ministry.label.no", "No"), key: "no", width: 6, horizontal: "center" as Excel.Alignment["horizontal"] },
  {
    header: c.var.t("bmhp-approval-ministry.label.name", "Nama BMHP / Varian"),
    key: "name",
    width: 35,
    horizontal: "left" as Excel.Alignment["horizontal"],
  },
  { header: c.var.t("bmhp-approval-ministry.label.unit", "Satuan"), key: "unit", width: 12, horizontal: "center" as Excel.Alignment["horizontal"] },
  {
    header: c.var.t("bmhp-approval-ministry.label.total-needs", "Total Kebutuhan"),
    key: "total_needs",
    width: 15,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: c.var.t("bmhp-approval-ministry.label.remaining-stock", "Sisa Stok"),
    key: "remaining_stock",
    width: 18,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: c.var.t("bmhp-approval-ministry.label.procurement-proposal", "Usulan Pengadaan"),
    key: "procurement_proposal",
    width: 22,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: c.var.t("bmhp-approval-ministry.label.proposal-buffer", "Usulan + Buffer"),
    key: "proposal_buffer",
    width: 22,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: c.var.t("bmhp-approval-ministry.label.desk-result", "Hasil Desk"),
    key: "desk_result",
    width: 18,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
]

// ── Main builder ──────────────────────────────────────────────────────────────

export async function buildMinistryApprovalRecapitulationExcel(
  c: Context,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[],
  filename: string
): Promise<FileResponse> {
  const workbook = new Excel.Workbook()
  workbook.creator = "SMILE"
  const ws = workbook.addWorksheet(c.var.t("bmhp-approval-ministry.title.recapitulation", "Rekapitulasi Nasional"))

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
      formatNum(row.desk_result),
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
