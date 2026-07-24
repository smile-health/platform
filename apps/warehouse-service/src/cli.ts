import { Command } from "commander"
import { sendQuarterlyNeedsEmail } from "./scripts/cron/commitment/send-quarterly-needs-email.js"
import { annualDownloadExportConsumption } from "./scripts/cron/download-report/annual-download-export-consumption.js"
import { dailyDownloadExportConsumption } from "./scripts/cron/download-report/daily-download-export-consumption.js"
import { dailyDownloadExportDiscard } from "./scripts/cron/download-report/daily-download-export-discard.js"
import { dailyDownloadExportExpiredMaterial } from "./scripts/cron/download-report/daily-download-export-expired-material.js"
import { dailyDownloadExportReception } from "./scripts/cron/download-report/daily-download-export-reception.js"
import { dailyDownloadExportStockMaterial } from "./scripts/cron/download-report/daily-download-export-stock-material.js"
import { monthlyDownloadExportLoggerMonitoringStreaming } from "./scripts/cron/download-report/monthly-download-export-logger-monitoring-streaming.js"
import { monthlyDownloadExportLoggerMonitoring } from "./scripts/cron/download-report/monthly-download-export-logger-monitoring.js"
import { monthlyDownloadExportStockAvailability } from "./scripts/cron/download-report/monthly-download-export-stock-availability.js"
import { weeklyDownloadExportLoggerMonitoring } from "./scripts/cron/download-report/weekly-download-export-logger-monitoring.js"
import { runWorker } from "./server.js"

const program = new Command()

program
  .command("daily-download-export-reception")
  .description("Run daily download export reception")
  .action(async () => await dailyDownloadExportReception())

program
  .command("daily-download-export-stock-material")
  .description("Run daily download export stock material")
  .action(async () => await dailyDownloadExportStockMaterial())

program
  .command("daily-download-export-consumption")
  .description("Run daily download consumption material")
  .action(async () => await dailyDownloadExportConsumption())

program
  .command("annual-download-export-consumption")
  .description(
    "Run annual download export consumption (current year by default)"
  )
  .option("-y, --year <year>", "Year (e.g., 2024)")
  .option("-p, --program <program>", "Program ID (e.g. 1)")
  .action(async (options) => {
    const year = options.year ? parseInt(options.year) : undefined
    const programId = options.program ? parseInt(options.program) : undefined
    await annualDownloadExportConsumption(year, programId)
  })

program
  .command("daily-download-export-discard")
  .description("Run daily download discard material")
  .action(async () => await dailyDownloadExportDiscard())

program
  .command("daily-download-export-expired-material")
  .description("Run daily download expired material")
  .action(async () => await dailyDownloadExportExpiredMaterial())

program
  .command("monthly-download-export-stock-availability")
  .description(
    "Run monthly download export stock availability (previous month by default)"
  )
  .option("-m, --month <month>", "Month (1-12)")
  .option("-y, --year <year>", "Year (e.g., 2024)")
  .option("-p, --program <program>", "Program ID (e.g. 1)")
  .action(async (options) => {
    const month = options.month ? parseInt(options.month) : undefined
    const year = options.year ? parseInt(options.year) : undefined
    const programId = options.program ? parseInt(options.program) : undefined
    await monthlyDownloadExportStockAvailability(month, year, programId)
  })

program
  .command("weekly-download-export-logger-monitoring")
  .description("Run weekly download export logger monitoring (last 7 days)")
  .action(async () => await weeklyDownloadExportLoggerMonitoring())

program
  .command("monthly-download-export-logger-monitoring")
  .description(
    "Run monthly download export logger monitoring (previous month by default)"
  )
  .option("-m, --month <month>", "Month (1-12)")
  .option("-y, --year <year>", "Year (e.g., 2024)")
  .action(async (options) => {
    const month = options.month ? parseInt(options.month) : undefined
    const year = options.year ? parseInt(options.year) : undefined
    await monthlyDownloadExportLoggerMonitoring(month, year)
  })

program
  .command("monthly-download-export-logger-monitoring-streaming")
  .description(
    "Run monthly download export logger monitoring with STREAMING (memory-efficient, previous month by default)"
  )
  .option("-m, --month <month>", "Month (1-12)")
  .option("-y, --year <year>", "Year (e.g., 2024)")
  .action(async (options) => {
    const month = options.month ? parseInt(options.month) : undefined
    const year = options.year ? parseInt(options.year) : undefined
    await monthlyDownloadExportLoggerMonitoringStreaming(month, year)
  })

program
  .command("send-quarterly-needs-email")
  .description("Send quarterly needs email alert to ministry of health users")
  .action(async () => await sendQuarterlyNeedsEmail())

program
  .command("run-worker")
  .description("Run the worker process")
  .action(async () => {
    await runWorker()
  })

program.parse()
