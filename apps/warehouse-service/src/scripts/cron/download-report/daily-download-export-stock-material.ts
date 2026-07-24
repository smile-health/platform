import { db } from "@/common/infrastructure/database/index.js"
import { DB } from "@/common/infrastructure/database/types/db.js"
import { DownloadReportStockMaterialCron } from "@/modules/download-report/cron/stock-material.cron.js"
import { DownloadReportQuery } from "@/modules/download-report/download-report.query.js"
import { DownloadReportRepository } from "@/modules/download-report/download-report.repository.js"
import { StockMaterialGenerateReport } from "@/modules/download-report/generate-report/stock-material.generate-report.js"
import { TransactionManager } from "@smile/lib/database.js"
import i18n from "@smile/lib/i18n.js"
import { CustomContext } from "@smile/lib/types/context.js"
import { Transaction } from "kysely"

export const dailyDownloadExportStockMaterial = async () => {
  const downloadReportRepo = new DownloadReportRepository(
    new DownloadReportQuery()
  )
  const downloadReportStockMaterialCron = new DownloadReportStockMaterialCron(
    new DownloadReportRepository(new DownloadReportQuery()),
    new StockMaterialGenerateReport(downloadReportRepo)
  )

  try {
    const trxManager = new TransactionManager(db).getDB() as Transaction<DB>
    const languages = ["en", "id"]
    const translator = i18n.cloneInstance()

    for (const lang of languages) {
      translator.changeLanguage(lang)

      const c = new CustomContext({
        trx: trxManager,
        t: translator.t,
        "feature-flags": () => false,
        "feature-enabled": () => false,
      })

      await downloadReportStockMaterialCron.handleReportStockMaterial(c, lang)
    }

    console.log("✅ Process finished - Daily Stock Material Export")
    process.exit(0)
  } catch (error) {
    console.error("❌ Process failed - Daily Stock Material Export", error)
    process.exit(1)
  }
}
