import { db } from "@/common/infrastructure/database/index.js"
import { DB } from "@/common/infrastructure/database/types/db.js"
import { DownloadReportExpiredMaterialCron } from "@/modules/download-report/cron/expired-material.cron.js"
import { DownloadReportQuery } from "@/modules/download-report/download-report.query.js"
import { DownloadReportRepository } from "@/modules/download-report/download-report.repository.js"
import { ExpiredMaterialGenerateReport } from "@/modules/download-report/generate-report/expired-material.generate-report.js"
import { TransactionManager } from "@smile-health/lib/database.js"
import i18n from "@smile-health/lib/i18n.js"
import { CustomContext } from "@smile-health/lib/types/context.js"
import { Transaction } from "kysely"

export const dailyDownloadExportExpiredMaterial = async () => {
  const downloadReportRepo = new DownloadReportRepository(
    new DownloadReportQuery()
  )
  const downloadReportExpiredMaterialCron =
    new DownloadReportExpiredMaterialCron(
      new DownloadReportRepository(new DownloadReportQuery()),
      new ExpiredMaterialGenerateReport(downloadReportRepo)
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

      await downloadReportExpiredMaterialCron.handleReportExpiredMaterial(
        c,
        lang
      )
    }

    console.log("✅ Process finished - Daily Expired Material Export")
    process.exit(0)
  } catch (error) {
    console.error("❌ Process failed - Daily Expired Material Export", error)
    process.exit(1)
  }
}
