import { Consumer } from "@smile-health/lib/rabbitmq/consumer.js"
import { DB } from "@/common/infrastructure/database/types/db.js"
import { CleansingRepository } from "./cleansing.repository.js"
import { CleansingModule } from "./cleansing.module.js"

interface StockOpnameEntity {
  entity_id: number
  entity_name: string
  active_orders: number
  total_stocks: number
  stock_ids: string
  order_ids: string | null
}

export class CleansingWorker {
  constructor(
    private readonly repo: CleansingRepository,
    private readonly module: CleansingModule
  ) {}

  public registerWorkers(consumer: Consumer<DB>) {
    consumer.route("cleansing.unreceived_qty.process", async (c, msg) => {
      if (!msg) {
        throw new Error("Message is null or undefined")
      }
      const parsedMsg = typeof msg === "string" ? JSON.parse(msg) : msg
      const { job_id, batch_size, limit, max_edit } = parsedMsg.payload

      console.log(
        `[${job_id}] Starting cleansing process. Batch size: ${batch_size}${limit ? `, Limit: ${limit}` : ""}${max_edit ? `, Max edit: ${max_edit}` : " (unlimited)"}`
      )

      let offset = 0
      let batchNumber = 1
      let totalProcessed = 0

      // Loop sampai tidak ada data lagi atau mencapai limit/max_edit
      while (true) {
        try {
          // Jika ada max_edit, cek apakah sudah tercapai
          if (max_edit && totalProcessed >= max_edit) {
            console.log(
              `[${job_id}] Reached max_edit limit of ${max_edit} records`
            )
            break
          }

          // Jika ada limit, hitung sisa yang boleh diproses
          const remainingLimit = limit ? limit - totalProcessed : batch_size

          // Stop jika sudah mencapai limit
          if (limit && remainingLimit <= 0) {
            console.log(`[${job_id}] Reached limit of ${limit} records`)
            break
          }

          // Tentukan batch size untuk iterasi ini
          const currentBatchSize = Math.min(batch_size, remainingLimit)

          // Get batch of problematic stocks with difference values
          const problematicStocks = await this.repo.getProblematicStocks(
            c,
            currentBatchSize,
            offset
          )

          // Jika tidak ada data lagi, stop
          if (problematicStocks.length === 0) {
            console.log(`[${job_id}] No more records to process`)
            break
          }

          console.log(
            `[${job_id}] Processing batch ${batchNumber}: ${problematicStocks.length} records (offset: ${offset})`
          )

          // Hitung jumlah record yang akan diedit di batch ini
          let batchEditCount = problematicStocks.length

          // Jika max_edit aktif dan batch ini akan melampaui limit
          if (max_edit && totalProcessed + batchEditCount > max_edit) {
            batchEditCount = max_edit - totalProcessed
            console.log(
              `[${job_id}] Limiting batch to ${batchEditCount} records to respect max_edit limit`
            )
          }

          // Update unreceived_qty based on difference for this batch
          const stocksToUpdate = problematicStocks
            .slice(0, batchEditCount)
            .map((stock) => ({
              stock_id: stock.customer_stock_id,
              new_unreceived_qty:
                stock.unreceived_qty - stock.difference_unreceived_qty,
            }))

          console.log({
            stocksToUpdate,
          })

          await this.repo.updateStocksUnreceivedQtyInBatch(c, stocksToUpdate)

          totalProcessed += batchEditCount
          offset += batchEditCount // ✅ Perbaiki: increment berdasarkan jumlah yang benar-benar di-edit
          batchNumber++

          console.log(
            `[${job_id}] Batch ${batchNumber - 1} completed. Total processed: ${totalProcessed}${max_edit ? `/${max_edit}` : ""}${limit ? ` (limit: ${limit})` : ""}`
          )

          // Stop jika sudah mencapai max_edit
          if (max_edit && totalProcessed >= max_edit) {
            console.log(
              `[${job_id}] Reached max_edit limit of ${max_edit} records, stopping`
            )
            break
          }

          // Optional: Add small delay to prevent overwhelming the database
          // await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.error(
            `[${job_id}] Error processing batch ${batchNumber}:`,
            error
          )
          throw error
        }
      }

      console.log(
        `[${job_id}] Cleansing process completed. Total processed: ${totalProcessed} records in ${batchNumber - 1} batches`
      )
    })

