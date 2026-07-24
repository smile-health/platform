import { db } from "@/common/infrastructure/database/index.js"
import { DB } from "@/common/infrastructure/database/types/db.js"
import { DownloadReportConsumptionCron } from "@/modules/download-report/cron/consumption.cron.js"
import { DownloadReportQuery } from "@/modules/download-report/download-report.query.js"
import { DownloadReportRepository } from "@/modules/download-report/download-report.repository.js"
import { ConsumptionGenerateReport } from "@/modules/download-report/generate-report/consumption.generate-report.js"
import { TransactionManager } from "@smile/lib/database.js"
import i18n from "@smile/lib/i18n.js"
import { CustomContext } from "@smile/lib/types/context.js"
import { Transaction } from "kysely"
import moment from "moment-timezone"

export const annualDownloadExportConsumption = async (
  inputYear?: number,
  programId?: number
) => {
  const downloadReportRepo = new DownloadReportRepository(
    new DownloadReportQuery()
  )
  const downloadReportConsumptionCron = new DownloadReportConsumptionCron(
    new DownloadReportRepository(new DownloadReportQuery()),
    new ConsumptionGenerateReport(downloadReportRepo)
  )

  // Use provided year or default to current year
  let year: number

  if (inputYear) {
    year = inputYear
  } else {
    year = moment().year()
  }

  console.log(`📅 Processing annual consumption report for: ${year}`)

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

      await downloadReportConsumptionCron.handleReportConsumptionAnnual(
        c,
        lang,
        year,
        programId
      )
    }

    console.log("✅ Process finished - Annual Consumption Export")
    process.exit(0)
  } catch (error) {
    console.error("❌ Process failed - Annual Consumption Export", error)
    process.exit(1)
  }
}
