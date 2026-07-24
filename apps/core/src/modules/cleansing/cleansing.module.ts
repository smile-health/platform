import { Context } from "hono"
import {
  SwitchTransactionEntityRequest,
  CleanseUnreceivedQtyRequest,
  CleanseTransactionsRequest,
  BulkCleanseTransactionsRequest,
  CleanseTransactionIsNotVendor,
  CleanseStockOpnameRequest,
  CleanseAddAndRemoveStockRequest,
  CleanseAddAndRemoveStockBulkRequest,
  CleaningUpUnallocatedInventoryRequest,
} from "./cleansing.schema"
import { CleansingRepository } from "./cleansing.repository"
import { randomUUID } from "crypto"
import { v7 as uuidv7 } from "uuid"
import { Publisher } from "@smile-health/lib/rabbitmq/publisher.js"

interface Transaction {
  stock_id: number
  transaction_id: number
  created_at: string
  change_qty: number
  opening_qty: number
  stock_qty: number
  uuid: string
  entity_id: number
  batch_code: string | null
  device_type: number
  created_by: number
  updated_by: number
  activity_id: number
  entity_activity_id?: number
}

export class CleansingModule {
  constructor(
    private readonly repo: CleansingRepository,
    private readonly publisher?: Publisher
  ) {}

