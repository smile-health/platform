import BaseTemplate from "@smile/lib/excel/index.js"
import { PROCESSOR } from "@smile/lib/excel/types.js"

export class BmhpPlanningTemplate extends BaseTemplate {
  constructor(
    startRow = 2,
    startSheet = 1,
    processor = PROCESSOR.XLSXPOPULATE
  ) {
    super(startRow, startSheet, processor)
  }

  getAlignment(colIndex: number): string {
    // 1-based index
    const centerCols = [1, 2, 8, 12, 13, 14, 15, 17, 18, 22, 24]
    return centerCols.includes(colIndex) ? "center" : "left"
  }

  override setColumns(columns: any[], startCell = "A1", sheetName?: string) {
    super.setColumns(columns, startCell, sheetName)
    const processor = (this as any).processor
    if (processor?.workbook) {
      const sheet = sheetName
        ? processor.workbook.sheet(sheetName)
        : processor.workbook.sheet(0)
      if (sheet) {
        const rowIndex = sheet.cell(startCell).rowNumber()
        const startCol = sheet.cell(startCell).columnNumber()
        for (let i = 0; i < columns.length; i++) {
          const cell = sheet.cell(rowIndex, startCol + i)
          cell.style({
            bold: true,
            fontSize: 12,
            horizontalAlignment: this.getAlignment(startCol + i),
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
    if (processor?.workbook) {
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
    if (processor?.workbook) {
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
