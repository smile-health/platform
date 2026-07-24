import { ORDER_STATUS, ORDER_TYPE } from "@/common/constants/order.js"
import { TRANSACTION_TYPE } from "@/common/constants/transaction.js"
import { db } from "@/common/infrastructure/database/index.js"
import { sleep } from "bun"
import { sql } from "kysely"

const formatDuration = (startTime: Date, endTime: Date): string => {
  const durationMs = endTime.getTime() - startTime.getTime()
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000)

  return `${hours}h ${minutes}m ${seconds}s`
}

type CentralDeliveryCandidate = {
  transaction_id: number
  shipped_at: Date
}

type FulfilledCandidate = {
  transaction_id: number
  fulfilled_at: Date
}

type BatchResult = {
  scannedRows: number
  updatedRows: number
}

export const backfillTransactionActualDate = async (
  batchSize = 1000,
  dryRun = false
) => {
  await sleep(5000)
  const startTime = new Date()

  console.info(
    `Transaction actual_transaction_date backfill started at: ${startTime.toLocaleString()}`
  )
  console.info(`Batch size: ${batchSize}`)
  console.info(`Dry run: ${dryRun}`)

  let totalCentralScanned = 0
  let totalCentralUpdated = 0
  let totalFulfilledScanned = 0
  let totalFulfilledUpdated = 0

  try {
    const centralResult = await processCentralDeliveryBatches(batchSize, dryRun)
    totalCentralScanned = centralResult.scannedRows
    totalCentralUpdated = centralResult.updatedRows

    const fulfilledResult = await processFulfilledBatches(batchSize, dryRun)
    totalFulfilledScanned = fulfilledResult.scannedRows
    totalFulfilledUpdated = fulfilledResult.updatedRows

    const endTime = new Date()
    const duration = formatDuration(startTime, endTime)
    const totalCandidates = totalCentralScanned + totalFulfilledScanned
    const totalUpdated = totalCentralUpdated + totalFulfilledUpdated

    console.info(
      `\nTransaction actual_transaction_date backfill finished at: ${endTime.toLocaleString()}`
    )
    console.info(`Total duration: ${duration}`)
    console.info("Summary:")
    console.info(
      `  - Central delivery candidates: ${totalCentralScanned} (${dryRun ? "would update" : "updated"}: ${totalCentralUpdated})`
    )
    console.info(
      `  - Fulfilled candidates: ${totalFulfilledScanned} (${dryRun ? "would update" : "updated"}: ${totalFulfilledUpdated})`
    )
    console.info(`  - Total candidates: ${totalCandidates}`)
    console.info(
      `  - Total rows ${dryRun ? "to update" : "updated"}: ${totalUpdated}`
    )
    process.exit(0)
  } catch (error) {
    console.error("Transaction actual_transaction_date backfill failed")
    console.error(error)
    process.exit(1)
  }
}

const processCentralDeliveryBatches = async (
  batchSize: number,
  dryRun: boolean
): Promise<BatchResult> => {
  if (dryRun) {
    const scannedRows = await countCentralDeliveryCandidates()

    console.info(
      `Central delivery dry run: ${scannedRows} candidates to update`
    )

    return {
      scannedRows,
      updatedRows: scannedRows,
    }
  }

  let lastTransactionId = 0
  let batchNumber = 0
  let scannedRows = 0
  let updatedRows = 0

  while (true) {
    const candidates = (await db
      .selectFrom("ws_transactions as wt")
      .innerJoin("ws_orders as o", (join) =>
        join.onRef("o.id", "=", "wt.order_id").on("o.deleted_at", "is", null)
      )
      .innerJoin("ws_order_audits as oa", (join) =>
        join
          .onRef("oa.order_id", "=", "wt.order_id")
          .on("oa.deleted_at", "is", null)
      )
      .select(["wt.id as transaction_id", "oa.shipped_at as shipped_at"])
      .where("wt.deleted_at", "is", null)
      .where("wt.actual_transaction_date", "is", null)
      .where("wt.id", ">", lastTransactionId)
      .where("o.order_type_id", "=", ORDER_TYPE.CENTRAL_DISTRIBUTION)
      .where("wt.transaction_type_id", "in", [
        TRANSACTION_TYPE.ISSUES,
        TRANSACTION_TYPE.ADD_STOCK,
      ])
      .where("oa.shipped_at", "is not", null)
      .orderBy("wt.id")
      .limit(batchSize)
      .execute()) as CentralDeliveryCandidate[]

    if (candidates.length === 0) {
      break
    }

    batchNumber++
    scannedRows += candidates.length
    lastTransactionId = Number(
      candidates[candidates.length - 1]?.transaction_id ?? lastTransactionId
    )

    updatedRows += await updateTransactionDates(
      candidates.map((candidate) => ({
        transactionId: candidate.transaction_id,
        actualTransactionDate: candidate.shipped_at,
      }))
    )

    console.info(
      `Central delivery batch ${batchNumber}: ${candidates.length} candidates updated`
    )
  }

  return {
    scannedRows,
    updatedRows,
  }
}

