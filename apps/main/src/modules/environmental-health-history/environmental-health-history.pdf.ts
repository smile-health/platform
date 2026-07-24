import { jsPDF } from "jspdf"
import momentTZ from "moment-timezone"
import dayjs from "dayjs"
import type { TFunction } from "i18next"

const MIME_TYPE_PDF = "application/pdf"

// ── Color constants ──────────────────────────────────────────────────
const COLORS = {
  primary: "#2E86C1",
  primaryDark: "#1B4F72",
  white: "#FFFFFF",
  gray: "#666666",
  lightGray: "#999999",
  black: "#000000",
  borderGray: "#CCCCCC",
}

// ── Layout constants ─────────────────────────────────────────────────
const PAGE = {
  marginLeft: 20,
  marginRight: 20,
  marginTop: 20,
  width: 210, // A4 width in mm
  contentWidth: 170, // 210 - 20 - 20
}

// ── Types ────────────────────────────────────────────────────────────

export interface HistoryPdfData {
  id: number
  created_at: unknown
  entity_name: string | null
  entity_address: string | null
  parameter_category_name: string
  activity_name: string | null
  parameter_category_items: Array<{
    label: string
    key: string
    value: unknown
    type?: string | null
  }>
  sample_id: string | null
  received_date: unknown
  lab_result_status: string | null
  test_start_date: unknown
  test_end_date: unknown
  sample_collected_by: string | null
  location: string | null
  collection_date: unknown
  has_ikl: boolean
  ikl_test_date: unknown
  ikl_score: number | null
  is_qualified: boolean
  management_asset?: {
    id: number
    model_name: string | null
    serial_number: string | null
    production_year: number | null
    working_status: string | null
    asset_type_name: string | null
  } | null
  examination_entity?: {
    id: number
    name: string | null
    regency_id: string | null
  } | null
  test_results: Array<{
    parameter_name: string
    quality_standard: string | null
    unit: string | null
    test_methods_name: string | null
    result_value: string | null
    is_custom: boolean
  }>
  distribution_details?: Array<{
    material: { name: string; full_name: string }
    quantity?: number
    distributed_by: string | null
    distributed_to: string | null
    actual_transaction_date: string | null
    batch: {
      code: string | null
      expiration_date: string | null
      manufacture: string | null
      production_date: string | null
    }
    stock?: { opening: number | null; closing: number | null }
    created_at?: string | null
    updated_at?: string | null
  }>
}

export interface PdfGenerateResult {
  filename: string
  base64: string
  mimeType: string
}

// ── Helper functions ─────────────────────────────────────────────────

function formatDate(
  value: string | Date | null | undefined,
  timezone: string
): string {
  if (!value) return "-"
  return momentTZ(value).tz(timezone).format("DD MMM YYYY")
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "-"

  if (Array.isArray(value)) {
    // Check if array contains inventory objects
    if (
      value.length > 0 &&
      typeof value[0] === "object" &&
      value[0] !== null &&
      "model_name" in value[0]
    ) {
      // Format inventory items as "Model Name (Serial Number)"
      return value
        .map((inv: { model_name?: string; serial_number?: string }) => {
          const modelName = inv.model_name ?? "-"
          const serialNumber = inv.serial_number ?? "-"
          return `${modelName} (${serialNumber})`
        })
        .join(", ")
    }
    // For other arrays, recursively format each item
    return value.map((v) => formatValue(v)).join(", ")
  }

  if (typeof value === "object") return JSON.stringify(value)
  if (typeof value === "symbol") return value.toString()
  const str = String(value as string | number | boolean | bigint)
  if (
    str.length >= 10 &&
    !isNaN(Number(str.charAt(0))) &&
    str.includes("-") &&
    momentTZ(str).isValid()
  ) {
    return momentTZ(str).tz("Asia/Jakarta").format("DD MMM YYYY")
  }
  return str
}

function isArrayOfObjects(
  value: unknown
): value is Array<Record<string, unknown>> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    value[0] !== null &&
    !Array.isArray(value[0])
  )
}

/** Ambil keys dari object pertama, abaikan key 'id' */
function getObjectColumns(items: Array<Record<string, unknown>>): string[] {
  return Object.keys(items[0]).filter((k) => k !== "id")
}

