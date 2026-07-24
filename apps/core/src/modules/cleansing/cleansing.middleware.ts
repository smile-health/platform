import { BaseMiddleware } from "@smile/lib/base/middleware"
import { Context } from "hono"
import {
  switchTransactionEntitySchema,
  SwitchTransactionEntityItem,
  cleanseUnreceivedQtyRequestSchema,
  cleanseTransactionsRequestSchema,
  bulkCleanseTransactionsRequestSchema,
  cleanseTransactionIsNotVendorRequestSchema,
  cleanseStockOpnameRequestSchema,
  cleanseAddAndRemoveStockBulkRequestSchema,
  cleaningUpUnallocatedInventoryRequestSchema,
} from "./cleansing.schema"
import z from "zod"
import { CleansingRepository } from "./cleansing.repository"

export class CleansingMiddleware extends BaseMiddleware {
  constructor(private readonly repo: CleansingRepository) {
    super()
  }

  switchTransactionEntity(c: Context) {
    return switchTransactionEntitySchema.superRefine(
      async (data: SwitchTransactionEntityItem[], ctx) => {
        console.log(`Starting validation for ${data.length} items...`)

        // Validate each item in the array
        for (let i = 0; i < data.length; i++) {
          const item = data[i]

          // Check if IDs are the same within each item
          if (!item) continue

          if (item.global_entity_id_from === item.global_entity_id_to) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [i, "global_entity_id_to"],
              message:
                "global_entity_id_from and global_entity_id_to must be different",
            })
          }

          const [fromEntity, toEntity] = await Promise.all([
            this.repo.getMasterDataEntities(c, item.global_entity_id_from),
            this.repo.getMasterDataEntities(c, item.global_entity_id_to),
          ])

          if (!fromEntity) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [i, "global_entity_id_from"],
              message: `Entity with id ${item.global_entity_id_from} not found`,
            })
          }

          if (!toEntity) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [i, "global_entity_id_to"],
              message: `Entity with id ${item.global_entity_id_to} not found`,
            })
          }
        }
      }
    )
  }

  cleanseUnreceivedQty(c: Context) {
    return cleanseUnreceivedQtyRequestSchema.superRefine((data, ctx) => {
      // Validasi: max_edit harus >= batch_size jika keduanya diisi
      if (data.max_edit !== undefined && data.batch_size !== undefined) {
        if (data.max_edit < data.batch_size) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["max_edit"],
            message: "max_edit must be greater than or equal to batch_size",
          })
        }
      }
    })
  }

  cleanseTransactions(c: Context) {
    return bulkCleanseTransactionsRequestSchema
  }

  cleanseTransactionsIsNotVendor(c: Context) {
    return cleanseTransactionIsNotVendorRequestSchema
  }

  cleanseStockOpname(c: Context) {
    return cleanseStockOpnameRequestSchema.superRefine(async (data, ctx) => {
      if (data.period_ids.length > 0) {
        const getData = await this.repo.getStockOpnameByIds(c, data.period_ids)

        if (getData.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["period_ids"],
            message: `Stock opname period with id ${data.period_ids.join(", ")} not found`,
          })
        }

        if (getData.length > 0) {
          const thisMonth = new Date().getMonth()
          const thisYear = new Date().getFullYear()
          console.log("thisMonth", thisMonth, "thisYear", thisYear)

          const invalidPeriodIds = getData
            .filter((item) => {
              if (typeof item !== "object" || item === null) return false

              return (
                "month_period" in item &&
                "year_period" in item &&
                (item.month_period !== thisMonth ||
                  item.year_period !== thisYear)
              )
            })
            .map((item) => item.id)

          const foundIds = getData.map((item) => item.id)
          const notFoundIds = data.period_ids.filter(
            (id) => !foundIds.includes(id)
          )

          if (notFoundIds.length > 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["period_ids"],
              message: `Stock opname period with id ${notFoundIds.join(", ")} not found`,
            })
          }

          if (invalidPeriodIds.length > 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["period_ids"],
              message: `Stock opname period with id ${invalidPeriodIds.join(
                ", "
              )} is not for this month`,
            })
          }
        }
      }
    })
  }

  cleanseAddAndRemoveStock(c: Context) {
    return cleanseAddAndRemoveStockBulkRequestSchema
  }

  cleaningUpUnallocatedInventory(c: Context) {
    return cleaningUpUnallocatedInventoryRequestSchema
  }
}
