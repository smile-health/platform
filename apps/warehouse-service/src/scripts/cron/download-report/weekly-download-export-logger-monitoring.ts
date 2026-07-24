import { db } from "@/common/infrastructure/database/index.js"
import { DownloadReportLoggerMonitoringCron } from "@/modules/download-report/cron/logger-monitoring.cron.js"
import { DownloadReportQuery } from "@/modules/download-report/download-report.query.js"
import { DownloadReportRepository } from "@/modules/download-report/download-report.repository.js"
import { LoggerMonitoringGenerateReport } from "@/modules/download-report/generate-report/logger-monitoring.generate-report.js"
import { LoggerMonitoringRepository } from "@/modules/logger-monitoring/logger-monitoring.repository.js"
import { LoggerMonitoringQuery } from "@/modules/logger-monitoring/logger-monitoring.query.js"
import { TransactionManager } from "@smile/lib/database.js"
import i18n from "@smile/lib/i18n.js"
import { CustomContext } from "@smile/lib/types/context.js"
import { Transaction } from "kysely"
import { DB } from "@/common/infrastructure/database/types/db.js"

export const weeklyDownloadExportLoggerMonitoring = async () => {
  const downloadReportRepo = new DownloadReportRepository(
    new DownloadReportQuery()
  )

  const loggerMonitoringRepo = new LoggerMonitoringRepository(
    new LoggerMonitoringQuery()
  )

  const loggerMonitoringGenerate = new LoggerMonitoringGenerateReport(
    loggerMonitoringRepo
  )

  const downloadReportLoggerMonitoringCron =
    new DownloadReportLoggerMonitoringCron(
      downloadReportRepo,
      loggerMonitoringGenerate
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

      await downloadReportLoggerMonitoringCron.handleReportLoggerMonitoringRecent(
        c,
        lang
      )
    }

    console.log(
      "✅ Process finished - Weekly Logger Monitoring Export (Last 7 Days)"
    )
    process.exit(0)
  } catch (error) {
    console.error("❌ Process failed - Weekly Logger Monitoring Export", error)
    process.exit(1)
  }
}
