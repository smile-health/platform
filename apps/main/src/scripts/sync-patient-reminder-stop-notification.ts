import { db, notificationDb } from "@/common/infrastructure/database/index.js"
import { NOTIFICATION_TYPE } from "@smile-health/lib/rabbitmq/notification.js"
import { sql } from "kysely"

const formatDuration = (startTime: Date, endTime: Date): string => {
  const durationMs = endTime.getTime() - startTime.getTime()
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000)

  return `${hours}h ${minutes}m ${seconds}s`
}

type LatestStoppedPair = {
  patient_id: number
  protocol_id: number
}

const notificationDataUpdateSql = sql<string>`JSON_QUOTE(
  CAST(
    JSON_SET(
      (
        CASE
          WHEN data IS NULL THEN CAST('{}' AS JSON)
          WHEN JSON_TYPE(data) = 'STRING' THEN CAST(JSON_UNQUOTE(data) AS JSON)
          ELSE data
        END
      ),
      '$.stop_notification', 1,
      '$.show_contact_button', CAST('true' AS JSON),
      '$.show_finished_label', CAST('true' AS JSON),
      '$.show_mark_finished_button', CAST('false' AS JSON)
    ) AS CHAR
  )
)`

const getLatestStoppedPairs = async (
  lastPatientId: number,
  lastProtocolId: number,
  batchSize: number
): Promise<LatestStoppedPair[]> => {
  const result = await sql<LatestStoppedPair>`
    SELECT latest.patient_id, latest.protocol_id
    FROM (
      SELECT
        c.patient_id,
        c.protocol_id,
        c.stop_notification,
        ROW_NUMBER() OVER (
          PARTITION BY c.patient_id, c.protocol_id
          ORDER BY c.actual_date DESC, c.created_at DESC, c.id DESC
        ) AS rn
      FROM ws_consumptions c
      WHERE c.deleted_at IS NULL
        AND c.patient_id IS NOT NULL
        AND c.protocol_id IS NOT NULL
        AND c.protocol_id = 1
        AND (
          c.patient_id > ${lastPatientId}
          OR (
            c.patient_id = ${lastPatientId}
            AND c.protocol_id > ${lastProtocolId}
          )
        )
    ) latest
    WHERE latest.rn = 1
      AND latest.stop_notification = 1
    ORDER BY latest.patient_id, latest.protocol_id
    LIMIT ${batchSize}
  `.execute(db)

  return result.rows.map((row) => ({
    patient_id: Number(row.patient_id),
    protocol_id: Number(row.protocol_id),
  }))
}

const countMatchingNotifications = async (
  patientId: number,
  protocolId: number
): Promise<number> => {
  const row = await notificationDb
    .selectFrom("notifications")
    .select((eb) => eb.fn.count<number>("id").as("total"))
    .where("type", "=", NOTIFICATION_TYPE.PATIENT_REMINDER)
    .where("patient_id", "=", patientId)
    .where("protocol_id", "=", protocolId)
    .executeTakeFirst()

  return Number(row?.total ?? 0)
}

const updateMatchingNotifications = async (
  patientId: number,
  protocolId: number
): Promise<number> => {
  const result = await notificationDb
    .updateTable("notifications")
    .set({
      data: notificationDataUpdateSql,
    })
    .where("type", "=", NOTIFICATION_TYPE.PATIENT_REMINDER)
    .where("patient_id", "=", patientId)
    .where("protocol_id", "=", protocolId)
    .executeTakeFirst()

  return Number(result.numUpdatedRows ?? 0)
}

export const syncPatientReminderStopNotification = async (
  batchSize = 1000,
  dryRun = false
) => {
  const startTime = new Date()

  console.info(
    `Patient reminder stop_notification sync started at: ${startTime.toLocaleString()}`
  )
  console.info(`Batch size: ${batchSize}`)
  console.info(`Dry run: ${dryRun}`)

  let batchNumber = 0
  let lastPatientId = 0
  let lastProtocolId = 0
  let totalPairsScanned = 0
  let totalPairsWithoutNotifications = 0
  let totalMatchingNotifications = 0
  let totalUpdatedNotifications = 0

  try {
    while (true) {
      const latestStoppedPairs = await getLatestStoppedPairs(
        lastPatientId,
        lastProtocolId,
        batchSize
      )

      if (latestStoppedPairs.length === 0) {
        break
      }

      batchNumber++
      totalPairsScanned += latestStoppedPairs.length

      const lastPair = latestStoppedPairs[latestStoppedPairs.length - 1]
      lastPatientId = Number(lastPair?.patient_id ?? lastPatientId)
      lastProtocolId = Number(lastPair?.protocol_id ?? lastProtocolId)

      let batchPairsWithoutNotifications = 0
      let batchMatchingNotifications = 0
      let batchUpdatedNotifications = 0

      for (const pair of latestStoppedPairs) {
        const notificationCount = await countMatchingNotifications(
          pair.patient_id,
          pair.protocol_id
        )

        if (notificationCount === 0) {
          batchPairsWithoutNotifications++
          continue
        }

        batchMatchingNotifications += notificationCount

        if (dryRun) {
          batchUpdatedNotifications += notificationCount
          continue
        }

        batchUpdatedNotifications += await updateMatchingNotifications(
          pair.patient_id,
          pair.protocol_id
        )
      }

      totalPairsWithoutNotifications += batchPairsWithoutNotifications
      totalMatchingNotifications += batchMatchingNotifications
      totalUpdatedNotifications += batchUpdatedNotifications

      console.info(
        `Batch ${batchNumber}: ` +
          `${latestStoppedPairs.length} patient/protocol pairs scanned, ` +
          `${batchMatchingNotifications} matching notifications, ` +
          `${batchUpdatedNotifications} ${dryRun ? "to update" : "updated"}, ` +
          `${batchPairsWithoutNotifications} pairs without notifications`
      )
    }

    const endTime = new Date()
    const duration = formatDuration(startTime, endTime)

    console.info(
      `\nPatient reminder stop_notification sync finished at: ${endTime.toLocaleString()}`
    )
    console.info(`Total duration: ${duration}`)
    console.info("Summary:")
    console.info(`  - Patient/protocol pairs scanned: ${totalPairsScanned}`)
    console.info(
      `  - Pairs without notifications: ${totalPairsWithoutNotifications}`
    )
    console.info(
      `  - Matching notifications found: ${totalMatchingNotifications}`
    )
    console.info(
      `  - ${dryRun ? "Would update" : "Updated"} notifications: ${totalUpdatedNotifications}`
    )
    process.exit(0)
  } catch (error) {
    console.error("Patient reminder stop_notification sync failed")
    console.error(error)
    process.exit(1)
  }
}
