// "allocateStock" actor body for ../order.status-machine.ts's "allocate"
// state. Side effects only (inventory RPC + item allocation write) —
// status write and topic publish happen centrally in transitionOrder.
//
// Two separate commits, not one atomic cross-service transaction: if the
// RPC succeeds but the status write then fails, transitionOrder throws
// APIError.aborted rather than pretending the transition succeeded.
import * as repo from "../order.repository";
import { db } from "../../../inventory/db";
import { inventory } from "~encore/clients";
import type { AllocateOrderRequest } from "../order.schema";
import type { StatusExtra } from "../order.status-machine";

export async function runAllocate(input: { order: repo.OrderRow; request: AllocateOrderRequest; userId: number }): Promise<StatusExtra> {
  const { order } = input;

  await inventory.allocateStock({
    orderId: order.id,
    items: input.request.items.map((item) => ({ stockId: item.stock_id, qty: item.allocated_qty })),
    userId: input.userId,
  });

  for (const item of input.request.items) {
    await repo.setItemAllocation(db, order.id, item.material_id, item.allocated_qty, item.stock_id, input.userId);
  }

  return { is_allocated: 1 };
}
