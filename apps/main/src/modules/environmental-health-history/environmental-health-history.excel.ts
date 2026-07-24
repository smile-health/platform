import BaseTemplate from "@smile/lib/excel/index.js"
import path from "path"
import { PROCESSOR } from "@smile/lib/excel/types.js"

export class EnvironmentalHealthHistoryTemplate extends BaseTemplate {
  private centerCols: number[] = []

  constructor(
    startRow = 2,
    startSheet = 1,
    processor = PROCESSOR.XLSXPOPULATE
  ) {
    super(startRow, startSheet, processor)
  }

  async loadFile(
    fileName: string = "environmental-health-history.xlsx"
  ): Promise<void> {
    const templatePath = path.resolve(
      "public",
      "templates",
      "environmental-health",
      fileName
    )
    return this.loadFromFile(templatePath)
  }

  getAlignment(colIndex: number): string {
    return this.centerCols.includes(colIndex) ? "center" : "left"
  }

  override setColumns(columns: any[], startCell = "A1", sheetName?: string) {
    super.setColumns(columns, startCell, sheetName)
    const processor = (this as any).processor
    if (processor && processor.workbook) {
      const sheet = sheetName
        ? processor.workbook.sheet(sheetName)
        : processor.workbook.sheet(0)
      if (sheet) {
        const rowIndex = sheet.cell(startCell).rowNumber()
        const startCol = sheet.cell(startCell).columnNumber()

        // Reset and identify center columns based on headers
        this.centerCols = []
        const centerKeywords = ["No", "Status", "IKL", "IKL Score", "Unit"]

        for (let i = 0; i < columns.length; i++) {
          const colIndex = startCol + i
          const header = columns[i].header || ""
          const isCenter = centerKeywords.some((kw) => header.includes(kw))
          if (isCenter) this.centerCols.push(colIndex)

          const cell = sheet.cell(rowIndex, colIndex)
          cell.style({
            bold: true,
            fontSize: 12,
            horizontalAlignment: isCenter ? "center" : "left",
            verticalAlignment: "center",
            border: true,
          })
        }
      }
    }
  }

  override async addRows(
    sheetName: string,
    rows: any[],
    rowIndex = 2,
    columnLetter = "A",
    style?: any
  ) {
    await super.addRows(sheetName, rows, rowIndex, columnLetter, style)
    const processor = (this as any).processor
    if (processor && processor.workbook) {
      const sheet = processor.workbook.sheet(sheetName)
      if (sheet) {
        const startCol = sheet.column(columnLetter).columnNumber()
        for (let i = 0; i < rows.length; i++) {
          const rowData = rows[i]
          const keys = Object.keys(rowData)
          for (let j = 0; j < keys.length; j++) {
            const colIndex = startCol + j
            const cell = sheet.cell(rowIndex + i, colIndex)
            cell.style({
              border: true,
              verticalAlignment: "center",
              horizontalAlignment: this.getAlignment(colIndex),
            })
          }
        }
      }
    }
  }

  override mergeCells(
    sheetName: string,
    startCell: string,
    endCell: string,
    center?: boolean
  ) {
    const processor = (this as any).processor
    if (processor && processor.workbook) {
      const sheet = processor.workbook.sheet(sheetName)
      if (sheet) {
        const range = sheet.range(`${startCell}:${endCell}`).merged(true)
        const colIndex = sheet.cell(startCell).columnNumber()
        range.style({
          verticalAlignment: "center",
          horizontalAlignment: this.getAlignment(colIndex),
        })
      }
    } else {
      super.mergeCells(sheetName, startCell, endCell, center)
    }
  }
}