  async switchTransactionEntity(
    c: Context,
    body: SwitchTransactionEntityRequest
  ) {
    const entityWorkspacesResult: any[] = []
    const usersResult: any[] = []
    const skippedWorkspaces: any[] = []
    const processedOverlapWorkspaces: any[] = []
    let allEntitiesCanBeDeleted = true

    // Collect all entity IDs from the request
    const entityIdsFrom = body.map((item) => item.global_entity_id_from)
    const entityIdsTo = body.map((item) => item.global_entity_id_to)
    const allEntityIds = [...entityIdsFrom, ...entityIdsTo]

    // Step 1: Get all entity workspaces with transaction count for both FROM and TO entities
    const allEntityWorkspaces =
      await this.repo.getEntityWorkspacesWithTransactionCount(c, allEntityIds)

    // Step 2: Get all user workspaces for both FROM and TO entities
    const allUserWorkspaces = await this.repo.getUserWorkspacesByEntityIds(
      c,
      allEntityIds
    )

    // Process each switch item
    for (const item of body) {
      const { global_entity_id_from, global_entity_id_to } = item

      console.log(
        `[switchTransactionEntity] Processing: FROM ${global_entity_id_from} TO ${global_entity_id_to}`
      )

      // Get workspaces for FROM entity
      const workspacesFrom = allEntityWorkspaces.filter(
        (w) => w.global_id === global_entity_id_from
      )

      // Get workspaces for TO entity
      const workspacesTo = allEntityWorkspaces.filter(
        (w) => w.global_id === global_entity_id_to
      )

      // Create maps for quick lookup
      const workspacesFromMap = new Map(
        workspacesFrom.map((w) => [w.program_id, w])
      )
      const workspacesToMap = new Map(
        workspacesTo.map((w) => [w.program_id, w])
      )

      // Step 3: Check for overlapping workspaces and handle overlap logic
      for (const workspaceFrom of workspacesFrom) {
        const hasOverlap = workspacesToMap.has(workspaceFrom.program_id)

        if (hasOverlap) {
          const workspaceTo = workspacesToMap.get(workspaceFrom.program_id)!

          console.log(
            `[switchTransactionEntity] OVERLAP detected for program_id ${workspaceFrom.program_id}`
          )
          console.log(
            `  FROM workspace: id=${workspaceFrom.id}, transactions=${workspaceFrom.transaction_count}`
          )
          console.log(
            `  TO workspace: id=${workspaceTo.id}, transactions=${workspaceTo.transaction_count}`
          )

          // Case A: Transaction count TO = 0 and FROM > 0 - Swap workspaces
          if (
            workspaceTo.transaction_count === 0 &&
            workspaceFrom.transaction_count > 0
          ) {
            console.log(
              `[switchTransactionEntity] CASE A - Swapping workspaces (TO has 0 tx, FROM has ${workspaceFrom.transaction_count} tx)`
            )

            try {
              // Step 1: Move FROM workspace to TO entity (workspace yang ada transaksi tetap aktif)
              await this.repo.updateEntityWorkspaceEntity(
                c,
                workspaceFrom.id, // Workspace FROM (ada transaksi)
                global_entity_id_to // Pindah ke TO entity - TETAP AKTIF!
              )

              // Step 2: Move TO workspace to FROM entity (workspace yang 0 transaksi)
              await this.repo.updateEntityWorkspaceEntity(
                c,
                workspaceTo.id, // Workspace TO (0 transaksi)
                global_entity_id_from // Pindah ke FROM entity
              )

              // Step 3: Soft delete workspace TO (yang 0 transaksi)
              await this.repo.softDeleteEntityWorkspace(c, workspaceTo.id)

              console.log(
                `[switchTransactionEntity] Workspaces swapped - workspaceTo (${workspaceTo.id}) soft deleted`
              )

              // Step 4: Soft delete related data HANYA untuk workspaceTo
              // ⚠️ JANGAN soft delete data workspaceFrom karena masih aktif!
              const [
                customerVendorsByCustomer,
                customerVendorsByVendor,
                entityActivities,
                entityMaterialActivities,
                customerVendorActivities,
              ] = await Promise.all([
                // ✅ HANYA ambil data dari workspaceTo (yang di-soft delete)
                this.repo.getCustomerVendorsByCustomerId(c, workspaceTo.id),
                this.repo.getCustomerVendorsByVendorId(c, workspaceTo.id),
                this.repo.getEntityActivitiesByEntityId(c, workspaceTo.id),
                this.repo.getEntityMaterialActivitiesByEntityId(
                  c,
                  workspaceTo.id
                ),
                this.repo.getCustomerVendorActivitiesByEntityId(
                  c,
                  workspaceTo.id
                ),
              ])

              const customerVendorIds = [
                ...customerVendorsByCustomer.map((cv) => cv.id),
                ...customerVendorsByVendor.map((cv) => cv.id),
              ]
              const entityActivityIds = entityActivities.map((ea) => ea.id)
              const entityMaterialActivityIds = entityMaterialActivities.map(
                (ema) => ema.id
              )
              const customerVendorActivityIds = customerVendorActivities.map(
                (cv) => cv.id
              )

              // Soft delete hanya jika ada data
              if (customerVendorIds.length > 0) {
                await this.repo.softDeleteCustomerVendors(c, customerVendorIds)
              }
              if (entityActivityIds.length > 0) {
                await this.repo.softDeleteEntityActivities(c, entityActivityIds)
              }
              if (entityMaterialActivityIds.length > 0) {
                await this.repo.softDeleteEntityMaterialActivities(
                  c,
                  entityMaterialActivityIds
                )
              }
              if (customerVendorActivityIds.length > 0) {
                await this.repo.softDeleteCustomerVendorActivities(
                  c,
                  customerVendorActivityIds
                )
              }

              console.log(
                `[switchTransactionEntity] Soft deleted workspaceTo (${workspaceTo.id}) related data: ${customerVendorIds.length} customer_vendors, ${entityActivityIds.length} entity_activities, ${entityMaterialActivityIds.length} entity_material_activities, ${customerVendorActivityIds.length} customer_vendor_activities`
              )

              console.log(
                `[switchTransactionEntity] WorkspaceFrom (${workspaceFrom.id}) kept active with its data (${workspaceFrom.transaction_count} transactions)`
              )

              processedOverlapWorkspaces.push({
                action: "SWAPPED_AND_DELETED",
                workspace_from_id: workspaceFrom.id,
                workspace_to_id: workspaceTo.id,
                program_id: workspaceFrom.program_id,
                from_entity_id: global_entity_id_from,
                to_entity_id: global_entity_id_to,
                deleted_workspace_to: true,
                workspace_from_kept_active: true, // Ditambahkan untuk clarity
                deleted_workspace_to_data: {
                  customer_vendors: customerVendorIds.length,
                  entity_activities: entityActivityIds.length,
                  entity_material_activities: entityMaterialActivityIds.length,
                  customer_vendor_activities: customerVendorActivityIds.length,
                },
              })

              entityWorkspacesResult.push({
                ...workspaceFrom,
                action: "SWAPPED",
                kept_active: true, // workspaceFrom masih aktif
              })
            } catch (error) {
              console.error(
                `[switchTransactionEntity] Error swapping workspaces:`,
                error
              )
              allEntitiesCanBeDeleted = false
            }
          }
          // Case B: Transaction count FROM = 0 (regardless of TO count) - Delete FROM workspace
          // Case B: Transaction count FROM = 0 - Delete FROM workspace
          else if (workspaceFrom.transaction_count === 0) {
            console.log(
              `[switchTransactionEntity] CASE B - Soft deleting FROM workspace (0 transactions, TO has ${workspaceTo.transaction_count} tx)`
            )

            try {
              // Step 1: Soft delete FROM workspace first
              await this.repo.softDeleteEntityWorkspace(c, workspaceFrom.id)

              console.log(
                `[switchTransactionEntity] Workspace deleted - now soft deleting related data for workspace ${workspaceFrom.id}`
              )

              // Step 2: Soft delete related data
              // ⚠️ PERBAIKAN: Gunakan workspaceFrom.id, BUKAN global_entity_id_from!
              const [
                customerVendorsByCustomer,
                customerVendorsByVendor,
                entityActivities,
                entityMaterialActivities,
                customerVendorActivities,
              ] = await Promise.all([
                // ✅ BENAR: Gunakan workspaceFrom.id (entity_workspace.id)
                this.repo.getCustomerVendorsByCustomerId(c, workspaceFrom.id),
                this.repo.getCustomerVendorsByVendorId(c, workspaceFrom.id),
                this.repo.getEntityActivitiesByEntityId(c, workspaceFrom.id),
                this.repo.getEntityMaterialActivitiesByEntityId(
                  c,
                  workspaceFrom.id
                ),
                this.repo.getCustomerVendorActivitiesByEntityId(
                  c,
                  workspaceFrom.id
                ),
              ])

              const customerVendorIds = [
                ...customerVendorsByCustomer.map((cv) => cv.id),
                ...customerVendorsByVendor.map((cv) => cv.id),
              ]
              const entityActivityIds = entityActivities.map((ea) => ea.id)
              const entityMaterialActivityIds = entityMaterialActivities.map(
                (ema) => ema.id
              )
              const customerVendorActivityIds = customerVendorActivities.map(
                (cv) => cv.id
              )

              // Soft delete hanya jika ada data
              if (customerVendorIds.length > 0) {
                const { affectedRows } =
                  await this.repo.softDeleteCustomerVendors(
                    c,
                    customerVendorIds
                  )
                console.log(
                  `[switchTransactionEntity] Soft deleted ${affectedRows} customer_vendors`
                )
              }
              if (entityActivityIds.length > 0) {
                const { affectedRows } =
                  await this.repo.softDeleteEntityActivities(
                    c,
                    entityActivityIds
                  )
                console.log(
                  `[switchTransactionEntity] Soft deleted ${affectedRows} entity_activities`
                )
              }
              if (entityMaterialActivityIds.length > 0) {
                const { affectedRows } =
                  await this.repo.softDeleteEntityMaterialActivities(
                    c,
                    entityMaterialActivityIds
                  )
              }
              if (customerVendorActivityIds.length > 0) {
                const { affectedRows } =
                  await this.repo.softDeleteCustomerVendorActivities(
                    c,
                    customerVendorActivityIds
                  )
              }

              console.log(
                `[switchTransactionEntity] Soft deleted related data for workspace ${workspaceFrom.id}: ${customerVendorIds.length} customer_vendors, ${entityActivityIds.length} entity_activities, ${entityMaterialActivityIds.length} entity_material_activities, ${customerVendorActivityIds.length} customer_vendor_activities`
              )

              processedOverlapWorkspaces.push({
                action: "DELETED",
                workspace_id: workspaceFrom.id,
                program_id: workspaceFrom.program_id,
                entity_id: global_entity_id_from,
                transaction_count_from: workspaceFrom.transaction_count,
                transaction_count_to: workspaceTo.transaction_count,
                deleted_customer_vendors: customerVendorIds.length,
                deleted_entity_activities: entityActivityIds.length,
                deleted_entity_material_activities:
                  entityMaterialActivityIds.length,
                deleted_customer_vendor_activities:
                  customerVendorActivityIds.length,
              })
            } catch (error) {
              console.error(
                `[switchTransactionEntity] Error in case B/C:`,
                error
              )
              allEntitiesCanBeDeleted = false
            }
          }
          // TODO Case: Both have transactions
          else {
            console.log(
              `[switchTransactionEntity] TODO - Both workspaces have transactions (FROM: ${workspaceFrom.transaction_count}, TO: ${workspaceTo.transaction_count})`
            )
            allEntitiesCanBeDeleted = false
            skippedWorkspaces.push({
              workspace_id: workspaceFrom.id,
              program_id: workspaceFrom.program_id,
              entity_id_from: global_entity_id_from,
              entity_id_to: global_entity_id_to,
              transaction_count_from: workspaceFrom.transaction_count,
              transaction_count_to: workspaceTo.transaction_count,
              reason: "both_have_transactions_TODO",
            })
          }
        } else {
          // No overlap - proceed with update
          console.log(
            `[switchTransactionEntity] UPDATE - Moving workspace ${workspaceFrom.id} (program_id: ${workspaceFrom.program_id}) to entity ${global_entity_id_to}`
          )

          await this.repo.updateEntityWorkspace(
            c,
            workspaceFrom.id,
            global_entity_id_to
          )

          entityWorkspacesResult.push({
            ...workspaceFrom,
            action: "MOVED",
            updated_to_entity_id: global_entity_id_to,
          })
        }
      }

      // Case D: Update users (always happens)
      const usersFrom = await this.repo.getUsers(c, global_entity_id_from)

      if (usersFrom.length > 0) {
        console.log(
          `[switchTransactionEntity] Updating ${usersFrom.length} users`
        )

        for (const user of usersFrom) {
          await this.repo.updateUserEntity(c, user.id, global_entity_id_to)
        }

        usersResult.push(...usersFrom)
      }

      // Case E: Soft delete the FROM entity only if no conflicting overlaps exist
      if (allEntitiesCanBeDeleted) {
        console.log(
          `[switchTransactionEntity] Soft deleting entity ${global_entity_id_from}`
        )
        await this.repo.softDeleteEntity(c, global_entity_id_from)
      } else {
        console.log(
          `[switchTransactionEntity] SKIP deleting entity ${global_entity_id_from} - has unresolved overlaps with transactions`
        )
      }
    }

    return {
      entityWorkspaces: entityWorkspacesResult,
      users: usersResult,
      processedOverlaps: processedOverlapWorkspaces,
      skipped: skippedWorkspaces,
      summary: {
        total_workspaces_moved: entityWorkspacesResult.filter(
          (w) => w.action === "MOVED"
        ).length,
        total_workspaces_swapped: entityWorkspacesResult.filter(
          (w) => w.action === "SWAPPED"
        ).length,
        total_users_updated: usersResult.length,
        total_workspaces_skipped: skippedWorkspaces.length,
        entities_soft_deleted: allEntitiesCanBeDeleted ? body.length : 0,
      },
    }
  }

