// Shared kernel for the order lifecycle — status vocabulary and the
// handful of helpers every transition needs (requireOrder, the item-
// grouping/ledger-line helpers). THE ACTUAL STATE GRAPH — what can follow
// what, and what each transition does — now lives in
// ./order.status-machine.ts as one xstate machine; this file is deliberately
// just the vocabulary + primitives that machine (and create-order.ts, which
// sits before the machine's initial "pending" state) are built on. Split
// out of what used to be one order.service.ts, to match the granularity
// apps/main's own legacy code already uses (order-status-allocate/,
// order-status-ship/, etc. as separate modules).
import * as repo from "./order.repository";

export class OrderNotFoundError extends Error {
  constructor(id: number) {
    super(`Order ${id} not found`);
  }
}

// Status names as rows in ws_order_statuses — resolved to ids at runtime via
// order.repository.findStatusIdByName (this table is reference data seeded
// outside this app, not something wms-encore owns the values of). "pending"
// is this pass's name for the initial post-create state ("created" would
// collide with the `orderCreated` topic name / event vocabulary). There is
// no "draft" state and no "validated" state — "draft" only exists in the
// separate legacy "old smile" system, and "validate" is out of scope for
// this pass (see create-order.ts) — but "confirmed" IS a real transition
// (pending -> confirmed -> allocated), see ./order.status-machine.ts.
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  ALLOCATED: "allocated",
  SHIPPED: "shipped",
  FULFILLED: "fulfilled",
  CANCELLED: "cancelled",
} as const;

// order_type_id values on ws_orders — unlike ORDER_STATUS above, this is
// NOT a name-lookup table on this DB (no ws_order_types table exists in
// core/db.types.ts); it's the same raw numeric FK apps/main's
// common/constants/order.ts ORDER_TYPE hardcodes, reproduced here so this
// service doesn't have to import from apps/main. EXTERMINATION and
// INDEPENDENT_EXTERMINATION are deliberately omitted — apps/main never
// creates a ws_orders row for either (see transaction/services/
// disposal.service.ts): they're disposal/transaction records, not orders,
// so there's nothing for ./usecases/create-order.ts's STATUS_BY_ORDER_TYPE
// to map for them.
export const ORDER_TYPE = {
  REQUEST: 1,
  DISTRIBUTION: 2,
  RETURN: 3,
  CENTRAL_DISTRIBUTION: 4,
  RELOCATION: 7,
} as const;

export async function requireOrder(id: number): Promise<repo.OrderRow> {
  const order = await repo.findById(id);
  if (!order) throw new OrderNotFoundError(id);
  return order;
}

// Shared grouping helper — tech-debt fix for apps/main's order.module.ts
// buildToAllocate/buildToShipped, which duplicated this exact parent/child
// grouping logic twice, differing only in which qty field they read
// (ordered_qty vs allocated_qty; see order.module.ts ~L1999-2090). One
// function, parameterized by the field name, used by both allocate and ship.
export interface GroupableOrderItem {
  material_id: number;
  parent_material_id: number | null;
  [key: string]: unknown;
}

export interface GroupedOrderItem {
  material_id: number;
  qty: number;
  children: Array<{ material_id: number; qty: number }>;
}

export function groupOrderItemsBy<T extends GroupableOrderItem>(items: T[], qtyField: keyof T): GroupedOrderItem[] {
  const parentMap = new Map<number, GroupedOrderItem>();

  for (const item of items) {
    const qty = Number(item[qtyField] ?? 0);

    if (!item.parent_material_id) {
      // Parent row.
      const existing = parentMap.get(item.material_id);
      if (existing) {
        existing.qty = qty;
      } else {
        parentMap.set(item.material_id, { material_id: item.material_id, qty, children: [] });
      }
      continue;
    }

    // Child row — parent may not have been seen yet (grouping is order-independent).
    let parent = parentMap.get(item.parent_material_id);
    if (!parent) {
      parent = { material_id: item.parent_material_id, qty: 0, children: [] };
      parentMap.set(item.parent_material_id, parent);
    }

    const existingChild = parent.children.find((c) => c.material_id === item.material_id);
    if (existingChild) {
      existingChild.qty += qty;
    } else {
      parent.children.push({ material_id: item.material_id, qty });
    }
  }

  return Array.from(parentMap.values());
}

// Converts order-item rows into the plain {stockId, qty} shape
// smile/inventory's endpoints take as RPC input — inventory is only ever
// told what it needs, it never queries ws_order_item_stocks itself. Rows
// with no stock_id yet (never allocated) are dropped, not passed as null.
export function toStockLedgerLines(items: repo.OrderItemRow[]): Array<{ stockId: number; qty: number }> {
  return items.filter((item) => item.stock_id !== null).map((item) => ({ stockId: item.stock_id as number, qty: item.allocated_qty ?? 0 }));
}

export async function getOrder(id: number): Promise<repo.OrderRow> {
  return requireOrder(id);
}

export async function listOrders(filters: repo.OrderListFilters): Promise<{ data: repo.OrderRow[]; total: number }> {
  return repo.findAll(filters);
}