const processFulfilledBatches = async (
  batchSize: number,
  dryRun: boolean
): Promise<BatchResult> => {
  if (dryRun) {
    const scannedRows = await countFulfilledCandidates()

    console.info(`Fulfilled dry run: ${scannedRows} candidates to update`)

    return {
      scannedRows,
      updatedRows: scannedRows,
    }
  }

  let lastTransactionId = 0
  let batchNumber = 0
  let scannedRows = 0
  let updatedRows = 0

  while (true) {
    const candidates = (await db
      .selectFrom("ws_transactions as wt")
      .innerJoin("ws_orders as o", (join) =>
        join.onRef("o.id", "=", "wt.order_id").on("o.deleted_at", "is", null)
      )
      .innerJoin("ws_order_audits as oa", (join) =>
        join
          .onRef("oa.order_id", "=", "wt.order_id")
          .on("oa.deleted_at", "is", null)
      )
      .select(["wt.id as transaction_id", "oa.fulfilled_at as fulfilled_at"])
      .where("wt.deleted_at", "is", null)
      .where("wt.actual_transaction_date", "is", null)
      .where("wt.id", ">", lastTransactionId)
      .where("o.order_status_id", "=", ORDER_STATUS.FULFILLED)
      .where("wt.transaction_type_id", "=", TRANSACTION_TYPE.RECEIPTS)
      .where("oa.fulfilled_at", "is not", null)
      .orderBy("wt.id")
      .limit(batchSize)
      .execute()) as FulfilledCandidate[]

    if (candidates.length === 0) {
      break
    }

    batchNumber++
    scannedRows += candidates.length
    lastTransactionId = Number(
      candidates[candidates.length - 1]?.transaction_id ?? lastTransactionId
    )

    updatedRows += await updateTransactionDates(
      candidates.map((candidate) => ({
        transactionId: candidate.transaction_id,
        actualTransactionDate: candidate.fulfilled_at,
      }))
    )

    console.info(
      `Fulfilled batch ${batchNumber}: ${candidates.length} candidates updated`
    )
  }

  return {
    scannedRows,
    updatedRows,
  }
}

const countCentralDeliveryCandidates = async () => {
  const result = await db
    .selectFrom("ws_transactions as wt")
    .innerJoin("ws_orders as o", (join) =>
      join.onRef("o.id", "=", "wt.order_id").on("o.deleted_at", "is", null)
    )
    .innerJoin("ws_order_audits as oa", (join) =>
      join
        .onRef("oa.order_id", "=", "wt.order_id")
        .on("oa.deleted_at", "is", null)
    )
    .select(sql<number>`COUNT(*)`.as("count"))
    .where("wt.deleted_at", "is", null)
    .where("wt.actual_transaction_date", "is", null)
    .where("o.order_type_id", "=", ORDER_TYPE.CENTRAL_DISTRIBUTION)
    .where("wt.transaction_type_id", "in", [
      TRANSACTION_TYPE.ISSUES,
      TRANSACTION_TYPE.ADD_STOCK,
    ])
    .where("oa.shipped_at", "is not", null)
    .executeTakeFirst()

  return Number(result?.count ?? 0)
}

const countFulfilledCandidates = async () => {
  const result = await db
    .selectFrom("ws_transactions as wt")
    .innerJoin("ws_orders as o", (join) =>
      join.onRef("o.id", "=", "wt.order_id").on("o.deleted_at", "is", null)
    )
    .innerJoin("ws_order_audits as oa", (join) =>
      join
        .onRef("oa.order_id", "=", "wt.order_id")
        .on("oa.deleted_at", "is", null)
    )
    .select(sql<number>`COUNT(*)`.as("count"))
    .where("wt.deleted_at", "is", null)
    .where("wt.actual_transaction_date", "is", null)
    .where("o.order_status_id", "=", ORDER_STATUS.FULFILLED)
    .where("wt.transaction_type_id", "=", TRANSACTION_TYPE.RECEIPTS)
    .where("oa.fulfilled_at", "is not", null)
    .executeTakeFirst()

  return Number(result?.count ?? 0)
}

const updateTransactionDates = async (
  rows: Array<{ transactionId: number; actualTransactionDate: Date }>
) => {
  if (rows.length === 0) {
    return 0
  }

  const caseClauses = rows.map(
    ({ transactionId, actualTransactionDate }) =>
      sql`WHEN ${sql.ref("id")} = ${transactionId} THEN ${actualTransactionDate}`
  )
  const ids = rows.map(({ transactionId }) => transactionId)

  const result = await db
    .updateTable("ws_transactions")
    .set({
      actual_transaction_date: sql<Date>`CASE ${sql.join(caseClauses, sql.raw(" "))} END`,
    })
    .where("id", "in", ids)
    .where("actual_transaction_date", "is", null)
    .executeTakeFirst()

  return Number(result.numUpdatedRows ?? rows.length)
}
