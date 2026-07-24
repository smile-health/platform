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
  {
    header: "No",
    key: "no",
    width: 6,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: "Kabupaten/Kota",
    key: "regency_name",
    width: 35,
    horizontal: "left" as Excel.Alignment["horizontal"],
  },
  {
    header: "Status Laporan",
    key: "report_status",
    width: 20,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: "Status Verifikasi",
    key: "review_status",
    width: 20,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: "Diverifikasi Oleh / Pada",
    key: "update_by_at",
    width: 30,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: "Sudah Disetujui",
    key: "sudah_di_setujui",
    width: 18,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
  {
    header: "Approver Kemenkes",
    key: "approver_kemkes",
    width: 18,
    horizontal: "center" as Excel.Alignment["horizontal"],
  },
]

// ── Worksheet builders ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildMonitoringSheet(workbook: Excel.Workbook, monitoring: any): void {
  const { list, examinations } = monitoring
  const ws1 = workbook.addWorksheet("1. Monitoring")
  const columns = [
    { header: "No", key: "no", width: 8 },
    { header: "Fasilitas Kesehatan", key: "puskesmas_name", width: 40 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...examinations.map((exam: any) => ({
      header: exam.name,
      key: `exam_${exam.id}`,
      width: 20,
    })),
    { header: "Progress", key: "progress", width: 15 },
  ]
  ws1.columns = columns
  const hr = ws1.getRow(1)
  hr.height = 30
  hr.eachCell((cell) => {
    styleHeaderCell(cell)
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list.forEach((row: any, idx: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rowData: any = {
      no: idx + 1,
      puskesmas_name: row.puskesmas_name ?? "",
      progress: `${row.progress?.completed ?? 0}/${row.progress?.total ?? 0}`,
    }
    for (const s of row.screenings ?? []) {
      rowData[`exam_${s.examination_id}`] = resolveScreeningStatus(s.status)
    }
    const dr = ws1.addRow(rowData)
    dr.height = 20
    for (let col = 1; col <= columns.length; col++) {
      const cell = dr.getCell(col)
      cell.border = THIN_BORDER
      cell.alignment = { vertical: "middle", horizontal: "center" }
      if (col === 2) cell.alignment.horizontal = "left"
    }
  })
}

function buildTargetAdjustmentSheet(
  workbook: Excel.Workbook,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  targetAdjustment: any
): void {
  const { target_group, data } = targetAdjustment
  const ws2 = workbook.addWorksheet("2. Target & Adjustment")

  // Group examinations by Target Group Name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const grouped: Record<string, any[]> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target_group.forEach((tg: any) => {
    const tgName = tg.name || "Unknown"
    if (!grouped[tgName]) grouped[tgName] = []
    grouped[tgName].push(tg)
  })

  const header1: string[] = ["No", "Fasilitas Kesehatan"]
  const header2: string[] = ["", ""]
  const header3: string[] = ["", ""]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.entries(grouped).forEach(([tgName, exams]: [string, any[]]) => {
    const examCount = exams.length
    const colSpan = examCount * 2
    header1.push(tgName)
    for (let i = 1; i < colSpan; i++) header1.push("")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exams.forEach((exam: any) => {
      header2.push(exam.examination || "")
      header2.push("")
    })
    for (let i = 0; i < examCount; i++) {
      header3.push("Target")
      header3.push("Target Adju")
    }
  })

  ws2.addRow(header1)
  ws2.addRow(header2)
  ws2.addRow(header3)

  ws2.mergeCells(1, 1, 3, 1)
  ws2.mergeCells(1, 2, 3, 2)

  let currentCol = 3
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.entries(grouped).forEach(([, exams]: [string, any[]]) => {
    const examCount = exams.length
    const colSpan = examCount * 2
    ws2.mergeCells(1, currentCol, 1, currentCol + colSpan - 1)
    exams.forEach(() => {
      ws2.mergeCells(2, currentCol, 2, currentCol + 1)
      currentCol += 2
    })
  })

  const hr1 = ws2.getRow(1)
  const hr2 = ws2.getRow(2)
  const hr3 = ws2.getRow(3)
  ;[hr1, hr2, hr3].forEach((r) => {
    r.height = 25
    r.eachCell((cell) => styleHeaderCell(cell))
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.forEach((row: any, idx: number) => {
    const vals = [idx + 1, row.entity_name?.name || ""]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    row.target.forEach((t: any) => {
      vals.push(formatNum(t.target), formatNum(t.adjustment_target))
    })
    const dr = ws2.addRow(vals)
    dr.eachCell((cell) => (cell.border = THIN_BORDER))
  })
}

function buildMaterialNeedsSheet(
  workbook: Excel.Workbook,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  materialNeeds: any[]
): void {
  const ws3 = workbook.addWorksheet("3. Kebutuhan Material")

  const screeningGroups: Array<{
    material_id: number
    material_name: string
  }> = []
  const seenScreenings = new Map<number, boolean>()
  for (const p of materialNeeds) {
    for (const s of p.screenings) {
      if (!seenScreenings.has(s.material_id)) {
        seenScreenings.set(s.material_id, true)
        screeningGroups.push({
          material_id: s.material_id,
          material_name: s.material_name,
        })
      }
    }
  }

  const subHeaders = ["Tipe", "Nama Produk", "Varian", "Jumlah Kebutuhan", "Satuan"]
  const subColCount = subHeaders.length
  const dataStartCol = 3

  ws3.getColumn(1).width = 6
  ws3.getColumn(2).width = 36
  for (let g = 0; g < screeningGroups.length; g++) {
    const baseCol = dataStartCol + g * subColCount
    ws3.getColumn(baseCol + 0).width = 14
    ws3.getColumn(baseCol + 1).width = 40
    ws3.getColumn(baseCol + 2).width = 30
    ws3.getColumn(baseCol + 3).width = 18
    ws3.getColumn(baseCol + 4).width = 12
  }

  buildMaterialNeedsHeaders(ws3, screeningGroups, subHeaders, subColCount, dataStartCol)
  buildMaterialNeedsDataRows(ws3, materialNeeds, screeningGroups, subColCount, dataStartCol)
}

function buildMaterialNeedsHeaders(
  ws3: Excel.Worksheet,
  screeningGroups: Array<{ material_id: number; material_name: string }>,
  subHeaders: string[],
  subColCount: number,
  dataStartCol: number
): void {
  const row1 = ws3.getRow(1)
  row1.height = 40
  row1.getCell(1).value = "No"
  ws3.mergeCells(1, 1, 2, 1)
  styleHeaderCell(row1.getCell(1))
  row1.getCell(2).value = "Nama Puskesmas / Kecamatan"
  ws3.mergeCells(1, 2, 2, 2)
  styleHeaderCell(row1.getCell(2))

  for (let g = 0; g < screeningGroups.length; g++) {
    const group = screeningGroups[g]!
    const startCol = dataStartCol + g * subColCount
    const endCol = startCol + subColCount - 1
    row1.getCell(startCol).value = group.material_name
    ws3.mergeCells(1, startCol, 1, endCol)
    styleHeaderCell(row1.getCell(startCol))
  }

  const row2 = ws3.getRow(2)
  row2.height = 36
  styleHeaderCell(row2.getCell(1))
  styleHeaderCell(row2.getCell(2))
  for (let g = 0; g < screeningGroups.length; g++) {
    const baseCol = dataStartCol + g * subColCount
    for (let s = 0; s < subHeaders.length; s++) {
      const cell = row2.getCell(baseCol + s)
      cell.value = subHeaders[s]
      styleHeaderCell(cell)
    }
  }
}

function buildMaterialNeedsDataRows(
  ws3: Excel.Worksheet,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  materialNeeds: any[],
  screeningGroups: Array<{ material_id: number; material_name: string }>,
  subColCount: number,
  dataStartCol: number
): void {
  let currentRow = 3
  let siNo = 1

  for (const pEntry of materialNeeds) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const screeningLookup = new Map<number, any[]>()
    for (const s of pEntry.screenings) {
      screeningLookup.set(s.material_id, s.materials)
    }

    let maxMaterials = 1
    for (const s of pEntry.screenings) {
      if (s.materials.length > maxMaterials) maxMaterials = s.materials.length
    }

    const lastRow = currentRow + maxMaterials - 1

    for (let mi = 0; mi < maxMaterials; mi++) {
      fillMaterialNeedsRow(ws3, currentRow + mi, mi, siNo, {
        pEntry,
        screeningGroups,
        screeningLookup,
        subColCount,
        dataStartCol,
      })
    }

    if (maxMaterials > 1) {
      ws3.mergeCells(currentRow, 1, lastRow, 1)
      ws3.mergeCells(currentRow, 2, lastRow, 2)
    }

    currentRow += maxMaterials
    siNo++
  }
}

function fillMaterialNeedsRow(
  ws3: Excel.Worksheet,
  rowIndex: number,
  mi: number,
  siNo: number,
  opts: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pEntry: any
    screeningGroups: Array<{ material_id: number; material_name: string }>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    screeningLookup: Map<number, any[]>
    subColCount: number
    dataStartCol: number
  }
): void {
  const { pEntry, screeningGroups, screeningLookup, subColCount, dataStartCol } = opts
  const wsRow = ws3.getRow(rowIndex)
  wsRow.height = 20

  const noCell = wsRow.getCell(1)
  noCell.border = DATA_BORDER
  noCell.alignment = { vertical: "middle", horizontal: "center" }
  if (mi === 0) noCell.value = siNo

  const nameCell = wsRow.getCell(2)
  nameCell.border = DATA_BORDER
  nameCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true }
  if (mi === 0) {
    nameCell.value = pEntry.sub_district_name
      ? `${pEntry.puskesmas_name} (${pEntry.sub_district_name})`
      : pEntry.puskesmas_name
  }

  for (let g = 0; g < screeningGroups.length; g++) {
    const group = screeningGroups[g]!
    const baseCol = dataStartCol + g * subColCount
    const items = screeningLookup.get(group.material_id) ?? []
    const item = items[mi]

    const vals: (string | number | undefined)[] = [
      item?.type,
      item?.material_name,
      item?.material_variant,
      item !== undefined ? formatNum(item.total_needed) : undefined,
      item?.unit,
    ]

    for (let s = 0; s < vals.length; s++) {
      const c = wsRow.getCell(baseCol + s)
      c.value = vals[s] ?? ""
      c.border = DATA_BORDER
      c.alignment = {
        vertical: "middle",
        horizontal: s === 1 || s === 2 ? "left" : "center",
        wrapText: true,
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildProcurementRecapSheet(workbook: Excel.Workbook, procurementRecap: any[]): void {
  const ws4 = workbook.addWorksheet("4. Rekapitulasi Pengadaan")

  const columns = [
    { header: "No", key: "no", width: 6, horizontal: "center" as const },
    { header: "Nama BMHP", key: "name", width: 35, horizontal: "left" as const },
    { header: "Satuan", key: "unit", width: 12, horizontal: "center" as const },
    { header: "Total Kebutuhan", key: "total_needs", width: 15, horizontal: "center" as const },
    { header: "Sisa Stok", key: "remaining_stock", width: 18, horizontal: "center" as const },
    {
      header: "Usulan Pengadaan",
      key: "procurement_proposal",
      width: 22,
      horizontal: "center" as const,
    },
    {
      header: "Buffer Usulan",
      key: "proposal_buffer",
      width: 22,
      horizontal: "center" as const,
    },
  ]

  columns.forEach((col, idx) => {
    ws4.getColumn(idx + 1).width = col.width
  })

  const headerRow = ws4.addRow(columns.map((c) => c.header))
  headerRow.height = 40
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL
    cell.border = THIN_BORDER
    cell.font = HEADER_FONT
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  procurementRecap.forEach((row: any, index: number) => {
    const bufferPct = Number(row.buffer_percentage ?? 10)
    const procurementProposal = Number(row.procurement_proposal ?? 0)
    const proposalBuffer = Math.ceil(procurementProposal * (1 + bufferPct / 100))

    const values = [
      index + 1,
      row.name ?? "",
      row.unit ?? "",
      formatNum(row.total_needs),
      formatNum(row.remaining_stock),
      formatNum(procurementProposal),
      formatNum(proposalBuffer),
    ]

    const dataRow = ws4.addRow(values)
    dataRow.height = 20
    dataRow.eachCell((cell, colNumber) => {
      cell.border = DATA_BORDER
      cell.alignment = {
        vertical: "middle",
        horizontal: columns[colNumber - 1]?.horizontal ?? "center",
      }
    })
  })
}

function buildProvinceApprovalSheet(
  workbook: Excel.Workbook,
  c: Context,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[]
): void {
  const ws = workbook.addWorksheet("Persetujuan BMHP Provinsi")
  const COLUMNS = buildColumns(c)

  COLUMNS.forEach((col, idx) => {
    ws.getColumn(idx + 1).width = col.width
  })

  const headerRow = ws.addRow(COLUMNS.map((col) => col.header))
  headerRow.height = 30
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL
    cell.border = THIN_BORDER
    cell.font = HEADER_FONT
    cell.alignment = CENTER_WRAP
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows.forEach((row, index) => {
    const updatedAt = row.updated_at
    const updatedBy = row.updated_by
    const updatedByAt = updatedAt && updatedBy ? `${updatedBy} / ${updatedAt}` : "-"

    const values = [
      index + 1,
      row.regency_name ?? "",
      row.report_status ?? "",
      row.review_status ?? "",
      updatedByAt,
      row.sudah_di_setujui ?? 0,
      row.approver_kemkes ?? 0,
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
}

// ── Main builder ──────────────────────────────────────────────────────────────

export async function buildProvinceApprovalExcel(
  c: Context,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[],
  filename: string,
  extraData?: {
    monitoring?: any
    targetAdjustment?: any
    materialNeeds?: any
    procurementRecap?: any
  }
): Promise<FileResponse> {
  const workbook = new Excel.Workbook()
  workbook.creator = "SMILE"

  if (extraData) {
    if (extraData.monitoring) buildMonitoringSheet(workbook, extraData.monitoring)
    if (extraData.targetAdjustment) buildTargetAdjustmentSheet(workbook, extraData.targetAdjustment)
    if (extraData.materialNeeds) buildMaterialNeedsSheet(workbook, extraData.materialNeeds)
    if (extraData.procurementRecap) buildProcurementRecapSheet(workbook, extraData.procurementRecap)
  } else {
    buildProvinceApprovalSheet(workbook, c, rows)
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return { filename, buffer } as unknown as FileResponse
}

function styleHeaderCell(cell: Excel.Cell): void {
  cell.fill = HEADER_FILL
  cell.border = THIN_BORDER
  cell.font = HEADER_FONT
  cell.alignment = CENTER_WRAP
}

function resolveScreeningStatus(status: string): string {
  if (status === "completed") return "Completed"
  if (status === "not_applicable") return "N/A"
  return "Not Submitted"
}

function addMaterialNeedsRow(
  ws: Excel.Worksheet,
  siNo: number,
  puskesmasName: string,
  groupName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  material: any
): number {
  const dr = ws.addRow({
    no: siNo,
    puskesmas_name: puskesmasName,
    group: groupName,
    product: material.material_name,
    variant: material.material_variant,
    qty: material.total_needed,
    unit: material.unit,
  })
  dr.eachCell((c) => (c.border = THIN_BORDER))
  return siNo + 1
}

/**
 * GET /bmhp-approval-province/xls/:REGENCY_ID
 *  get all workspace, its has 4 workspace
 *  1. workspace 1: monitoring
 *  2. workspace 2: target and adjustment
 *  3. workspace 3: material needs
 *  4. workspace 4: procurement recapitulation
 */