  async mergeTransactionEntities(
    c: Context,
    body: SwitchTransactionEntityRequest
  ) {
    let mergedEntitiesResult: any[] = []
    let mergedUsersResult: any[] = []
    const entityIds = [
      ...new Set(body.map((item) => item.global_entity_id_from)),
      ...new Set(body.map((item) => item.global_entity_id_to)),
    ]

    const entityWorkspaces = await this.repo.getWorkspacesByEntityIds(
      c,
      entityIds
    )

    for (const item of body) {
      const workspacesEntityFrom = entityWorkspaces.filter(
        (workspace) => workspace.entity_id === item.global_entity_id_from
      )
      const workspacesEntityTo = entityWorkspaces.filter(
        (workspace) => workspace.entity_id === item.global_entity_id_to
      )
      console.log("Workspaces From:", workspacesEntityFrom)
      console.log("Workspaces To:", workspacesEntityTo)

      for (const item of body) {
        const workspacesEntityFrom = entityWorkspaces.filter(
          (workspace) => workspace.entity_id === item.global_entity_id_from
        )
        const workspacesEntityTo = entityWorkspaces.filter(
          (workspace) => workspace.entity_id === item.global_entity_id_to
        )

        for (const workspace of workspacesEntityFrom) {
          const programExists = workspacesEntityTo.find(
            (w) => w.workspace_id === workspace.workspace_id
          )

          if (!programExists) {
            console.log(
              "Program does not exist >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>:",
              workspace
            )
            // Tidak ada program yang sama → pindahkan workspace ke entity_to
            // await this.repo.updateEntityWorkspace(
            //   c,
            //   workspace.id,
            //   item.global_entity_id_to
            // )
            mergedEntitiesResult.push(workspace)
          } else {
            // Ada program yang sama → merge stocks
            console.log("Program exists:", programExists)

            const [stocksFrom, stocksTo, transactionFrom] = await Promise.all([
              this.repo.getStocksByEntityId(c, workspace.id),
              this.repo.getStocksByEntityId(c, programExists.id),
              this.repo.getTransactionsByEntityId(c, workspace.id),
            ])

            for (const stock of stocksFrom) {
              const matchingStock = stocksTo.find(
                (s) =>
                  s.material_id === stock.material_id &&
                  s.batch_code === stock.batch_code &&
                  s.activity_id === stock.activity_id &&
                  s.manufacture_id === stock.manufacture_id
              )

              // stock batch code nya tidak null
              if (stock.batch_code != null) {
                if (matchingStock) {
                  const sumChangeQty = transactionFrom
                    .filter((t) => t.stock_id === stock.id)
                    .reduce((sum, t) => sum + (t.change_qty ?? 0), 0)
                  const sumOpeningQty = transactionFrom
                    .filter((t) => t.stock_id === stock.id)
                    .reduce((sum, t) => sum + (t.opening_qty ?? 0), 0)

                  const resultQty = sumChangeQty + sumOpeningQty

                  // memindahkan stocks & transaksi kalau qty 0
                  if (matchingStock.qty === 0) {
                    const sumChangeQty = transactionFrom
                      .filter((t) => t.stock_id === stock.id)
                      .reduce((sum, t) => sum + (t.change_qty ?? 0), 0)
                    const sumOpeningQty = transactionFrom
                      .filter((t) => t.stock_id === stock.id)
                      .reduce((sum, t) => sum + (t.opening_qty ?? 0), 0)

                    const resultQty = sumChangeQty + sumOpeningQty

                    if (resultQty === stock.qty) {
                      const relatedTransactions = transactionFrom.filter(
                        (t) => t.stock_id === stock.id
                      )

                      const orderIds = relatedTransactions
                        .map((t) => t.order_id)
                        .filter((order_id) => order_id !== null) as number[]
                      const relatedOrders = await this.repo.getOrdersByIds(
                        c,
                        orderIds
                      )

                      for (const transaction of relatedTransactions) {
                        const order = relatedOrders.find(
                          (o) => o.id === transaction.order_id
                        )
                        console.log("Entity Id From:", workspace.id)
                        console.log("Related Order:", order)
                        console.log("orderIds:", orderIds)
                        console.log("Transaction:", transaction)
                      }
                    }
                  }
                } else {
                  // dapatkan data transaksi terkait stock & entitasnya
                  const sumChangeQty = transactionFrom
                    .filter((t) => t.stock_id === stock.id)
                    .reduce((sum, t) => sum + (t.change_qty ?? 0), 0)
                  const sumOpeningQty = transactionFrom
                    .filter((t) => t.stock_id === stock.id)
                    .reduce((sum, t) => sum + (t.opening_qty ?? 0), 0)

                  const resultQty = sumChangeQty + sumOpeningQty

                  if (resultQty === stock.qty) {
                    const relatedTransactions = transactionFrom.filter(
                      (t) => t.stock_id === stock.id
                    )

                    const orderIds = relatedTransactions
                      .map((t) => t.order_id)
                      .filter((order_id) => order_id !== null) as number[]
                    const relatedOrders = await this.repo.getOrdersByIds(
                      c,
                      orderIds
                    )

                    for (const transaction of relatedTransactions) {
                      const order = relatedOrders.find(
                        (o) => o.id === transaction.order_id
                      )
                      console.log("Entity Id From:", workspace.id)
                      console.log("Related Order:", order)
                      console.log("orderIds:", orderIds)
                      console.log("Transaction:", transaction)
                    }

                    // Pindahkan stock ke entity_to
                    // await this.repo.updateStockEntity(c, stock.id, programExists.id)
                  }
                }
              } else {
              }
            }
          }
        }

        // Update users & soft delete entity_from — cukup sekali per item
        const users = await this.repo.getUsers(c, item.global_entity_id_from)

        if (users.length > 0) {
          // await Promise.all(
          //   users.map((user) =>
          //     this.repo.updateUserEntity(c, user.id, item.global_entity_id_to)
          //   )
          // )
          mergedUsersResult = mergedUsersResult.concat(users)
        }

        // await this.repo.softDeleteEntity(c, item.global_entity_id_from)
      }
    }

    return {
      mergedEntities: mergedEntitiesResult,
      mergedUsers: mergedUsersResult,
    }
  }

