// Use case: create a new order, for ANY order type. Sits before the
// order-status machine's initial "pending" state (see
// ../order.status-machine.ts) — there's no prior status to transition from,
// so this is a plain sequence, not part of that state chart.
//
// All 5 order types funnel through here (not one file per type) — scanned
// directly from apps/main's own create() methods, the only thing that
// actually differs between them is which status they land on:
//
//   REQUEST               -> pending    (apps/main order.module.ts)
//   DISTRIBUTION          -> allocated  (apps/main order-allocation.module.ts — creates DISTRIBUTION orders despite the name)
//   CENTRAL_DISTRIBUTION  -> shipped    (apps/main order-central-delivery.module.ts)
//   RETURN                -> allocated  (apps/main order-return.module.ts)
//   RELOCATION            -> pending    (apps/main order-relocation.module.ts)
//
// Merged into one file rather than one usecases/create-*-order.ts per
// sibling order-type folder (order-allocation/, order-central-delivery/,
// order-return/, order-relocation/) — this is plain CRUD with the exact
// same insert/publish shape every time, only the target status differs, so
// 5 near-identical files would just be duplication with no real separation
// of concerns.
//
// EXTERMINATION / INDEPENDENT_EXTERMINATION are deliberately NOT included
// — apps/main never creates a ws_orders row for either (see
// transaction/services/disposal.service.ts): they're disposal/transaction
// records, not orders.
//
// Scaffolding-stage port for all 5 — apps/main's real versions of
// DISTRIBUTION/CENTRAL_DISTRIBUTION/RETURN/RELOCATION also write
// order-item-stock/order-history/order-comment rows, vendor stock
// transactions, contracts, and notification/coldstorage publishing; out of
// scope here, same as those folders' controllers being scaffold-only today.
import { APIError } from "encore.dev/api";
import * as repo from "../order.repository";
import { orderCreated } from "../../order.topics";
import type { CreateOrderRequest } from "../order.schema";
import { ORDER_STATUS, ORDER_TYPE, requireOrder } from "../order.lifecycle";

const STATUS_BY_ORDER_TYPE: Partial<Record<number, string>> = {
  [ORDER_TYPE.REQUEST]: ORDER_STATUS.PENDING,
  [ORDER_TYPE.DISTRIBUTION]: ORDER_STATUS.ALLOCATED,
  [ORDER_TYPE.CENTRAL_DISTRIBUTION]: ORDER_STATUS.SHIPPED,
  [ORDER_TYPE.RETURN]: ORDER_STATUS.ALLOCATED,
  [ORDER_TYPE.RELOCATION]: ORDER_STATUS.PENDING,
};

export async function createOrder(request: CreateOrderRequest, userId: number): Promise<repo.OrderRow> {
  const targetStatus = STATUS_BY_ORDER_TYPE[request.order_type_id];
  if (!targetStatus) {
    throw APIError.invalidArgument(
      `order_type_id ${request.order_type_id} has no known creation path (expected one of: ${Object.keys(STATUS_BY_ORDER_TYPE).join(", ")})`,
    );
  }

  const orderId = await insertOrder(request, targetStatus, userId);
  await insertOrderItems(orderId, request, userId);
  await publishOrderCreated(orderId, request, userId);
  return requireOrder(orderId);
}

// --- steps ------------------------------------------------------------

async function insertOrder(request: CreateOrderRequest, targetStatus: string, userId: number): Promise<number> {
  const statusId = await repo.findStatusIdByName(targetStatus);
  if (statusId === undefined) {
    throw APIError.internal(`Order status "${targetStatus}" is not seeded in ws_order_statuses`);
  }
  return repo.create(
    {
      customer_id: request.customer_id,
      vendor_id: request.vendor_id,
      order_type_id: request.order_type_id,
      order_status_id: statusId,
      notes: request.notes ?? null,
      total_order_items: request.items.length,
    },
    userId,
  );
}

async function insertOrderItems(orderId: number, request: CreateOrderRequest, userId: number): Promise<void> {
  await repo.createItems(
    orderId,
    request.items.map((item) => ({ material_id: item.material_id, ordered_qty: item.ordered_qty })),
    userId,
  );
}

// NOTE: OrderBaseEvent.programId has no real analog on ws_orders (no
// program/workspace column on this table) — order_type_id is used as a
// stand-in below purely to satisfy the required field on the shared event
// shape (../order.topics.ts, out of scope to change). Flagged rather than
// silently guessed; revisit once a real program scoping story exists here.
async function publishOrderCreated(orderId: number, request: CreateOrderRequest, userId: number): Promise<void> {
  await orderCreated.publish({
    orderId,
    programId: request.order_type_id,
    userId,
    entityId: request.vendor_id,
    items: request.items.map((item) => ({ materialId: item.material_id, quantity: item.ordered_qty })),
  });
}
