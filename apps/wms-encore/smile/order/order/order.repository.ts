// Kysely functions against ws_orders / ws_order_item_stocks / ws_order_statuses.
// smile/order has no db.ts of its own — smile/ is a plain grouping folder
// (not an Encore service), so this cross-service-imports smile/inventory/db.ts,
// the same physical MySQL database, exactly as inventory/material.repository.ts
// does with `../db`. See smile/inventory/db.ts's header comment for why the
// connection lives there instead of at smile/db.ts.
import { db } from "../../inventory/db";
import type { DB, WsOrdersTable, WsOrderItemStocksTable } from "../../../core/db.types";
import type { Selectable, Insertable, Updateable, Kysely, Transaction } from "kysely";

export type OrderRow = Selectable<WsOrdersTable>;
export type OrderItemRow = Selectable<WsOrderItemStocksTable>;

// Either the plain db handle or a live transaction executor — every function
// below that a use-case file (allocate/ship/fulfill/cancel-order.ts) needs
// to call from inside its own `db.transaction()` block takes one of these
// instead of hardcoding `db`, so all their writes land in the same trx as
// the stock mutation and ledger insert.
export type Executor = Kysely<DB> | Transaction<DB>;

// --- Order status lookup -----------------------------------------------------
// ws_orders.order_status_id is a FK into ws_order_statuses; the lifecycle is
// driven by status *name* in order.lifecycle.ts's transition map, so this
// resolves a name to its row id. Small in-process cache since the status
// lookup table is effectively static reference data.
const statusIdCache = new Map<string, number>();

export async function findStatusIdByName(name: string): Promise<number | undefined> {
  const cached = statusIdCache.get(name);
  if (cached !== undefined) return cached;
  const row = await db
    .selectFrom("ws_order_statuses")
    .select("id")
    .where("name", "=", name)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  if (row) statusIdCache.set(name, row.id);
  return row?.id;
}

export async function findStatusNameById(id: number): Promise<string | undefined> {
  const row = await db
    .selectFrom("ws_order_statuses")
    .select("name")
    .where("id", "=", id)
    .executeTakeFirst();
  return row?.name ?? undefined;
}

// --- Orders -------------------------------------------------------------------

export async function findById(id: number): Promise<OrderRow | undefined> {
  return db.selectFrom("ws_orders").selectAll().where("id", "=", id).where("deleted_at", "is", null).executeTakeFirst() as Promise<
    OrderRow | undefined
  >;
}

export interface OrderListFilters {
  limit: number;
  page: number;
  customerId?: number;
  vendorId?: number;
  orderStatusId?: number;
}

export async function findAll(filters: OrderListFilters): Promise<{ data: OrderRow[]; total: number }> {
  let query = db.selectFrom("ws_orders").where("deleted_at", "is", null);
  if (filters.customerId !== undefined) query = query.where("customer_id", "=", filters.customerId);
  if (filters.vendorId !== undefined) query = query.where("vendor_id", "=", filters.vendorId);
  if (filters.orderStatusId !== undefined) query = query.where("order_status_id", "=", filters.orderStatusId);

  const [data, countRow] = await Promise.all([
    query
      .selectAll()
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit)
      .execute(),
    query.select((eb) => eb.fn.countAll().as("total")).executeTakeFirstOrThrow(),
  ]);

  return { data: data as OrderRow[], total: Number(countRow.total) };
}

export async function create(
  data: Omit<Insertable<WsOrdersTable>, "created_by" | "updated_by">,
  createdBy: number,
): Promise<number> {
  const result = await db
    .insertInto("ws_orders")
    .values({ ...data, created_by: createdBy, updated_by: createdBy })
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function updateStatus(
  executor: Executor,
  id: number,
  orderStatusId: number,
  updatedBy: number,
  extra: Updateable<WsOrdersTable> = {},
): Promise<void> {
  await executor
    .updateTable("ws_orders")
    .set({ ...extra, order_status_id: orderStatusId, updated_by: updatedBy, updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}

// Compare-and-set status write: succeeds only if the order's status is still
// `fromStatusId` at write time. This replaces the cross-service `SELECT ...
// FOR UPDATE` lock that used to be held for the duration of a shared
// db.transaction() spanning smile/order and smile/inventory — now that each
// service commits its own transaction independently (the caller in
// allocate/ship/fulfill/cancel-order.ts calls
// smile/inventory's endpoints, awaits them, THEN writes this status change),
// there is no lock to hold across the RPC boundary, only a local guard
// against someone else having moved this order's status in between this
// function's caller loading the order and calling this. Returns false (0
// rows updated) if the guard didn't hold — the caller must treat that as
// "order was concurrently transitioned by something else" and must NOT
// assume its own transition took effect.
export async function updateStatusGuarded(
  id: number,
  fromStatusId: number,
  toStatusId: number,
  updatedBy: number,
  extra: Updateable<WsOrdersTable> = {},
): Promise<boolean> {
  const result = await db
    .updateTable("ws_orders")
    .set({ ...extra, order_status_id: toStatusId, updated_by: updatedBy, updated_at: new Date() })
    .where("id", "=", id)
    .where("order_status_id", "=", fromStatusId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return Number(result.numUpdatedRows) > 0;
}

// --- Order items ---------------------------------------------------------------

export async function createItems(
  orderId: number,
  items: Array<{ material_id: number; ordered_qty: number; parent_material_id?: number | null }>,
  createdBy: number,
): Promise<void> {
  if (!items.length) return;
  await db
    .insertInto("ws_order_item_stocks")
    .values(
      items.map((item) => ({
        order_id: orderId,
        material_id: item.material_id,
        parent_material_id: item.parent_material_id ?? null,
        ordered_qty: item.ordered_qty,
        created_by: createdBy,
        updated_by: createdBy,
      })),
    )
    .execute();
}

// Used by cancel: zeroes allocated_qty on every order-item-stock row for
// this order once the held stock has been released back (see
// cancel-order.ts's cancelOrder) — mirrors legacy's
// updateOrderItemStockCancelById({ allocated_qty: 0, ... }).
export async function clearItemAllocations(executor: Executor, orderId: number, updatedBy: number): Promise<void> {
  await executor
    .updateTable("ws_order_item_stocks")
    .set({ allocated_qty: 0, updated_by: updatedBy, updated_at: new Date() })
    .where("order_id", "=", orderId)
    .where("deleted_at", "is", null)
    .execute();
}

export async function findItemsByOrderId(executor: Executor, orderId: number): Promise<OrderItemRow[]> {
  return executor
    .selectFrom("ws_order_item_stocks")
    .selectAll()
    .where("order_id", "=", orderId)
    .where("deleted_at", "is", null)
    .execute() as Promise<OrderItemRow[]>;
}

// Used by allocate: writes allocated_qty + stock_id per item (matched by material_id).
export async function setItemAllocation(
  executor: Executor,
  orderId: number,
  materialId: number,
  allocatedQty: number,
  stockId: number,
  updatedBy: number,
): Promise<void> {
  await executor
    .updateTable("ws_order_item_stocks")
    .set({ allocated_qty: allocatedQty, stock_id: stockId, updated_by: updatedBy, updated_at: new Date() })
    .where("order_id", "=", orderId)
    .where("material_id", "=", materialId)
    .execute();
}