  async cleanseUnreceivedQty(c: Context, body: CleanseUnreceivedQtyRequest) {
    const batchSize = body.batch_size || 1000
    const limit = body.limit
    const maxEdit = body.max_edit
    const jobId = randomUUID()

    // Publish immediately without counting - let worker handle the count
    const message = {
      headers: c.req.header(),
      payload: {
        job_id: jobId,
        batch_size: batchSize,
        limit: limit,
        max_edit: maxEdit,
      },
    }

    if (this.publisher) {
      await this.publisher.publish("cleansing.unreceived_qty.process", message)
    }

    return {
      job_id: jobId,
      message: "Cleansing job started. Processing in background.",
    }
  }

  async bulkCleanseTransactions(
    c: Context,
    body: BulkCleanseTransactionsRequest
  ) {
    if (this.publisher) {
      await this.publisher.publish("cleansing.transactions.process", {
        headers: c.req.header(),
        payload: body,
      })
    }

    return {
      message: "Cleansing job started. Processing in background.",
    }
  }

  async cleanseTransactions(c: Context, body: CleanseTransactionsRequest) {
    const { stok_id, entity_id } = body
    const transactionsData = await this.repo.getTransactionsForCleansing(
      c,
      stok_id,
      entity_id
    )

    // Group transactions by stock_id
    const txByStock: Record<number, Transaction[]> = {}
    for (const tx of transactionsData) {
      if (!txByStock[tx.stock_id]) {
        txByStock[tx.stock_id] = []
      }
      txByStock[tx.stock_id]!.push(tx)
    }

    const updatesToPerform: Array<{ transaction_id: number; uuid: string }> = []
    const transactionsCreated: Array<{
      stock_id: number
      type: string
      qty: number
    }> = []

    for (const [stock_id, transactions] of Object.entries(txByStock)) {
      const N = transactions.length
      if (N === 0) continue

      // Convert to numbers once for consistency
      const txList = transactions.map((tx) => ({
        ...tx,
        opening_qty: Number(tx.opening_qty),
        change_qty: Number(tx.change_qty),
        stock_qty: Number(tx.stock_qty),
      }))

      let resultSequence = this.findValidSequenceOptimized(txList)
      console.log(resultSequence)

      // Fallback if no matching sequence found
      if (!resultSequence) {
        console.warn(
          `[cleanseTransactions] No valid graph sequence found for stock_id ${stock_id}. Using created_at + ID fallback.`
        )
        resultSequence = this.fallbackSort(txList)
      }

      if (resultSequence) {
        // Check if current UUIDs are already in correct order
        let needsUpdate = false

        for (let i = 0; i < resultSequence.length - 1; i++) {
          const currentUuid = resultSequence[i].uuid
          const nextUuid = resultSequence[i + 1].uuid

          // UUIDs should be in ascending order
          if (currentUuid >= nextUuid) {
            needsUpdate = true
            break
          }
        }

        // Only update if UUIDs are out of order
        if (needsUpdate) {
          // Get base timestamp from the earliest transaction
          const sortedByTime = [...resultSequence].sort((a, b) => {
            return (
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
            )
          })

          const baseTimestamp = new Date(sortedByTime[0].created_at).getTime()

          for (let i = 0; i < resultSequence.length; i++) {
            const trx = resultSequence[i]
            // Use base timestamp + index offset (1 second apart) to ensure proper ordering
            const timestampWithOffset = baseTimestamp + i * 1000

            updatesToPerform.push({
              transaction_id: trx.transaction_id,
              uuid: uuidv7({ msecs: timestampWithOffset }),
            })
          }
        } else {
          console.log(
            `[cleanseTransactions] Stock ${stock_id} UUIDs already in correct order, skipping update`
          )
        }
      }

      // Calculate expected stock from the last transaction in sequence
      const currentStockQty = txList[0]?.stock_qty || 0
      if (
        resultSequence &&
        resultSequence.length > 0 &&
        currentStockQty === 0
      ) {
        const lastTx = resultSequence[resultSequence.length - 1]

        const expectedStock = lastTx.opening_qty + lastTx.change_qty

        // If stock_qty is 0 but transactions indicate stock should exist
        if (currentStockQty === 0 && expectedStock > 0) {
          console.log(
            `[cleanseTransactions] Stock ${stock_id} is 0 but expected is ${expectedStock}. Creating addStock transaction.`
          )

          // Get base timestamp from lastTx
          const baseTimestamp = lastTx?.created_at
            ? new Date(lastTx.created_at)
            : new Date()

          // Create Add Stock transaction (type 7) - add 2 seconds
          const addStockTimestamp = new Date(baseTimestamp.getTime() + 2000)

          const firstTx = resultSequence[0]
          const addStockTransaction = await this.repo.insertTransaction(c, {
            activity_id: firstTx?.activity_id!,
            entity_id: firstTx?.entity_id!,
            stock_id: Number(stock_id),
            batch_code: firstTx?.batch_code!,
            device_type: 1,
            created_by: firstTx?.created_by!,
            updated_by: firstTx?.updated_by!,
            opening_qty: 0,
            change_qty: 1,
            transaction_type_id: 7,
            entity_activity_id: firstTx?.entity_activity_id,
            uuid: uuidv7(),
            transaction_reason_id: 10,
            created_at: addStockTimestamp,
          })
          await this.repo.insertOtherReason(c, {
            source_id: addStockTransaction.insertId as number,
            source_type: "transaction",
            content: "Data Cleansing",
          })

          transactionsCreated.push({
            stock_id: Number(stock_id),
            type: "addStock",
            qty: 1,
          })
        }

        if (currentStockQty === 0 && expectedStock > 0) {
          // Get base timestamp from lastTx
          const baseTimestamp = lastTx?.created_at
            ? new Date(lastTx.created_at)
            : new Date()

          // Create Remove Stock transaction (type 8) - add 20 seconds
          const removeStockTimestamp = new Date(baseTimestamp.getTime() + 20000)

          const removeStockTx = await this.repo.insertTransaction(c, {
            activity_id: lastTx?.activity_id!,
            entity_id: lastTx?.entity_id!,
            stock_id: Number(stock_id),
            batch_code: lastTx?.batch_code!,
            device_type: 1,
            created_by: lastTx?.created_by!,
            updated_by: lastTx?.updated_by!,
            opening_qty: 1,
            change_qty: -1,
            transaction_type_id: 8,
            entity_activity_id: lastTx?.entity_activity_id,
            uuid: uuidv7(),
            transaction_reason_id: 12,
            created_at: removeStockTimestamp,
          })

          await this.repo.insertOtherReason(c, {
            source_id: removeStockTx.insertId as number,
            source_type: "transaction",
            content: "Data Cleansing",
          })

          transactionsCreated.push({
            stock_id: Number(stock_id),
            type: "removeStock",
            qty: 1,
          })
        }
      }

      const { affectedRows } = await this.repo.updateTransactionsUuidInBatch(
        c,
        updatesToPerform
      )
    }

    return {
      message: "Transactions cleansed successfully",
      stocks_processed: Object.keys(txByStock).length,
      transactions_processed: updatesToPerform.length,
      correction_transactions: transactionsCreated,
    }
  }

