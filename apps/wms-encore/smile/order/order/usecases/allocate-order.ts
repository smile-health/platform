// Use case: allocate stock against a pending order. runAllocate() is the
// "allocating" state's "applying" actor body in ../order.status-machine.ts's
// single order-lifecycle machine (which the /allocate endpoint in
// order.controller.ts drives via transitionOrder) — this file only holds
// the side effects of that transition (the inventory RPC, the item-level
// allocation write, and the publish). The status write itself is
// centralized in order.status-machine.ts's commitStatus; this function just
// returns which extra ws_orders columns it needs (is_allocated).
//
// smile/inventory owns its stock mutation as ITS OWN atomic unit — no
// transaction is shared across services (a shared db.transaction() across
// services was an earlier pass's anti-pattern: couples their schemas/
// transactions, breaks the moment they're on separate databases).
//
// ACCEPTED TRADE-OFF: this is two separate commits, not one atomic
// cross-service transaction. If the inventory RPC succeeds but the status
// write then fails or loses the compare-and-set race to a concurrent
// transition, there is a narrow window where inventory's side has already
// moved but the order doesn't reflect it. Closing that fully needs a saga/
// compensating-action step — out of scope for this pass; commitStatus
// throws clearly (via APIError.aborted) when the guarded update doesn't
// apply, rather than silently pretending the transition succeeded.
import * as repo from "../order.repository";
import { db } from "../../../inventory/db";
import { inventory } from "~encore/clients";
import { orderAllocated } from "../../order.topics";
import type { AllocateOrderRequest } from "../order.schema";
import type { StatusExtra } from "../order.status-machine";

// --- the "allocating" state's "applying" actor body ----------------------
//
// `order` comes from the machine's context — fetched once by
// transitionOrder() before this actor was ever invoked, not re-fetched here.

export async function runAllocate(input: { order: repo.OrderRow; request: AllocateOrderRequest; userId: number }): Promise<StatusExtra> {
  const { order } = input;

  // Real Encore service-to-service RPC — smile/inventory locks + checks +
  // increments ws_stocks.allocated_qty for every item as its own atomic
  // unit. NO ws_transactions row on allocate — legacy doesn't create one
  // either. Throws if any item lacks available stock.
  await inventory.allocateStock({
    orderId: order.id,
    items: input.request.items.map((item) => ({ stockId: item.stock_id, qty: item.allocated_qty })),
    userId: input.userId,
  });

  for (const item of input.request.items) {
    await repo.setItemAllocation(db, order.id, item.material_id, item.allocated_qty, item.stock_id, input.userId);
  }

  await orderAllocated.publish({
    orderId: order.id,
    // order_type_id is immutable once set — no need to re-fetch the row
    // just to read a field this same commit never touches.
    programId: order.order_type_id,
    userId: input.userId,
    items: input.request.items.map((item) => ({ materialId: item.material_id, allocatedQty: item.allocated_qty, stockId: item.stock_id })),
  });

  return { is_allocated: 1 };
}