    consumer.route("cleansing.transactions.process", async (c, msg) => {
      if (!msg) {
        throw new Error("Message is null or undefined")
      }
      const parsedMsg = typeof msg === "string" ? JSON.parse(msg) : msg
      // array of { stock_id, entity_id }
      const transactionsToCleanse: Array<{
        stok_id: number
        entity_id: number
      }> = parsedMsg.payload

      console.log(
        `Starting transaction cleansing for ${transactionsToCleanse.length} transactions`
      )

      for (const { stok_id, entity_id } of transactionsToCleanse) {
        try {
          console.log(
            `Cleansing transactions for stock_id ${stok_id} and entity_id ${entity_id}...`
          )
          await this.module.cleanseTransactions(c, {
            stok_id: stok_id,
            entity_id,
          })
          console.log(
            `Finished cleansing transactions for stock_id ${stok_id} and entity_id ${entity_id}`
          )
        } catch (error) {
          console.error(
            `Error cleansing transactions for stock_id ${stok_id} and entity_id ${entity_id}:`,
            error
          )
        }
      }
    })

    consumer.route(
      "cleansing.transactions.is_not_vendor.process",
      async (c, msg) => {
        if (!msg) {
          throw new Error("Message is null or undefined")
        }
        const parsedMsg = typeof msg === "string" ? JSON.parse(msg) : msg
        const { stock_ids } = parsedMsg.payload

        console.log(
          `Starting transaction cleansing for ${stock_ids.length} transactions`
        )

        try {
          await this.module.executeCleansingTransactionsIsNotVendor(c, {
            stock_ids,
          })
          console.log(
            `Finished cleansing transactions for ${stock_ids.length} stock_ids`
          )
        } catch (error) {
          console.error(
            `Error cleansing transactions for stock_ids ${stock_ids.join(", ")}:`,
            error
          )
        }
      }
    )

    consumer.route("cleansing.stock_opname.process", async (c, msg) => {
      if (!msg) {
        throw new Error("Message is null or undefined")
      }
      const parsedMsg = typeof msg === "string" ? JSON.parse(msg) : msg
      const { job_id, period_ids } = parsedMsg.payload

      console.log(
        `[${job_id}] Starting stock opname cleansing for periods: ${period_ids.join(", ")}`
      )

      let totalProcessed = 0
      let totalUpdated = 0
      let totalErrors = 0

      try {
        // Get all stock opname data for the given periods
        const stockOpnameData = await this.repo.getStockOpnameData(
          c,
          period_ids
        )

        if (stockOpnameData.length === 0) {
          console.log(
            `[${job_id}] No stock opname data found for periods: ${period_ids.join(", ")}`
          )
          return
        }

        console.log(
          `[${job_id}] Found ${stockOpnameData.length} entities with stock opname data`
        )

        // Process each entity
        for (const entity of stockOpnameData as StockOpnameEntity[]) {
          try {
            console.log(
              `[${job_id}] Processing entity: ${entity.entity_id} (${entity.entity_name})`
            )
            console.log(
              `[${job_id}]   - Active Orders: ${entity.active_orders}, Total Stocks: ${entity.total_stocks}`
            )
            console.log(`[${job_id}]   - Stock IDs: ${entity.stock_ids}`)
            console.log(
              `[${job_id}]   - Order IDs: ${entity.order_ids || "NONE"}`
            )

            // Parse stock_ids
            const stockIds = entity.stock_ids
              .split(", ")
              .map((id) => Number(id.trim()))
              .filter((id) => !isNaN(id))

            // If order_ids is null, update all stocks for this entity
            if (!entity.order_ids || entity.order_ids.trim() === "") {
              console.log(
                `[${job_id}]   → No active orders found. Clearing unreceived_qty and in_transit_qty for ${stockIds.length} stocks`
              )

              try {
                // Update for each period_id
                for (const periodId of period_ids) {
                  await this.repo.updateStockUnreceivedQtyAndOpnameByStockAndPeriod(
                    c,
                    stockIds,
                    periodId
                  )
                }
                totalUpdated += stockIds.length
              } catch (error) {
                console.error(
                  `[${job_id}] Error updating stocks [${stockIds.join(", ")}]:`,
                  error
                )
                totalErrors += stockIds.length
              }
            } else {
              console.log(
                `[${job_id}]   → Found ${entity.active_orders} active order(s). Validating and updating stock data.`
              )

              try {
                // For each stock in this entity, validate with orders
                for (const stockId of stockIds) {
                  try {
                    // Get validation data for this stock with orders
                    const validationData =
                      await this.repo.getStockOpnameDataWithOrders(
                        c,
                        entity.entity_id,
                        stockId
                      )

                    if (validationData.length === 0) {
                      console.log(
                        `[${job_id}]   ⚠ No validation data found for stock ${stockId}`
                      )
                      continue
                    }

                    // Process each validation result
                    for (const data of validationData) {
                      const differenceUnreceivedQty = Number(
                        data.difference_unreceived_qty
                      )
                      const newUnreceivedQty =
                        Number(data.unreceived_qty) - differenceUnreceivedQty

                      console.log(
                        `[${job_id}]     Stock ${stockId}: difference = ${differenceUnreceivedQty} (${differenceUnreceivedQty < 0 ? "shortage" : "excess"})`
                      )

                      // Update for each period_id
                      for (const periodId of period_ids) {
                        await this.repo.updateStockAndOpnameByDifference(
                          c,
                          data.stocks_id_customer,
                          periodId,
                          newUnreceivedQty
                        )
                      }

                      totalUpdated++
                    }
                  } catch (stockError) {
                    console.error(
                      `[${job_id}] Error validating stock ${stockId}:`,
                      stockError
                    )
                    totalErrors++
                  }
                }
              } catch (orderError) {
                console.error(
                  `[${job_id}] Error processing entity with orders ${entity.entity_id}:`,
                  orderError
                )
                totalErrors += stockIds.length
              }
            }

            totalProcessed += stockIds.length
          } catch (entityError) {
            console.error(
              `[${job_id}] Error processing entity ${entity.entity_id}:`,
              entityError
            )
            totalErrors++
          }
        }

        console.log(
          `[${job_id}] Stock opname cleansing completed. Processed: ${totalProcessed}, Updated: ${totalUpdated}, Errors: ${totalErrors}`
        )
      } catch (error) {
        console.error(
          `[${job_id}] Error in stock opname cleansing process:`,
          error
        )
      }
    })