  /**
   * OPTIMIZED: Try to build sequence using greedy approach first
   * Falls back to DFS only if greedy fails
   */
  private findValidSequenceOptimized(
    transactions: Transaction[]
  ): Transaction[] | null {
    const N = transactions.length

    // Try greedy approach first (O(n²) instead of exponential)
    const greedyResult = this.tryGreedySequence(transactions)
    if (greedyResult && greedyResult.length === N) {
      return greedyResult
    }

    // If greedy fails, try DFS with timeout protection
    return this.tryDFSSequence(transactions, 5000) // 5 second timeout
  }

  /**
   * Greedy approach: Start from lowest opening_qty and chain forward
   */
  private tryGreedySequence(transactions: Transaction[]): Transaction[] | null {
    const N = transactions.length
    const used = new Set<number>()
    const sequence: Transaction[] = []

    // Find starting transaction (lowest opening_qty, tie-break by created_at, then ID)
    let startIdx = this.findBestStartingPoint(transactions)

    let currentIdx = startIdx

    while (sequence.length < N) {
      if (used.has(currentIdx) || currentIdx < 0 || currentIdx >= N) break

      used.add(currentIdx)
      sequence.push(transactions[currentIdx])

      if (sequence.length === N) break

      const expectedOpening =
        transactions[currentIdx].opening_qty +
        transactions[currentIdx].change_qty

      // Find next transaction with matching opening_qty
      const candidates: number[] = []
      for (let i = 0; i < N; i++) {
        if (!used.has(i) && transactions[i].opening_qty === expectedOpening) {
          candidates.push(i)
        }
      }

      if (candidates.length === 0) break

      // IMPROVED: Tie-breaker with 3 levels
      currentIdx = this.selectBestCandidate(transactions, candidates)
    }

    return sequence.length === N ? sequence : null
  }

