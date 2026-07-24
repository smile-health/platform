import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  ShadingType,
  TableLayoutType,
} from "docx"
import momentTZ from "moment-timezone"
import type { TFunction } from "i18next"

/**
 * Type alias for date fields that can be string, Date, or null
 */
type DateValue = string | Date | null

/**
 * Data shape for generating the environmental health document.
 * Designed to be flexible so it can be reused for different data sources.
 */
export interface EnvironmentalHealthDocumentData {
  id: number
  created_at: string | Date
  entity_name: string | null
  entity_address: string | null
  parameter_category_name: string
  activity_name?: string | null
  parameter_category_items: Array<{
    label: string
    key: string
    value: unknown
    type?: string | null
  }>
  sample_id: string
  received_date: DateValue
  lab_result_status: string
  test_start_date: DateValue
  test_end_date: DateValue
  sample_collected_by: string | null
  location: string | null
  collection_date: DateValue
  management_asset?: {
    id: number
    model_name: string | null
    serial_number: string | null
    production_year: number | null
    working_status: string | null
    asset_type_name: string | null
  } | null
  has_ikl: boolean
  ikl_test_date: DateValue
  ikl_score: number | null
  is_qualified: boolean
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
    quantity: number
    distributed_by: string | null
    distributed_to: string | null
    actual_transaction_date: string | null
    batch: {
      code: string | null
      expiration_date: string | null
      manufacture: string | null
      production_date: string | null
    }
    stock: { opening: number | null; closing: number | null }
    created_at: string | null
    updated_at: string | null
  }>
}

export interface DocumentGenerateResult {
  filename: string
  base64: string
  mimeType: string
}

const MIME_TYPE_DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

// ── Styling helpers ──────────────────────────────────────────────────

const BORDER_STYLE = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: "999999",
}

const TABLE_BORDERS = {
  top: BORDER_STYLE,
  bottom: BORDER_STYLE,
  left: BORDER_STYLE,
  right: BORDER_STYLE,
}

const HEADER_SHADING = {
  type: ShadingType.SOLID,
  color: "2E86C1",
  fill: "2E86C1",
}

function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            color: "FFFFFF",
            size: 20,
            font: "Calibri",
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
    shading: HEADER_SHADING,
    borders: TABLE_BORDERS,
    ...(width ? { width: { size: width, type: WidthType.PERCENTAGE } } : {}),
  })
}

function dataCell(text: string, alignment = AlignmentType.LEFT): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, size: 20, font: "Calibri" })],
        alignment,
      }),
    ],
    borders: TABLE_BORDERS,
  })
}

function labelValueRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: label,
                bold: true,
                size: 20,
                font: "Calibri",
              }),
            ],
          }),
        ],
        borders: TABLE_BORDERS,
        width: { size: 35, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: value, size: 20, font: "Calibri" })],
          }),
        ],
        borders: TABLE_BORDERS,
        width: { size: 65, type: WidthType.PERCENTAGE },
      }),
    ],
  })
}

function formatDate(
  value: string | Date | null | undefined,
  timezone: string
): string {
  if (!value) return "-"
  return momentTZ(value).tz(timezone).format("DD MMM YYYY")
}

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        font: "Calibri",
        color: "2E86C1",
      }),
    ],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
  })
}

function emptyLine(): Paragraph {
  return new Paragraph({ children: [], spacing: { before: 100 } })
}

function formatItemValue(value: unknown): string {
  if (value === null || value === undefined) return "-"
  if (Array.isArray(value)) return value.map(formatItemValue).join(", ")
  if (typeof value === "object") return JSON.stringify(value)
  return String(value as string | number | boolean | bigint)
}

// ── Main generator ───────────────────────────────────────────────────

export class EnvironmentalHealthDocumentGenerator {
  /**
   * Generate a Word document from the given data and return base64 + metadata.
   * @param data  The environmental health test record
   * @param options  timezone & language for filename formatting
   */
  async generate(
    data: EnvironmentalHealthDocumentData,
    options: { timezone?: string; language?: string; t?: TFunction } = {}
  ): Promise<DocumentGenerateResult> {
    const timezone = options.timezone ?? "Asia/Jakarta"
    const language = options.language ?? "en"
    const t = options.t

    const sections = this.buildSections(data, timezone, t)

    const doc = new Document({
      sections: [{ children: sections }],
      creator: "SMILE Environmental Health",
      title: `${t ? t("environmental_health.document.title") : "Environmental Health Test Report"} #${data.id}`,
    })

    const buffer = await Packer.toBuffer(doc)
    const base64 = Buffer.from(buffer).toString("base64")

    const currentTime = momentTZ().tz(timezone)
    const filename =
      `EnvironmentalHealthReport_${currentTime.format("YYYYMMDD_HHmm")} ` +
      `${currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase()} ` +
      `GMT${currentTime.format("Z").replace(":00", "")}_${language}`

    return { filename, base64, mimeType: MIME_TYPE_DOCX }
  }