// ── Main PDF Generator ───────────────────────────────────────────────

export class EnvironmentalHealthHistoryPdfGenerator {
  private doc!: jsPDF
  private currentY: number = PAGE.marginTop
  private timezone: string = "Asia/Jakarta"
  private tr!: (key: string, fallback: string) => string

  /**
   * Generate a PDF document from the given data and return base64 + metadata.
   */
  async generate(
    data: HistoryPdfData,
    options: { timezone?: string; language?: string; t?: TFunction } = {}
  ): Promise<PdfGenerateResult> {
    this.timezone = options.timezone ?? "Asia/Jakarta"
    const language = options.language ?? "id"
    const t = options.t
    this.tr = (key: string, fallback: string): string =>
      t
        ? t(`environmental_health.document.${key}`, { defaultValue: fallback })
        : fallback

    this.doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    this.currentY = PAGE.marginTop

    this.buildDocument(data)

    const base64 = this.doc.output("datauristring").split(",")[1]

    const currentTime = momentTZ().tz(this.timezone)
    const filename =
      `EnvironmentalHealthReport_${currentTime.format("YYYYMMDD_HHmm")} ` +
      `${currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase()} ` +
      `GMT${currentTime.format("Z").replace(":00", "")}_${language}`

    return { filename, base64, mimeType: MIME_TYPE_PDF }
  }

  // ── Document builder ─────────────────────────────────────────────

  private buildDocument(data: HistoryPdfData): void {
    const { tr } = this

    // Title
    this.addTitle(tr("title", "Laporan Uji Kesehatan Lingkungan"))
    this.addSubtitle(
      `${tr("report_id", "ID Laporan")}: #${data.id}  |  ${tr("generated", "Dibuat")}: ${momentTZ().tz(this.timezone).format("DD MMM YYYY HH:mm")}`
    )

    this.currentY += 5

    // 1. Entity Information
    this.addSectionTitle(tr("entity_information", "Informasi Entitas"))
    this.addLabelValueTable([
      [tr("entity_name", "Nama Entitas"), data.entity_name ?? "-"],
      [tr("entity_address", "Alamat Entitas"), data.entity_address ?? "-"],
    ])

    this.currentY += 5

    // 2. Sample Information
    this.addSectionTitle(tr("sample_information", "Informasi Sampel"))
    this.addLabelValueTable([
      [tr("sample_id", "ID Sampel"), data.sample_id ?? "-"],
      [tr("activity_name", "Kegiatan"), data.activity_name ?? "-"],
      [
        tr("received_date", "Tanggal Diterima"),
        formatDate(data.received_date as any, this.timezone),
      ],
      [
        tr("collection_date", "Tanggal Pengambilan"),
        formatDate(data.collection_date as any, this.timezone),
      ],
      [tr("location", "Lokasi"), data.location ?? "-"],
      [
        tr("sample_collected_by", "Diambil Oleh"),
        data.sample_collected_by ?? "-",
      ],
      [
        tr("lab_result_status", "Lab Result Status"),
        data.lab_result_status === "completed"
          ? tr("status_completed", "Selesai")
          : data.lab_result_status === "pending"
            ? tr("status_pending", "Menunggu")
            : (data.lab_result_status ?? "-"),
      ],
      [
        tr("test_start_date", "Tanggal Mulai Uji"),
        formatDate(data.test_start_date as any, this.timezone),
      ],
      [
        tr("test_end_date", "Tanggal Selesai Uji"),
        formatDate(data.test_end_date as any, this.timezone),
      ],
    ])

    this.currentY += 5

    // 3. Parameter Category
    this.addSectionTitle(
      `${tr("parameter_category", "Kategori Parameter")}: ${data.parameter_category_name}`
    )
    this.renderParameterCategoryItems(data.parameter_category_items)

    this.currentY += 5

    // 4. Test Results
    this.addSectionTitle(tr("test_results", "Hasil Uji"))
    this.addTestResultsTable(data.test_results)

    this.currentY += 5

    // 5. Management Asset
    if (data.management_asset) {
      this.addSectionTitle(tr("management_asset", "Aset Manajemen"))
      this.addLabelValueTable([
        [
          tr("asset_model_name", "Nama Model"),
          data.management_asset.model_name ?? "-",
        ],
        [
          tr("asset_serial_number", "Nomor Seri"),
          data.management_asset.serial_number ?? "-",
        ],
        [
          tr("asset_production_year", "Tahun"),
          data.management_asset.production_year != null
            ? String(data.management_asset.production_year)
            : "-",
        ],
        [
          tr("asset_type", "Jenis Aset"),
          data.management_asset.asset_type_name ?? "-",
        ],
        [
          tr("asset_working_status", "Status Fungsi"),
          data.management_asset.working_status ?? "-",
        ],
      ])
      this.currentY += 5
    }

    // 6. IKL Section
    this.addSectionTitle(tr("ikl_title", "IKL (Indeks Kualitas Lingkungan)"))
    this.addLabelValueTable([
      [
        tr("has_ikl", "Memiliki IKL"),
        data.has_ikl ? tr("yes", "Ya") : tr("no_value", "Tidak"),
      ],
      [
        tr("ikl_test_date", "Tanggal Uji IKL"),
        formatDate(data.ikl_test_date as any, this.timezone),
      ],
      [
        tr("ikl_score", "Skor IKL"),
        data.ikl_score !== null && data.ikl_score !== undefined
          ? String(data.ikl_score)
          : "-",
      ],
      [
        tr("qualified", "Kualifikasi"),
        data.is_qualified
          ? tr("qualified_label", "✓ Memenuhi Syarat")
          : tr("not_qualified_label", "✗ Tidak Memenuhi Syarat"),
      ],
    ])

    // 7. Distribution Details Section
    if (data.distribution_details && data.distribution_details.length > 0) {
      this.currentY += 5
      this.addSectionTitle(
        tr("distribution_details_title", "Logistik Terpakai")
      )
      this.renderDistributionDetailsTable(data.distribution_details)
    }
  }