  /**
   * Find best starting point
   */
  private findBestStartingPoint(transactions: Transaction[]): number {
    const candidates: Array<{ idx: number; hasNoPredecessor: boolean }> = []

    for (let i = 0; i < transactions.length; i++) {
      let hasNoPredecessor = true
      for (let j = 0; j < transactions.length; j++) {
        if (i !== j) {
          const expectedNext =
            transactions[j].opening_qty + transactions[j].change_qty
          if (expectedNext === transactions[i].opening_qty) {
            hasNoPredecessor = false
            break
          }
        }
      }
      candidates.push({ idx: i, hasNoPredecessor })
    }

    // Sort candidates: prefer no predecessor, then lowest opening_qty, then earliest created_at, then lowest ID
    candidates.sort((a, b) => {
      const txA = transactions[a.idx]
      const txB = transactions[b.idx]

      // 1. Prefer no predecessor
      if (a.hasNoPredecessor !== b.hasNoPredecessor) {
        return a.hasNoPredecessor ? -1 : 1
      }

      // 2. Prefer lowest opening_qty (likely the true start)
      if (txA.opening_qty !== txB.opening_qty) {
        return txA.opening_qty - txB.opening_qty
      }

      // 3. Prefer earliest created_at
      const timeA = new Date(txA.created_at).getTime()
      const timeB = new Date(txB.created_at).getTime()
      if (timeA !== timeB) {
        return timeA - timeB
      }

      // 4. Prefer lowest transaction_id
      return txA.transaction_id - txB.transaction_id
    })

    return candidates[0].idx
  }

  /**
   * Select best candidate from multiple options with 3-level tie-breaker
   */
  private selectBestCandidate(
    transactions: Transaction[],
    candidateIndices: number[]
  ): number {
    if (candidateIndices.length === 1) return candidateIndices[0]

    const sorted = [...candidateIndices].sort((a, b) => {
      const txA = transactions[a]
      const txB = transactions[b]

      // 1. Prefer earliest created_at
      const timeA = new Date(txA.created_at).getTime()
      const timeB = new Date(txB.created_at).getTime()
      if (timeA !== timeB) {
        return timeA - timeB
      }

      // 2. Prefer lowest transaction_id (original insertion order)
      return txA.transaction_id - txB.transaction_id
    })

    return sorted[0]
  }

  /**
   * DFS with timeout protection (fallback for complex cases)
   */
  private tryDFSSequence(
    transactions: Transaction[],
    timeoutMs: number
  ): Transaction[] | null {
    const N = transactions.length
    let resultSequence: Transaction[] | null = null
    const startTime = Date.now()

    const performDFS = (currPath: Transaction[], used: boolean[]): boolean => {
      // Timeout check
      if (Date.now() - startTime > timeoutMs) {
        console.warn("[DFS] Timeout reached, aborting")
        return true // Signal to stop
      }

      if (resultSequence) return true

      if (currPath.length === N) {
        resultSequence = [...currPath]
        return true
      }

      const lastTrx = currPath[currPath.length - 1]
      const expectedOpening = lastTrx.opening_qty + lastTrx.change_qty

      const candidates: number[] = []
      for (let i = 0; i < N; i++) {
        if (!used[i] && transactions[i].opening_qty === expectedOpening) {
          candidates.push(i)
        }
      }

      // IMPROVED: Tie-breaker with transaction_id
      const sortedCandidates = this.selectBestCandidate(
        transactions,
        candidates
      )

      for (const idx of candidates) {
        used[idx] = true
        currPath.push(transactions[idx])

        const shouldStop = performDFS(currPath, used)

        currPath.pop()
        used[idx] = false

        if (shouldStop) return true
      }

      return false
    }

    // Start from best starting point
    const startIdx = this.findBestStartingPoint(transactions)
    const used = new Array(N).fill(false)
    used[startIdx] = true
    performDFS([transactions[startIdx]], used)

    return resultSequence
  }