  // ── Section builders ─────────────────────────────────────────────

  private buildSections(
    data: EnvironmentalHealthDocumentData,
    timezone: string,
    t?: TFunction
  ): (Paragraph | Table)[] {
    // Helper to get translated text with fallback
    const tr = (key: string, fallback: string): string =>
      t
        ? t(`environmental_health.document.${key}`, { defaultValue: fallback })
        : fallback
    const children: (Paragraph | Table)[] = []

    // Title
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: tr("title", "Environmental Health Test Report"),
            bold: true,
            size: 32,
            font: "Calibri",
            color: "1B4F72",
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    )

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${tr("report_id", "Report ID")}: #${data.id}  |  ${tr("generated", "Generated")}: ${momentTZ().tz(timezone).format("DD MMM YYYY HH:mm")}`,
            size: 18,
            font: "Calibri",
            color: "666666",
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    )

    // 1. Entity Information
    children.push(sectionTitle(tr("entity_information", "Entity Information")))
    children.push(
      new Table({
        rows: [
          labelValueRow(
            tr("entity_name", "Entity Name"),
            data.entity_name || "-"
          ),
          labelValueRow(
            tr("entity_address", "Entity Address"),
            data.entity_address || "-"
          ),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
      })
    )

    children.push(emptyLine())

    // 2. Sample Information
    children.push(sectionTitle(tr("sample_information", "Sample Information")))
    children.push(
      new Table({
        rows: [
          labelValueRow(tr("sample_id", "Sample ID"), data.sample_id || "-"),
          labelValueRow(tr("activity", "Activity"), data.activity_name ?? "-"),
          labelValueRow(
            tr("received_date", "Received Date"),
            formatDate(data.received_date, timezone)
          ),
          labelValueRow(
            tr("collection_date", "Collection Date"),
            formatDate(data.collection_date, timezone)
          ),
          labelValueRow(tr("location", "Location"), data.location ?? "-"),
          labelValueRow(tr("sample_collected_by", "Sample Collected By"), data.sample_collected_by ?? "-"),
          labelValueRow(tr("lab_result_status", "Lab Result Status"), (data.lab_result_status ?? "-").toUpperCase()),
          labelValueRow(tr("test_start_date", "Test Start Date"), formatDate(data.test_start_date, timezone)),
          labelValueRow(tr("test_end_date", "Test End Date"), formatDate(data.test_end_date, timezone)),
          labelValueRow(tr("examination_entity", "Examination Location"), data.examination_entity?.name ?? "-"),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
      })
    )

    children.push(emptyLine())

    // 3. Parameter Category
    children.push(
      sectionTitle(
        `${tr("parameter_category", "Parameter Category")}: ${data.parameter_category_name}`
      )
    )
    if (
      data.parameter_category_items &&
      data.parameter_category_items.length > 0
    ) {
      const paramRows = data.parameter_category_items.map((item) => {
        let valueStr = formatItemValue(item.value)
        if (item.type === "date" && item.value) {
          valueStr = momentTZ(item.value as string)
            .tz(timezone)
            .format("DD MMM YYYY")
        }
        return labelValueRow(item.label ?? item.key, valueStr)
      })
      children.push(
        new Table({
          rows: paramRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          layout: TableLayoutType.FIXED,
        })
      )
    }

    children.push(emptyLine())

    // 4. Test Results
    children.push(sectionTitle(tr("test_results", "Test Results")))
    children.push(this.buildTestResultsTable(data.test_results, tr))

    children.push(emptyLine())

    // 5. IKL Section
    children.push(
      sectionTitle(tr("ikl_title", "IKL (Indeks Kualitas Lingkungan)"))
    )
    children.push(
      new Table({
        rows: [
          labelValueRow(
            tr("has_ikl", "Has IKL"),
            data.has_ikl ? tr("yes", "Yes") : tr("no_value", "No")
          ),
          labelValueRow(
            tr("ikl_test_date", "IKL Test Date"),
            formatDate(data.ikl_test_date, timezone)
          ),
          labelValueRow(
            tr("ikl_score", "IKL Score"),
            data.ikl_score !== null && data.ikl_score !== undefined
              ? String(data.ikl_score)
              : "-"
          ),
          labelValueRow(
            tr("qualified", "Qualified"),
            data.is_qualified
              ? tr("qualified_label", "✓ Qualified")
              : tr("not_qualified_label", "✗ Not Qualified")
          ),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
      })
    )

    // 6. Distribution Details Section
    if (data.distribution_details && data.distribution_details.length > 0) {
      children.push(emptyLine())
      children.push(sectionTitle(tr("distribution_details_title", "Distribution Details")))
      children.push(this.buildDistributionDetailsTable(data.distribution_details, tr, timezone))
    }

    return children
  }

  private buildTestResultsTable(
    results: EnvironmentalHealthDocumentData["test_results"],
    tr: (key: string, fallback: string) => string
  ): Table {
    const headerRow = new TableRow({
      children: [
        headerCell(tr("no", "No"), 8),
        headerCell(tr("parameter_name", "Parameter Name"), 25),
        headerCell(tr("quality_standard", "Quality Standard"), 17),
        headerCell(tr("unit", "Unit"), 12),
        headerCell(tr("test_method", "Test Method"), 22),
        headerCell(tr("result", "Result"), 16),
      ],
    })

    const dataRows =
      results && results.length > 0
        ? results.map(
            (r, idx) =>
              new TableRow({
                children: [
                  dataCell(String(idx + 1), AlignmentType.CENTER),
                  dataCell(r.parameter_name ?? "-"),
                  dataCell(r.quality_standard ?? "-", AlignmentType.CENTER),
                  dataCell(r.unit ?? "-", AlignmentType.CENTER),
                  dataCell(r.test_methods_name ?? "-"),
                  dataCell(r.result_value ?? "-", AlignmentType.CENTER),
                ],
              })
          )
        : [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: tr(
                            "no_test_results",
                            "No test results available"
                          ),
                          italics: true,
                          size: 20,
                          font: "Calibri",
                          color: "999999",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  borders: TABLE_BORDERS,
                  columnSpan: 6,
                }),
              ],
            }),
          ]

    return new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
    })
  }

  private buildDistributionDetailsTable(
    details: EnvironmentalHealthDocumentData["distribution_details"],
    tr: (key: string, fallback: string) => string,
    timezone: string
  ): Table {
    const headerRow = new TableRow({
      children: [
        headerCell(tr("no", "No"), 5),
        headerCell(tr("parent_name", "Parent Name"), 12),
        headerCell(tr("material", "Material"), 12),
        headerCell(tr("quantity", "Quantity"), 7),
        headerCell(tr("stock_opening", "Stock Awal"), 7),
        headerCell(tr("stock_closing", "Stock Akhir"), 7),
        headerCell(tr("manufacture", "Manufacture"), 12),
        headerCell(tr("production_date", "Production Date"), 10),
        headerCell(tr("expiration_date", "Expiration Date"), 10),
      ],
    })

    const dataRows = details && details.length > 0
      ? details.map((d, idx) =>
          new TableRow({
            children: [
              dataCell(String(idx + 1), AlignmentType.CENTER),
              dataCell(d.material?.name ?? "-"),
              dataCell(d.material?.full_name ?? "-"),
              dataCell(String(d.quantity ?? "-"), AlignmentType.CENTER),
              dataCell(String(d.stock?.opening ?? "-"), AlignmentType.CENTER),
              dataCell(String(d.stock?.closing ?? "-"), AlignmentType.CENTER),
              dataCell(d.batch?.manufacture ?? "-"),
              dataCell(formatDate(d.batch?.production_date, timezone), AlignmentType.CENTER),
              dataCell(formatDate(d.batch?.expiration_date, timezone), AlignmentType.CENTER),
            ],
          })
        )
      : [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: tr("no_distribution_details", "No distribution details available"), italics: true, size: 20, font: "Calibri", color: "999999" }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                borders: TABLE_BORDERS,
                columnSpan: 9,
              }),
            ],
          }),
        ]

    return new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
    })
  }

}
