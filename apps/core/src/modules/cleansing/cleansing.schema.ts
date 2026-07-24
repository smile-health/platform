import z from "zod"

export const switchTransactionEntityItemSchema = z.object({
  global_entity_id_from: z.number().positive(),
  global_entity_id_to: z.number().positive(),
})

export const switchTransactionEntitySchema = z.array(
  switchTransactionEntityItemSchema
)

export type SwitchTransactionEntityItem = z.infer<
  typeof switchTransactionEntityItemSchema
>
export type SwitchTransactionEntityRequest = z.infer<
  typeof switchTransactionEntitySchema
>

export const cleanseUnreceivedQtyRequestSchema = z.object({
  batch_size: z.number().positive().max(10000).default(1000).optional(),
  limit: z.number().positive().optional(),
  max_edit: z.number().positive().optional(),
})

export type CleanseUnreceivedQtyRequest = z.infer<
  typeof cleanseUnreceivedQtyRequestSchema
>

export const cleanseUnreceivedQtyResponseSchema = z.object({
  job_id: z.string(),
  message: z.string(),
  total_records: z.number(),
  batch_size: z.number(),
  limit: z.number().optional(),
  estimated_batches: z.number(),
})

export type CleanseUnreceivedQtyResponse = z.infer<
  typeof cleanseUnreceivedQtyResponseSchema
>

export const cleanseTransactionsRequestSchema = z.object({
  stok_id: z.number().positive(),
  entity_id: z.number().positive(),
})
export const bulkCleanseTransactionsRequestSchema = z.array(
  cleanseTransactionsRequestSchema
)

export const cleanseTransactionIsNotVendorRequestSchema = z
  .object({
    stock_ids: z.array(z.number().positive()).optional().default([]),
  })
  .default({})

export type CleanseTransactionsRequest = z.infer<
  typeof cleanseTransactionsRequestSchema
>
export type BulkCleanseTransactionsRequest = z.infer<
  typeof bulkCleanseTransactionsRequestSchema
>

export type CleanseTransactionIsNotVendor = z.infer<
  typeof cleanseTransactionIsNotVendorRequestSchema
>

export const cleanseStockOpnameRequestSchema = z.object({
  period_ids: z.array(z.number().positive()).min(1),
})

export type CleanseStockOpnameRequest = z.infer<
  typeof cleanseStockOpnameRequestSchema
>

export const cleanseAddAndRemoveStockRequestSchema = z.object({
  stock_id: z.number().positive(),
  updateQty: z.boolean().optional().default(false),
})

export type CleanseAddAndRemoveStockRequest = z.infer<
  typeof cleanseAddAndRemoveStockRequestSchema
>

export const cleanseAddAndRemoveStockBulkRequestSchema = z.array(
  cleanseAddAndRemoveStockRequestSchema
)

export type CleanseAddAndRemoveStockBulkRequest = z.infer<
  typeof cleanseAddAndRemoveStockBulkRequestSchema
>

export const cleaningUpUnallocatedInventoryRequestSchema = z
  .object({
    batch_size: z.number().positive().max(10000).default(1000).optional(),
    limit: z.number().positive().optional(),
    limit_update_data: z.number().positive().optional(),
    start_expired_date: z.coerce.date().optional(),
    end_expired_date: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.start_expired_date && data.end_expired_date) {
      if (data.start_expired_date > data.end_expired_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_expired_date"],
          message:
            "end_expired_date must be greater than or equal to start_expired_date",
        })
      }
    }

    if (data.limit && data.batch_size) {
      if (data.limit < data.batch_size) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["limit"],
          message: "limit must be greater than or equal to batch_size",
        })
      }
    }
  })

export type CleaningUpUnallocatedInventoryRequest = z.infer<
  typeof cleaningUpUnallocatedInventoryRequestSchema
>
