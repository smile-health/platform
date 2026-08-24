// Kysely functions against ws_stocks — backs inventory.subscriptions.ts's
// order-lifecycle handlers. Arithmetic direction (what increments/decrements
// on allocate/ship/fulfill/cancel) is verified against apps/main's
// stock.repository.ts (available is a derived `qty - allocated_qty`, never
// stored) and the qty fields actually present on ws_stocks — there is no
// `reserved_qty` column, so "reserve on create" isn't modeled (see
// inventory.subscriptions.ts's onOrderCreated comment).
import { db } from "../db";
import type { DB, WsStocksTable } from "../../../core/db.types";
import type { Selectable, Transaction } from "kysely";
import { sql } from "kysely";

export type StockRow = Selectable<WsStocksTable>;

export async function findById(id: number): Promise<StockRow | undefined> {
  return db.selectFrom("ws_stocks").selectAll().where("id", "=", id).where("deleted_at", "is", null).executeTakeFirst() as Promise<
    StockRow | undefined
  >;
}

export async function findByIds(ids: number[]): Promise<StockRow[]> {
  if (!ids.length) return [];
  return db.selectFrom("ws_stocks").selectAll().where("id", "in", ids).where("deleted_at", "is", null).execute() as Promise<StockRow[]>;
}

// available = qty - allocated_qty, derived (matches apps/main's
// stock.repository.ts `sql`ws.qty - ws.allocated_qty`.as("available")` —
// never stored as its own column).
export async function findAvailability(id: number): Promise<{ qty: number; allocated_qty: number; in_transit_qty: number; available: number } | undefined> {
  const row = await db
    .selectFrom("ws_stocks")
    .select(["qty", "allocated_qty", "in_transit_qty"])
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  if (!row) return undefined;
  const qty = row.qty ?? 0;
  const allocated = row.allocated_qty ?? 0;
  const inTransit = row.in_transit_qty ?? 0;
  return { qty, allocated_qty: allocated, in_transit_qty: inTransit, available: qty - allocated };
}

// --- Order-lifecycle mutations --------------------------------------------
// Matches the locking pattern already established across this codebase
// (apps/main's order-status-allocate/ship/cancel repositories, transaction/
// consumption repositories): SELECT ... FOR UPDATE inside a single
// transaction per batch, not a bare atomic UPDATE. This isn't just a style
// match — it's a real correctness difference from an earlier version of
// this file, which used one independent atomic `UPDATE ... WHERE` per item.
// That protected each row from going negative individually, but a whole
// multi-item event (e.g. an order with 3 line items) wasn't all-or-nothing:
// if item 2 of 3 failed its guard, item 1's increment had already committed
// and nothing rolled it back. Wrapping the whole batch in one `db
// .transaction()`, with `.forUpdate()` held on every row for the batch's
// duration, means either the whole event's stock movement commits or none
// of it does — a thrown error inside the callback rolls back everything
// already written earlier in the same call.

export class InsufficientStockError extends Error {
  constructor(
    public readonly stockId: number,
    public readonly requested: number,
    public readonly available: number,
  ) {
    super(`Insufficient available stock for stockId=${stockId}: available=${available}, requested=${requested}`);
    this.name = "InsufficientStockError";
  }
}

export interface StockDelta {
  stockId: number;
  qty: number;
}