  private renderDistributionDetailsTable(
    details: NonNullable<HistoryPdfData["distribution_details"]>
  ): void {
    if (!details || details.length === 0) return

    const { tr } = this

    const no = [tr("no", "No"), ...details.map((_, idx) => String(idx + 1))]
    const parentName = [
      tr("parent_name", "Nama Induk"),
      ...details.map((d) => d.material?.name ?? "-"),
    ]
    const material = [
      tr("material", "Material"),
      ...details.map((d) => d.material?.full_name ?? "-"),
    ]
    const tanggalDistribusi = [
      tr("tanggal_distribusi", "Tanggal Distribusi"),
      ...details.map((d) =>
        d.actual_transaction_date
          ? dayjs(d.actual_transaction_date).format("DD MMM YYYY")
          : "-"
      ),
    ]
    const jamDistribusi = [
      tr("jam_distribusi", "Jam Distribusi"),
      ...details.map((d) =>
        d.actual_transaction_date
          ? dayjs(d.actual_transaction_date).format("HH:mm")
          : "-"
      ),
    ]
    const manufacture = [
      tr("manufacture", "Produsen"),
      ...details.map((d) => d.batch?.manufacture ?? "-"),
    ]
    const productionDate = [
      tr("production_date", "Tanggal Produksi"),
      ...details.map((d) =>
        formatDate(d.batch?.production_date as any, this.timezone)
      ),
    ]
    const expirationDate = [
      tr("expiration_date", "Tanggal Kadaluarsa"),
      ...details.map((d) =>
        formatDate(d.batch?.expiration_date as any, this.timezone)
      ),
    ]

    const colWidths = [10, 25, 35, 20, 20, 20, 20, 20] // Total = 170
    this.addDistributionDetailsTable(
      [
        no,
        parentName,
        material,
        tanggalDistribusi,
        jamDistribusi,
        manufacture,
        productionDate,
        expirationDate,
      ],
      colWidths
    )
  }