  /**
   * Fallback sorting: created_at → transaction_id
   */
  private fallbackSort(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((a, b) => {
      const tA = new Date(a.created_at).getTime()
      const tB = new Date(b.created_at).getTime()

      // 1. Sort by created_at
      if (tA !== tB) return tA - tB

      // 2. Sort by transaction_id (deterministic)
      return a.transaction_id - b.transaction_id
    })
  }

  async cleanseTransactionIsNotVendor(
    c: Context,
    body: CleanseTransactionIsNotVendor
  ) {
    if (this.publisher) {
      await this.publisher.publish(
        "cleansing.transactions.is_not_vendor.process",
        {
          headers: c.req.header(),
          payload: body,
        }
      )
    }

    return {
      message: "Cleansing job started. Processing in background.",
    }
  }

  async executeCleansingTransactionsIsNotVendor(
    c: Context,
    body: CleanseTransactionIsNotVendor
  ) {
    const stockIds = body.stock_ids ?? []
    const batchSize = 100
    let totalProcessed = 0
    let totalSuccess = 0
    let totalErrors = 0

    try {
      console.log(
        `Starting cleansing with stock_ids: ${stockIds.length > 0 ? stockIds.join(", ") : "ALL (no filter)"}`
      )
      const stocksToCleanse = await this.repo.getStockIsNotVendorMoreThanZero(
        c,
        stockIds.length > 0 ? stockIds : undefined
      )

      if (stocksToCleanse.length === 0) {
        console.log("No stocks found that are not vendor with qty > 0")
        return
      }

      console.log(
        `Found ${stocksToCleanse.length} stocks to cleanse for transactions_is_not_vendor`
      )

      const stockIdMap = new Map(stocksToCleanse.map((s) => [s.stock_id, s]))
      const allStockIds = stocksToCleanse.map((s) => s.stock_id)
      const processedStockIds = new Set<number>()

      for (let i = 0; i < allStockIds.length; i += batchSize) {
        const batchStockIds = allStockIds.slice(i, i + batchSize)
        const batchNumber = Math.floor(i / batchSize) + 1
        const totalBatches = Math.ceil(allStockIds.length / batchSize)

        console.log(
          `Processing batch ${batchNumber}/${totalBatches} (${batchStockIds.length} stocks)`
        )

        try {
          const getTransactionsLatest =
            await this.repo.getTrsactionsLatestByStockIds(c, batchStockIds)

          for (const transaction of getTransactionsLatest) {
            try {
              const stockId = Number(transaction.stock_id)

              if (processedStockIds.has(stockId)) {
                continue
              }

              const baseTimestamp = transaction?.created_at
                ? new Date(transaction.created_at)
                : new Date()
              const removeStockTimestamp = new Date(
                baseTimestamp.getTime() + 10000
              )
              const foundStock = stockIdMap.get(stockId)

              if (!foundStock) {
                console.warn(
                  `Stock ${stockId} not found in stocksToCleanse map`
                )
                // update ws_stocks set qty = 0 where id = stockId to prevent future processing
                await this.repo.updateStockQty(c, stockId, 0)
                processedStockIds.add(stockId)
                totalSuccess++
                continue
              }

              const insertTransactionResult = await this.repo.insertTransaction(
                c,
                {
                  activity_id: Number(transaction.activity_id),
                  entity_id: Number(transaction.entity_id),
                  stock_id: stockId,
                  batch_code: transaction.batch_code,
                  device_type: 1,
                  created_by: Number(transaction.created_by),
                  updated_by: Number(transaction.updated_by),
                  opening_qty: Number(foundStock.qty),
                  change_qty: -Number(foundStock.qty),
                  transaction_type_id: 8,
                  entity_activity_id: Number(transaction.entity_activity_id),
                  uuid: uuidv7(),
                  transaction_reason_id: 12,
                  created_at: removeStockTimestamp,
                }
              )
              await this.repo.insertOtherReason(c, {
                source_id: insertTransactionResult.insertId as number,
                source_type: "transaction",
                content: "Data Cleansing",
              })
              console.log(
                `Inserted removeStock transaction for stock ${stockId} with transaction_id ${insertTransactionResult.insertId}`
              )

              await this.repo.updateStockQty(c, stockId, 0)

              processedStockIds.add(stockId)
              totalSuccess++
            } catch (transactionError) {
              console.error(
                `Error processing transaction for stock ${transaction.stock_id}:`,
                transactionError
              )
              totalErrors++
            }
          }

          totalProcessed += batchStockIds.length
          console.log(
            `Batch ${batchNumber} completed. Processed: ${totalProcessed}/${allStockIds.length}, Success: ${totalSuccess}, Errors: ${totalErrors}`
          )
        } catch (batchError) {
          console.error(`Error processing batch ${batchNumber}:`, batchError)
          totalErrors += batchStockIds.length
        }
      }

      const stocksWithoutTransactions = allStockIds.filter(
        (id) => !processedStockIds.has(id)
      )

      if (stocksWithoutTransactions.length > 0) {
        console.log(
          `Processing ${stocksWithoutTransactions.length} stocks without transactions`
        )

        for (const stockId of stocksWithoutTransactions) {
          try {
            const stock = stockIdMap.get(stockId)
            if (!stock) {
              console.warn(`Stock ${stockId} not found in map`)
              continue
            }

            await this.repo.updateStockQty(c, stockId, 0)
            processedStockIds.add(stockId)
            totalSuccess++

            console.log(
              `Updated stock ${stockId} qty from ${stock.qty} to 0 (no transactions found)`
            )
          } catch (error) {
            console.error(
              `Error updating stock ${stockId} without transactions:`,
              error
            )
            totalErrors++
          }
        }
      }

      console.log(
        `Cleansing completed. Total processed: ${totalProcessed}, Success: ${totalSuccess}, Errors: ${totalErrors}`
      )
    } catch (error) {
      console.error("Error in executeCleansingTransactionsIsNotVendor:", error)
      throw error
    }
  }

