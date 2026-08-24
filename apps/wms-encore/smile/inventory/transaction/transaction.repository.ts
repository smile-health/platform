// Stock-ledger writes against ws_transactions. Not its own Encore service —
// same as stock/ this is a plain data-access module inside the `inventory`
// service (see smile/inventory/encore.service.ts), no encore.service.ts here.
//
// A "transaction" here is a stock-ledger concept (one row per stock
// movement), not an order concept — hence living under smile/inventory/
// rather than smile/order/, per the domain-ownership call made when this was
// wired into the ship/fulfill/cancel-order.ts use cases' allocate/ship/
// fulfilled/cancel transitions.
//
// Legacy reference: apps/main's order-status-ship/fulfilled/cancel
// repositories each insert one row per affected order item via
// `.insertInto("ws_transactions")`, inside the same request-scoped `trx` as
// their ws_stocks mutation and order-status update — never as a separate
// async step. createTransaction below is the equivalent single-row insert,
// called from stock.service.ts's own `db.transaction()` block (smile/
// inventory's, not smile/order's — see stock.service.ts's header for why
// the two services no longer share a transaction) so it lands in that same
// trx alongside the stock mutation.
import type { Transaction } from "kysely";
import type { DB } from "../../../core/db.types";

// Only the columns the ship/fulfill/cancel-order.ts use cases' transitions
// actually need to set (per the task's column list) — not a full port of
// every ws_transactions column's business meaning. Extra convenience fields
// (actual_transaction_date, entity_activity_id, companion_entity_id) are
// accepted but optional; everything else on the table defaults/nulls out via
// its `Generated<...>` type.
export interface CreateTransactionDTO {
  activityId: number | null;
  entityId: number | null;
  stockId: number | null;
  orderId: number;
  transactionTypeId: number;
  changeQty: number;
  openingQty: number | null;
  deviceType: number | null;
  batchCode: string | null;
  createdBy: number;
  updatedBy: number;
  actualTransactionDate?: Date;
  entityActivityId?: number | null;
  companionEntityId?: number | null;
}

export async function createTransaction(trx: Transaction<DB>, dto: CreateTransactionDTO): Promise<number> {
  const result = await trx
    .insertInto("ws_transactions")
    .values({
      activity_id: dto.activityId,
      entity_id: dto.entityId,
      stock_id: dto.stockId,
      order_id: dto.orderId,
      transaction_type_id: dto.transactionTypeId,
      change_qty: dto.changeQty,
      opening_qty: dto.openingQty,
      device_type: dto.deviceType,
      batch_code: dto.batchCode,
      created_by: dto.createdBy,
      updated_by: dto.updatedBy,
      actual_transaction_date: dto.actualTransactionDate ?? null,
      entity_activity_id: dto.entityActivityId ?? null,
      companion_entity_id: dto.companionEntityId ?? null,
    })
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}
