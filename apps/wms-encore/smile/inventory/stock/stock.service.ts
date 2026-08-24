// Business logic for order-driven stock movement — each function owns ONE
// db.transaction() end-to-end: the stock mutation (delegating the actual
// locking/arithmetic to the existing *InTrx functions in stock.repository.ts)
// plus, where legacy also writes one, the ws_transactions ledger row — all
// committed as inventory's own atomic unit. Framework-agnostic (no Encore
// imports) — stock.internal.ts is the thin api()-endpoint wrapper around
// this, same split as order.controller.ts wraps each order use-case file
// (allocate-order.ts, ship-order.ts, etc.).
import { db } from "../db";
import * as repo from "./stock.repository";
import * as transactionRepo from "../transaction/transaction.repository";
import { TRANSACTION_TYPE } from "../transaction/transaction.constants";

export interface AllocateStockInput {
  orderId: number;
  items: { stockId: number; qty: number }[];
  userId: number;
}

// Lock + check + increment ws_stocks.allocated_qty for every item, all in
// one trx (apps/main's order-status-allocate.repository.ts: getStockByIds
// (...).forUpdate() + updateStockAllocateById). NO ws_transactions row on
// allocate — legacy doesn't create one either. Throws
// repo.InsufficientStockError (mapped to an APIError at the endpoint
// boundary in stock.internal.ts) if any item lacks available stock.
export async function allocateStock(input: AllocateStockInput): Promise<void> {
  await db.transaction().execute((trx) => repo.allocateStocksInTrx(trx, input.items, input.userId));
}

export interface StockLedgerLine {
  stockId: number;
  qty: number;
}

// Order-level fields the ledger insert needs — passed in explicitly by the
// caller (the ship/fulfill/cancel-order.ts use case, which already has the
// order row in hand) rather than queried here. Inventory has no business
// knowing ws_orders'/
// ws_order_item_stocks' schema; it only knows what it's told via RPC input.
export interface LedgerContext {
  activityId: number | null;
  entityId: number | null;
  deviceType: number | null;
}

export interface ShipStockInput {
  orderId: number;
  items: StockLedgerLine[];
  ledgerContext: LedgerContext;
  userId: number;
}

// Move allocated -> in-transit for every affected stock row (apps/main's
// order-status-ship.repository.ts:143-175,285-291), THEN insert one
// ws_transactions row per line with transaction_type_id = ISSUES and
// order_id set (.module.ts:202-227) — all in this same trx.
export async function shipStock(input: ShipStockInput): Promise<void> {
  await db.transaction().execute(async (trx) => {
    await repo.moveAllocatedToInTransitInTrx(
      trx,
      input.items.map((item) => ({ stockId: item.stockId, qty: item.qty })),
      input.userId,
    );

    for (const item of input.items) {
      if (item.qty === 0) continue;
      await transactionRepo.createTransaction(trx, {
        activityId: input.ledgerContext.activityId,
        entityId: input.ledgerContext.entityId,
        stockId: item.stockId,
        orderId: input.orderId,
        transactionTypeId: TRANSACTION_TYPE.ISSUES,
        changeQty: item.qty,
        openingQty: null,
        deviceType: input.ledgerContext.deviceType,
        batchCode: null,
        createdBy: input.userId,
        updatedBy: input.userId,
      });
    }
  });
}

export interface FulfillStockInput {
  orderId: number;
  items: StockLedgerLine[];
  ledgerContext: LedgerContext;
  userId: number;
}

// Finalize in-transit -> consumed for every affected stock row (apps/main's
// order-status-fulfilled.repository.ts:194-202), THEN insert one
// ws_transactions row per line with transaction_type_id = RECEIPTS and
// order_id set (.module.ts:253-286, per order item) — all in this same trx.
export async function fulfillStock(input: FulfillStockInput): Promise<void> {
  await db.transaction().execute(async (trx) => {
    await repo.finalizeInTransitInTrx(
      trx,
      input.items.map((item) => ({ stockId: item.stockId, qty: item.qty })),
      input.userId,
    );

    for (const item of input.items) {
      if (item.qty === 0) continue;
      await transactionRepo.createTransaction(trx, {
        activityId: input.ledgerContext.activityId,
        entityId: input.ledgerContext.entityId,
        stockId: item.stockId,
        orderId: input.orderId,
        transactionTypeId: TRANSACTION_TYPE.RECEIPTS,
        changeQty: item.qty,
        openingQty: null,
        deviceType: input.ledgerContext.deviceType,
        batchCode: null,
        createdBy: input.userId,
        updatedBy: input.userId,
      });
    }
  });
}

export interface CancelStockInput {
  orderId: number;
  items: StockLedgerLine[];
  ledgerContext: LedgerContext;
  recordLedger: boolean;
  userId: number;
}

// Release held allocated_qty back (per the order lifecycle's transition map,
// cancel is only ever legal from pending/confirmed/allocated — never
// shipped/fulfilled — so there's never an in-transit bucket to unwind here),
// and conditionally insert the reversal ws_transactions row — all in one
// trx. `recordLedger` is an order-domain decision (which order types get a
// reversal transaction), computed by the caller — this function just does
// what it's told.
export async function cancelStock(input: CancelStockInput): Promise<void> {
  await db.transaction().execute(async (trx) => {
    await repo.releaseHeldQtyInTrx(
      trx,
      input.items.map((item) => ({ stockId: item.stockId, qty: item.qty })),
      "allocated_qty",
      input.userId,
    );

    if (input.recordLedger) {
      for (const item of input.items) {
        if (item.qty === 0) continue;
        await transactionRepo.createTransaction(trx, {
          activityId: input.ledgerContext.activityId,
          entityId: input.ledgerContext.entityId,
          stockId: item.stockId,
          orderId: input.orderId,
          transactionTypeId: TRANSACTION_TYPE.RECEIPTS,
          changeQty: item.qty,
          openingQty: null,
          deviceType: input.ledgerContext.deviceType,
          batchCode: null,
          createdBy: input.userId,
          updatedBy: input.userId,
        });
      }
    }
  });
}