  private addDistributionDetailsTable(
    columns: string[][],
    colWidths: number[]
  ): void {
    this.checkPageBreak(25)

    const padding = 2
    const headerHeight = 10
    const numRows = (Math.max(...columns.map((c) => c.length)) ?? 1) - 1

    // Header row
    let xPos = PAGE.marginLeft
    for (let col = 0; col < columns.length; col++) {
      this.doc.setFillColor(COLORS.primary)
      this.doc.rect(xPos, this.currentY, colWidths[col] ?? 0, headerHeight, "F")
      this.doc.setDrawColor(COLORS.borderGray)
      this.doc.setLineWidth(0.2)
      this.doc.rect(xPos, this.currentY, colWidths[col] ?? 0, headerHeight)
      xPos += colWidths[col] ?? 0
    }

    // Header text — vertical center
    xPos = PAGE.marginLeft
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(7)
    this.doc.setTextColor(COLORS.white)
    for (let col = 0; col < columns.length; col++) {
      const label = columns[col]?.[0] ?? "-"
      const colW = colWidths[col] ?? 0
      const splitLabel = this.doc.splitTextToSize(label, colW - padding * 2)
      const totalTextHeight = splitLabel.length * 3.2
      const textY = this.currentY + (headerHeight - totalTextHeight) / 2 + 3.2

      splitLabel.forEach((line: string, lineIdx: number) => {
        this.doc.text(line, xPos + colW / 2, textY + lineIdx * 3.2, {
          align: "center",
        })
      })

      xPos += colW
    }

    this.currentY += headerHeight

    // Data rows
    for (let row = 0; row < numRows; row++) {
      const rowCells = columns.map((col) => col[row + 1] ?? "-")
      const splitTexts = rowCells.map((text, i) =>
        this.doc.splitTextToSize(text, (colWidths[i] ?? 0) - padding * 2)
      )

      const maxLines = Math.max(...splitTexts.map((st) => st.length), 1)
      const dynamicRowHeight = Math.max(8, maxLines * 3 + 2)

      this.checkPageBreak(dynamicRowHeight)

      xPos = PAGE.marginLeft
      for (let col = 0; col < columns.length; col++) {
        const colW = colWidths[col] ?? 0

        this.doc.setDrawColor(COLORS.borderGray)
        this.doc.setLineWidth(0.15)
        this.doc.rect(xPos, this.currentY, colW, dynamicRowHeight)

        const textLines = splitTexts[col] ?? []
        const align = [0, 3, 4, 5].includes(col) ? "center" : "left"
        const textX = align === "center" ? xPos + colW / 2 : xPos + padding

        this.doc.setTextColor(COLORS.black)
        this.doc.setFont("helvetica", "normal")
        this.doc.setFontSize(7)
        this.doc.text(textLines, textX, this.currentY + 3.5, { align })

        xPos += colW
      }

      this.currentY += dynamicRowHeight
    }
  }

  private renderParameterCategoryItems(
    items: HistoryPdfData["parameter_category_items"]
  ): void {
    if (!items?.length) return
    const regularRows: string[][] = []
    for (const item of items) {
      if (isArrayOfObjects(item.value)) {
        if (regularRows.length > 0) {
          this.addLabelValueTable(regularRows)
          regularRows.length = 0
        }
        this.addObjectArrayNestedTable(item.label ?? item.key, item.value)
      } else {
        let value = formatValue(item.value)
        if (item.type === "date" && item.value) {
          value = momentTZ(item.value as string)
            .tz(this.timezone)
            .format("DD MMM YYYY")
        }
        regularRows.push([item.label ?? item.key, value])
      }
    }
    if (regularRows.length > 0) this.addLabelValueTable(regularRows)
  }

  // ── Drawing helpers ──────────────────────────────────────────────

  private checkPageBreak(requiredHeight: number): void {
    const pageHeight = 297 // A4 height in mm
    const marginBottom = 20

    if (this.currentY + requiredHeight > pageHeight - marginBottom) {
      this.doc.addPage()
      this.currentY = PAGE.marginTop
    }
  }

  private addTitle(text: string): void {
    this.checkPageBreak(15)
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(16)
    this.doc.setTextColor(COLORS.primaryDark)
    this.doc.text(text, PAGE.width / 2, this.currentY, { align: "center" })
    this.currentY += 8
  }

  private addSubtitle(text: string): void {
    this.checkPageBreak(10)
    this.doc.setFont("helvetica", "italic")
    this.doc.setFontSize(9)
    this.doc.setTextColor(COLORS.gray)
    this.doc.text(text, PAGE.width / 2, this.currentY, { align: "center" })
    this.currentY += 6
  }