    consumer.route(
      "cleansing.add_and_remove_stock.bulk_process",
      async (c, msg) => {
        if (!msg) {
          throw new Error("Message is null or undefined")
        }
        const parsedMsg = typeof msg === "string" ? JSON.parse(msg) : msg
        const transactionsToCleanse: Array<{
          stock_id: number
        }> = parsedMsg.payload

        console.log(
          `Starting bulk cleansing of add and remove stock for ${transactionsToCleanse.length} transactions`
        )

        for (const { stock_id } of transactionsToCleanse) {
          try {
            console.log(
              `Cleansing add and remove stock for stock_id ${stock_id} ...`
            )
            await this.module.cleanseAddAndRemoveStock(c, {
              stock_id,
            })
          } catch (error) {
            console.error(
              `Error cleansing add and remove stock for stock_id ${stock_id} :`,
              error
            )
          }
        }
      }
    )

    consumer.route(
      "cleansing.unallocated_inventory.process",
      async (c, msg) => {
        if (!msg) {
          throw new Error("Message is null or undefined")
        }
        const parsedMsg = typeof msg === "string" ? JSON.parse(msg) : msg
        const { job_id, body } = parsedMsg.payload

        console.log(
          `[${job_id}] Starting cleanup of unallocated inventory. Page size: ${body.limit || "unlimited"}${body.limit_update_data ? `, Max update: ${body.limit_update_data}` : ""}`
        )

        try {
          const pageSize = body.limit || 100
          const maxUpdate = body.limit_update_data
          let offset = 0
          let totalProcessed = 0
          let totalSuccess = 0
          let totalErrors = 0
          let batchNumber = 1

          while (true) {
            if (maxUpdate && totalProcessed >= maxUpdate) {
              console.log(
                `[${job_id}] Reached limit_update_data of ${maxUpdate} records`
              )
              break
            }

            const fetchLimit = maxUpdate
              ? Math.min(pageSize, maxUpdate - totalProcessed)
              : pageSize

            console.log(
              `[${job_id}] Query batch ${batchNumber}: limit=${fetchLimit}, offset=${offset}`
            )

            const unallocatedStocks = await this.repo.getUnallocatedStock(
              c,
              body,
              fetchLimit,
              offset
            )

            if (unallocatedStocks.length === 0) {
              console.log(`[${job_id}] No more records to process`)
              break
            }

            console.log(
              `[${job_id}] Processing batch ${batchNumber}: ${unallocatedStocks.length} stocks`
            )

            for (const stock of unallocatedStocks) {
              try {
                await this.module.cleanseAddAndRemoveStock(c, {
                  stock_id: stock.stock_id,
                  updateQty: true,
                })
                totalSuccess++
                console.log(
                  `[${job_id}]   Processed stock ${stock.stock_id}: qty ${stock.qty} → 0 (${stock.material_name})`
                )
              } catch (error) {
                console.error(
                  `[${job_id}] Error processing stock ${stock.stock_id}:`,
                  error
                )
                totalErrors++
              }
            }

            totalProcessed += unallocatedStocks.length
            offset += unallocatedStocks.length
            batchNumber++

            console.log(
              `[${job_id}] Batch ${batchNumber - 1} completed. Total: ${totalProcessed}${maxUpdate ? `/${maxUpdate}` : ""}, Success: ${totalSuccess}, Errors: ${totalErrors}`
            )
          }

          console.log(
            `[${job_id}] Cleanup completed. Processed: ${totalProcessed}, Success: ${totalSuccess}, Errors: ${totalErrors}`
          )
        } catch (error) {
          console.error(
            `[${job_id}] Error in unallocated inventory cleanup:`,
            error
          )
        }
      }
    )
  }
}
