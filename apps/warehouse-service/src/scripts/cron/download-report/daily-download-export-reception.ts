import { db } from "@/common/infrastructure/database/index.js"
import { DB } from "@/common/infrastructure/database/types/db.js"
import { DownloadReportReceptionCron } from "@/modules/download-report/cron/reception.cron.js"
import { DownloadReportQuery } from "@/modules/download-report/download-report.query.js"
import { DownloadReportRepository } from "@/modules/download-report/download-report.repository.js"
import { ReceptionGenerateReport } from "@/modules/download-report/generate-report/reception.generate-report.js"
import { TransactionManager } from "@smile/lib/database.js"
import i18n from "@smile/lib/i18n.js"
import { CustomContext } from "@smile/lib/types/context.js"
import { Transaction } from "kysely"

export const dailyDownloadExportReception = async () => {
  const downloadReportRepo = new DownloadReportRepository(
    new DownloadReportQuery()
  )
  const downloadReportReceptionCron = new DownloadReportReceptionCron(
    new DownloadReportRepository(new DownloadReportQuery()),
    new ReceptionGenerateReport(downloadReportRepo)
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

      await downloadReportReceptionCron.handleReportReception(c, lang)
    }

    console.log("✅ Process finished - Daily Reception Export")
    process.exit(0)
  } catch (error) {
    console.error("❌ Process failed - Daily Reception Export", error)
    process.exit(1)
  }
}