  private addSectionTitle(text: string): void {
    this.checkPageBreak(12)
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(11)
    this.doc.setTextColor(COLORS.primary)
    this.doc.text(text, PAGE.marginLeft, this.currentY)
    this.currentY += 6
  }

  private addLabelValueTable(rows: string[][]): void {
    const labelWidth = 55
    const valueWidth = PAGE.contentWidth - labelWidth
    const padding = 2

    for (const [label, value] of rows) {
      // Calculate how many lines the value will take
      this.doc.setFont("helvetica", "normal")
      this.doc.setFontSize(9)
      const splitValue = this.doc.splitTextToSize(
        value,
        valueWidth - padding * 2
      )
      const rowHeight = Math.max(7, splitValue.length * 4 + 3)

      this.checkPageBreak(rowHeight + 2)

      // Draw borders
      this.doc.setDrawColor(COLORS.borderGray)
      this.doc.setLineWidth(0.2)
      this.doc.rect(PAGE.marginLeft, this.currentY, labelWidth, rowHeight)
      this.doc.rect(
        PAGE.marginLeft + labelWidth,
        this.currentY,
        valueWidth,
        rowHeight
      )

      // Label cell
      this.doc.setFont("helvetica", "bold")
      this.doc.setFontSize(9)
      this.doc.setTextColor(COLORS.black)

      const splitLabel = this.doc.splitTextToSize(
        label,
        labelWidth - padding * 2
      )
      this.doc.text(splitLabel, PAGE.marginLeft + padding, this.currentY + 5)

      // Value cell
      this.doc.setFont("helvetica", "normal")
      this.doc.text(
        splitValue,
        PAGE.marginLeft + labelWidth + padding,
        this.currentY + 5
      )

      this.currentY += rowHeight
    }
  }

  private addObjectArrayNestedTable(
    label: string,
    items: Array<Record<string, unknown>>
  ): void {
    const labelWidth = 55
    const valueWidth = PAGE.contentWidth - labelWidth
    const padding = 2
    const headerH = 7
    const rowH = 6

    // Ambil kolom secara dinamis dari keys object pertama (exclude 'id')
    const columns = getObjectColumns(items)
    const colCount = columns.length
    const colW = valueWidth / colCount

    // Total height = header row + data rows
    const totalHeight = headerH + rowH * items.length

    this.checkPageBreak(totalHeight + 2)

    this.doc.setDrawColor(COLORS.borderGray)
    this.doc.setLineWidth(0.2)

    // Left cell (label) – spans entire height (vertically centered)
    this.doc.rect(PAGE.marginLeft, this.currentY, labelWidth, totalHeight)
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(9)
    this.doc.setTextColor(COLORS.black)
    const splitLabel = this.doc.splitTextToSize(label, labelWidth - padding * 2)
    const labelTextY =
      this.currentY + totalHeight / 2 - (splitLabel.length * 4) / 2 + 3
    this.doc.text(splitLabel, PAGE.marginLeft + padding, labelTextY)

    // Right side: nested table
    const rightX = PAGE.marginLeft + labelWidth

    // Header row background
    this.doc.setFillColor(COLORS.primary)
    this.doc.rect(rightX, this.currentY, valueWidth, headerH, "F")

    // Draw header cells & text
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(8)
    this.doc.setTextColor(COLORS.white)
    for (let c = 0; c < colCount; c++) {
      const cellX = rightX + c * colW
      this.doc.setDrawColor(COLORS.borderGray)
      this.doc.rect(cellX, this.currentY, colW, headerH)
      // Gunakan key sebagai header (ubah underscore jadi spasi, capitalize)
      const headerText = columns[c]
        .replace(/_/g, " ")
        .replace(/\b\w/g, (ch) => ch.toUpperCase())
      this.doc.text(headerText, cellX + colW / 2, this.currentY + 4.5, {
        align: "center",
      })
    }

    let innerY = this.currentY + headerH

    // Data rows
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)
    this.doc.setTextColor(COLORS.black)
    for (const row of items) {
      for (let c = 0; c < colCount; c++) {
        const cellX = rightX + c * colW
        this.doc.setDrawColor(COLORS.borderGray)
        this.doc.rect(cellX, innerY, colW, rowH)

        const cellVal = row[columns[c]]
        let cellText: string
        if (cellVal == null) {
          cellText = "-"
        } else if (typeof cellVal === "object") {
          cellText = JSON.stringify(cellVal)
        } else {
          cellText = String(cellVal as string | number | boolean | bigint)
        }
        this.doc.text(cellText, cellX + colW / 2, innerY + 4, {
          align: "center",
        })
      }
      innerY += rowH
    }