  async cleanseStockOpname(c: Context, body: CleanseStockOpnameRequest) {
    const jobId = randomUUID()

    const message = {
      headers: c.req.header(),
      payload: {
        job_id: jobId,
        period_ids: body.period_ids,
      },
    }

    if (this.publisher) {
      await this.publisher.publish("cleansing.stock_opname.process", message)
    }

    return {
      job_id: jobId,
      message: "Stock opname cleansing job started. Processing in background.",
    }
  }

  async cleanseAddAndRemoveStock(
    c: Context,
    body: CleanseAddAndRemoveStockRequest
  ) {
    const { stock_id, updateQty } = body
    const transactions = await this.repo.getTransactionByStockId(c, stock_id)

    const latestTransaction = transactions[transactions.length - 1]
    const oldestTransaction = transactions[0]

    if (latestTransaction && oldestTransaction) {
      if (latestTransaction.stock_qty === 0 || updateQty) {
        const addStockTimestamp = new Date(
          new Date(latestTransaction.created_at).getTime() + 2000
        )
        const addStockTransaction = await this.repo.insertTransaction(c, {
          activity_id: Number(oldestTransaction.activity_id ?? 0),
          entity_id: Number(latestTransaction.stock_entity_id ?? 0),
          stock_id: Number(stock_id),
          batch_code:
            latestTransaction.batch_code ?? oldestTransaction.batch_code,
          device_type: 1,
          created_by: Number(latestTransaction.created_by ?? 0),
          updated_by: Number(latestTransaction.updated_by ?? 0),
          opening_qty: 0,
          change_qty: 1,
          transaction_type_id: 7,
          entity_activity_id: Number(oldestTransaction.entity_activity_id ?? 0),
          uuid: uuidv7(),
          transaction_reason_id: 10,
          created_at: addStockTimestamp,
        })
        await this.repo.insertOtherReason(c, {
          source_id: addStockTransaction.insertId as number,
          source_type: "transaction",
          content: "Data Cleansing",
        })

        const removeStockTimestamp = new Date(
          new Date(latestTransaction.created_at).getTime() + 4000
        )
        const removeStockTransaction = await this.repo.insertTransaction(c, {
          activity_id: Number(oldestTransaction.activity_id ?? 0),
          entity_id: Number(latestTransaction.stock_entity_id ?? 0),
          stock_id: Number(stock_id),
          batch_code:
            latestTransaction.batch_code ?? oldestTransaction.batch_code,
          device_type: 1,
          created_by: Number(latestTransaction.created_by ?? 0),
          updated_by: Number(latestTransaction.updated_by ?? 0),
          opening_qty: 1,
          change_qty: -1,
          transaction_type_id: 8,
          entity_activity_id: Number(oldestTransaction.entity_activity_id ?? 0),
          uuid: uuidv7(),
          transaction_reason_id: 12,
          created_at: removeStockTimestamp,
        })
        await this.repo.insertOtherReason(c, {
          source_id: removeStockTransaction.insertId as number,
          source_type: "transaction",
          content: "Data Cleansing",
        })

        if (updateQty) {
          await this.repo.updateStockQty(c, stock_id, 0)
        }

        return {
          message: `Cleansing completed. Added addStock and removeStock transactions for stock_id ${stock_id}.`,
        }
      } else {
        return {
          message: "No transactions found. No cleansing needed.",
        }
      }
    } else {
      console.log(
        `No transactions found for stock_id ${stock_id} . No cleansing needed.`
      )
      console.log(
        `Proceeding to soft delete stock_id ${stock_id} without transactions.`
      )

      // Soft delete the stock
      await this.repo.softDeleteStocksById(c, stock_id)

      return {
        message: "No transactions found. No cleansing needed.",
      }
    }
  }

  async bulkCleanseAddAndRemoveStock(
    c: Context,
    body: CleanseAddAndRemoveStockBulkRequest
  ) {
    // Publish immediately without counting - let worker handle the count
    const message = {
      headers: c.req.header(),
      payload: body,
    }

    if (this.publisher) {
      await this.publisher.publish(
        "cleansing.add_and_remove_stock.bulk_process",
        message
      )
    }

    return {
      message: "Bulk cleansing job started. Processing in background.",
    }
  }

  async cleaningUpUnallocatedInventory(
    c: Context,
    body: CleaningUpUnallocatedInventoryRequest
  ) {
    const jobId = randomUUID()

    const message = {
      headers: c.req.header(),
      payload: {
        job_id: jobId,
        body: body,
      },
    }

    if (this.publisher) {
      await this.publisher.publish(
        "cleansing.unallocated_inventory.process",
        message
      )
    }

    return {
      job_id: jobId,
      message:
        "Cleaning up unallocated inventory job started. Processing in background.",
    }
  }
}
