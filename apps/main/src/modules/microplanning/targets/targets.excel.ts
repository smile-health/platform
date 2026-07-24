import BaseTemplate from "@smile/lib/excel/index.js"
import path from "path"
import { PROCESSOR } from "@smile/lib/excel/types.js"

export class MicroplanningTemplate extends BaseTemplate {
  constructor(
    startRow = 10,
    startSheet = 1,
    processor = PROCESSOR.XLSXPOPULATE
  ) {
    super(startRow, startSheet, processor)
  }

  async loadFile(fileName: string): Promise<void> {
    const templatePath = path.resolve(
      "public",
      "templates",
      "microplanning",
      fileName
    )
    return this.loadFromFile(templatePath)
  }
}