    this.currentY += totalHeight
  }

  private addTestResultsTable(results: HistoryPdfData["test_results"]): void {
    const { tr } = this
    const headers = [
      tr("no", "No"),
      tr("parameter_name", "Nama Parameter"),
      tr("quality_standard", "Baku Mutu"),
      tr("unit", "Satuan"),
      tr("test_method", "Metode Uji"),
      tr("result", "Hasil"),
    ]
    const colWidths = [12, 45, 28, 20, 38, 27] // Total = 170
    const rowHeight = 7
    const headerHeight = 8
    const padding = 2

    // Check if we need a page break for at least header + 1 row
    this.checkPageBreak(headerHeight + rowHeight + 5)

    // Draw header row
    let xPos = PAGE.marginLeft
    this.doc.setFillColor(COLORS.primary)
    for (let i = 0; i < headers.length; i++) {
      this.doc.rect(xPos, this.currentY, colWidths[i], headerHeight, "F")
      this.doc.setDrawColor(COLORS.borderGray)
      this.doc.rect(xPos, this.currentY, colWidths[i], headerHeight)
      xPos += colWidths[i]
    }

    // Header text
    xPos = PAGE.marginLeft
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(8)
    this.doc.setTextColor(COLORS.white)
    for (let i = 0; i < headers.length; i++) {
      this.doc.text(headers[i], xPos + colWidths[i] / 2, this.currentY + 5.5, {
        align: "center",
      })
      xPos += colWidths[i]
    }

    this.currentY += headerHeight

    // Data rows
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)
    this.doc.setTextColor(COLORS.black)

    if (!results || results.length === 0) {
      // No data row
      this.checkPageBreak(rowHeight)
      this.doc.setDrawColor(COLORS.borderGray)
      this.doc.rect(
        PAGE.marginLeft,
        this.currentY,
        PAGE.contentWidth,
        rowHeight
      )
      this.doc.setFont("helvetica", "italic")
      this.doc.setTextColor(COLORS.lightGray)
      this.doc.text(
        tr("no_test_results", "Tidak ada hasil uji"),
        PAGE.width / 2,
        this.currentY + 5,
        { align: "center" }
      )
      this.currentY += rowHeight
      return
    }

    for (let idx = 0; idx < results.length; idx++) {
      const r = results[idx]
      const rowData = [
        String(idx + 1),
        r.parameter_name ?? "-",
        r.quality_standard ?? "-",
        r.unit ?? "-",
        r.test_methods_name ?? "-",
        r.result_value ?? "-",
      ]
      this.renderTestResultRow(rowData, colWidths, padding)
    }
  }

  private renderTestResultRow(
    rowData: string[],
    colWidths: number[],
    padding: number
  ): void {
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)
    const splitTexts = rowData.map((text, i) => {
      return this.doc.splitTextToSize(text, colWidths[i] - padding * 2)
    })

    const maxLines = Math.max(...splitTexts.map((st) => st.length))
    const dynamicRowHeight = Math.max(7, maxLines * 4 + 3)

    this.checkPageBreak(dynamicRowHeight)

    let xPos = PAGE.marginLeft
    for (let i = 0; i < splitTexts.length; i++) {
      this.doc.setDrawColor(COLORS.borderGray)
      this.doc.rect(xPos, this.currentY, colWidths[i], dynamicRowHeight)

      const textLines = splitTexts[i]
      const align = i === 0 || i === 2 || i === 3 || i === 5 ? "center" : "left"
      const textX =
        align === "center" ? xPos + colWidths[i] / 2 : xPos + padding

      this.doc.setTextColor(COLORS.black)
      this.doc.text(textLines, textX, this.currentY + 5, { align })
      xPos += colWidths[i]
    }

    this.currentY += dynamicRowHeight
  }
}