// Allocate: locks every affected stock row (FOR UPDATE) before checking
// availability in application code, exactly like apps/main's
// order-status-allocate.repository.ts's getStockByIds(...).forUpdate() +
// updateStockAllocateById inside one `trx`. Throws InsufficientStockError
// (rolling back the whole transaction, including any earlier items in this
// same batch) the first time a row doesn't have enough available qty.
export async function allocateStocksInTrx(trx: Transaction<DB>, items: StockDelta[], updatedBy: number): Promise<void> {
  const toApply = items.filter((i) => i.qty !== 0);
  if (!toApply.length) return;

  for (const item of toApply) {
    const row = await trx
      .selectFrom("ws_stocks")
      .select(["id", "qty", "allocated_qty"])
      .where("id", "=", item.stockId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();

    const available = (row?.qty ?? 0) - (row?.allocated_qty ?? 0);
    if (!row || available < item.qty) {
      throw new InsufficientStockError(item.stockId, item.qty, available);
    }

    await trx
      .updateTable("ws_stocks")
      .set({
        allocated_qty: sql`coalesce(allocated_qty, 0) + ${item.qty}`,
        updated_by: updatedBy,
        updated_at: new Date(),
      })
      .where("id", "=", item.stockId)
      .execute();
  }
}

// Ship: allocated_qty -> in_transit_qty for each stock row (allocation
// leaves "allocated" and becomes "in transit" — total held against the
// stock is unchanged, it just moves from one bucket to the other). Locked
// and batched the same way as allocateStocksInTrx, for the same reason: one
// order's ship should move all its lines' stock or none of them — see
// stock.internal.ts's shipStock, which wraps this in its own transaction.
export async function moveAllocatedToInTransitInTrx(trx: Transaction<DB>, items: StockDelta[], updatedBy: number): Promise<void> {
  const toApply = items.filter((i) => i.qty !== 0);
  if (!toApply.length) return;

  for (const item of toApply) {
    await trx
      .selectFrom("ws_stocks")
      .select("id")
      .where("id", "=", item.stockId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();

    await trx
      .updateTable("ws_stocks")
      .set({
        allocated_qty: sql`greatest(coalesce(allocated_qty, 0) - ${item.qty}, 0)`,
        in_transit_qty: sql`coalesce(in_transit_qty, 0) + ${item.qty}`,
        updated_by: updatedBy,
        updated_at: new Date(),
      })
      .where("id", "=", item.stockId)
      .execute();
  }
}

// Fulfill: finalize — the in-transit qty is consumed for good, so it comes
// off both in_transit_qty (the "in flight" bucket) and qty (the source
// stock's on-hand total). Same batch-transaction + row-lock treatment.
export async function finalizeInTransitInTrx(trx: Transaction<DB>, items: StockDelta[], updatedBy: number): Promise<void> {
  const toApply = items.filter((i) => i.qty !== 0);
  if (!toApply.length) return;

  for (const item of toApply) {
    await trx
      .selectFrom("ws_stocks")
      .select("id")
      .where("id", "=", item.stockId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();

    await trx
      .updateTable("ws_stocks")
      .set({
        in_transit_qty: sql`greatest(coalesce(in_transit_qty, 0) - ${item.qty}, 0)`,
        qty: sql`greatest(qty - ${item.qty}, 0)`,
        updated_by: updatedBy,
        updated_at: new Date(),
      })
      .where("id", "=", item.stockId)
      .execute();
  }
}

// Cancel: release whatever bucket the order had progressed to back to
// available stock. `fromField` is either "allocated_qty" or "in_transit_qty"
// depending on how far the order got before it was cancelled (decided by
// the caller — see stock.internal.ts's cancelStock, which always passes
// "allocated_qty" since this lifecycle's transition map makes cancel
// unreachable from shipped/fulfilled) — never touches `qty` itself (that's
// only consumed at fulfill).
export async function releaseHeldQtyInTrx(
  trx: Transaction<DB>,
  items: StockDelta[],
  fromField: "allocated_qty" | "in_transit_qty",
  updatedBy: number,
): Promise<void> {
  const toApply = items.filter((i) => i.qty !== 0);
  if (!toApply.length) return;

  for (const item of toApply) {
    await trx
      .selectFrom("ws_stocks")
      .select("id")
      .where("id", "=", item.stockId)
      .where("deleted_at", "is", null)
      .forUpdate()
      .executeTakeFirst();

    await trx
      .updateTable("ws_stocks")
      .set({
        [fromField]: sql`greatest(coalesce(${sql.ref(fromField)}, 0) - ${item.qty}, 0)`,
        updated_by: updatedBy,
        updated_at: new Date(),
      })
      .where("id", "=", item.stockId)
      .execute();
  }
}

