// Order lifecycle vocabulary + shared helpers. The actual state graph lives
// in ./order.status-machine.ts; this file is just the primitives it (and
// create-order.ts, which precedes the machine's initial "pending" state)
// are built on.
import * as repo from "./order.repository";

export class OrderNotFoundError extends Error {
  constructor(id: number) {
    super(`Order ${id} not found`);
  }
}

// Status names as rows in ws_order_statuses, resolved to ids at runtime via
// order.repository.findStatusIdByName. No "draft" or "validated" state —
// "draft" is a separate legacy system, "validate" is out of scope.
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  ALLOCATED: "allocated",
  SHIPPED: "shipped",
  FULFILLED: "fulfilled",
  CANCELLED: "cancelled",
} as const;

// ws_orders.order_type_id — raw numeric FK, no lookup table on this DB.
// EXTERMINATION/INDEPENDENT_EXTERMINATION omitted: apps/main never creates
// a ws_orders row for either (they're disposal records, not orders).
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

// Shared by allocate/ship — groups parent/child order items, parameterized
// by which qty field to read (ordered_qty vs allocated_qty).
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

// Rows with no stock_id yet (never allocated) are dropped, not passed as null.
export function toStockLedgerLines(items: repo.OrderItemRow[]): Array<{ stockId: number; qty: number }> {
  return items.filter((item) => item.stock_id !== null).map((item) => ({ stockId: item.stock_id as number, qty: item.allocated_qty ?? 0 }));
}

export async function getOrder(id: number): Promise<repo.OrderRow> {
  return requireOrder(id);
}

export async function listOrders(filters: repo.OrderListFilters): Promise<{ data: repo.OrderRow[]; total: number }> {
  return repo.findAll(filters);
}
