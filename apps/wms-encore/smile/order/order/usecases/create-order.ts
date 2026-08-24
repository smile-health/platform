// Creates an order for any of the 5 order types — precedes
// order.status-machine.ts's initial "pending" state, so it's a plain
// sequence, not part of that chart. Only the target status differs per
// type (STATUS_BY_ORDER_TYPE below); EXTERMINATION/INDEPENDENT_EXTERMINATION
// are omitted since apps/main never creates a ws_orders row for either.
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

// order_type_id stands in for programId — ws_orders has no program column.
async function publishOrderCreated(orderId: number, request: CreateOrderRequest, userId: number): Promise<void> {
  await orderCreated.publish({
    orderId,
    programId: request.order_type_id,
    userId,
    entityId: request.vendor_id,
    items: request.items.map((item) => ({ materialId: item.material_id, quantity: item.ordered_qty })),
  });
}
