import { db } from "@/common/infrastructure/database/index.js"

const formatDuration = (startTime: Date, endTime: Date): string => {
  const durationMs = endTime.getTime() - startTime.getTime()
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000)

  return `${hours}h ${minutes}m ${seconds}s`
}

type SourcePatient = {
  id: number
  stop_notification: number
}

type LatestConsumption = {
  id: number
  patient_id: number | null
  protocol_id: number | null
  stop_notification: number | null
}

export const syncConsumptionStopNotification = async (
  batchSize = 1000,
  dryRun = false
) => {
  const startTime = new Date()

  console.info(
    `Consumption stop_notification sync started at: ${startTime.toLocaleString()}`
  )
  console.info(`Batch size: ${batchSize}`)
  console.info(`Dry run: ${dryRun}`)

  let lastPatientId = 0
  let batchNumber = 0
  let totalPatients = 0
  let totalSyncedRows = 0
  let totalSkippedLockedRows = 0
  let totalMissingProtocolOneConsumptions = 0
  let totalUpdatedRows = 0

  try {
    while (true) {
      const sourcePatients = (await db
        .selectFrom("ws_patients")
        .select(["id", "stop_notification"])
        .where("id", ">", lastPatientId)
        .where("deleted_at", "is", null)
        .where("stop_notification", "is not", null)
        .orderBy("id")
        .limit(batchSize)
        .execute()) as SourcePatient[]

      if (sourcePatients.length === 0) {
        break
      }

      batchNumber++
      totalPatients += sourcePatients.length
      lastPatientId = Number(sourcePatients[sourcePatients.length - 1]?.id ?? 0)

      const patientIdsBatch = sourcePatients.map((patient) =>
        Number(patient.id)
      )
      const sourceStopNotificationByPatientId = new Map<number, number>()

      for (const patient of sourcePatients) {
        sourceStopNotificationByPatientId.set(
          Number(patient.id),
          Number(patient.stop_notification)
        )
      }

      const orderedConsumptions = (await db
        .selectFrom("ws_consumptions")
        .select(["id", "patient_id", "protocol_id", "stop_notification"])
        .where("patient_id", "in", patientIdsBatch)
        .where("protocol_id", "=", 1)
        .where("deleted_at", "is", null)
        .orderBy("patient_id")
        .orderBy("actual_date", "desc")
        .orderBy("created_at", "desc")
        .orderBy("id", "desc")
        .execute()) as LatestConsumption[]

      const latestProtocolOneConsumptionByPatientId = new Map<
        number,
        LatestConsumption
      >()

      for (const consumption of orderedConsumptions) {
        const patientId = Number(consumption.patient_id ?? 0)
        if (
          patientId > 0 &&
          !latestProtocolOneConsumptionByPatientId.has(patientId)
        ) {
          latestProtocolOneConsumptionByPatientId.set(patientId, consumption)
        }
      }

      const idsToSetZero: number[] = []
      const idsToSetOne: number[] = []
      let batchSyncedRows = 0
      let batchSkippedLockedRows = 0
      let batchMissingProtocolOneConsumptions = 0

      for (const patientId of patientIdsBatch) {
        const sourceStopNotification =
          sourceStopNotificationByPatientId.get(patientId)

        if (sourceStopNotification == null) {
          continue
        }

        const targetConsumption =
          latestProtocolOneConsumptionByPatientId.get(patientId)

        if (!targetConsumption) {
          batchMissingProtocolOneConsumptions++
          continue
        }

        if (targetConsumption.stop_notification === 1) {
          batchSkippedLockedRows++
          continue
        }

        if (sourceStopNotification === targetConsumption.stop_notification) {
          batchSyncedRows++
          continue
        }

        if (sourceStopNotification === 1) {
          idsToSetOne.push(Number(targetConsumption.id))
        } else {
          idsToSetZero.push(Number(targetConsumption.id))
        }
      }

      if (!dryRun && idsToSetZero.length > 0) {
        await db
          .updateTable("ws_consumptions")
          .set({ stop_notification: 0 })
          .where("id", "in", idsToSetZero)
          .execute()
      }

      if (!dryRun && idsToSetOne.length > 0) {
        await db
          .updateTable("ws_consumptions")
          .set({ stop_notification: 1 })
          .where("id", "in", idsToSetOne)
          .execute()
      }

      const batchUpdatedRows = idsToSetZero.length + idsToSetOne.length

      totalSyncedRows += batchSyncedRows
      totalSkippedLockedRows += batchSkippedLockedRows
      totalMissingProtocolOneConsumptions += batchMissingProtocolOneConsumptions
      totalUpdatedRows += batchUpdatedRows

      console.info(
        `Batch ${batchNumber}: ` +
          `${sourcePatients.length} patients, ` +
          `${batchSyncedRows} already synced, ` +
          `${batchUpdatedRows} protocol_id = 1 consumptions ${dryRun ? "to update" : "updated"}, ` +
          `${batchSkippedLockedRows} skipped (existing value = 1), ` +
          `${batchMissingProtocolOneConsumptions} without protocol_id = 1 consumption`
      )
    }

    const endTime = new Date()
    const duration = formatDuration(startTime, endTime)

    console.info(
      `\nConsumption stop_notification sync finished at: ${endTime.toLocaleString()}`
    )
    console.info(`Total duration: ${duration}`)
    console.info("Summary:")
    console.info(`  - Source patients processed: ${totalPatients}`)
    console.info(`  - Already synced rows: ${totalSyncedRows}`)
    console.info(
      `  - Missing protocol_id = 1 consumptions: ${totalMissingProtocolOneConsumptions}`
    )
    console.info(
      `  - Skipped rows with (target ws_consumptions.stop_notification = 1): ${totalSkippedLockedRows}`
    )
    console.info(
      `  - ${dryRun ? "Would update" : "Updated"} ws_consumptions rows: ${totalUpdatedRows}`
    )
    const totalAccountedRows =
      totalSyncedRows +
      totalMissingProtocolOneConsumptions +
      totalSkippedLockedRows +
      totalUpdatedRows
    console.info(`  - Total accounted rows: ${totalAccountedRows}`)
    process.exit(0)
  } catch (error) {
    console.error("Consumption stop_notification sync failed")
    console.error(error)
    process.exit(1)
  }
}
