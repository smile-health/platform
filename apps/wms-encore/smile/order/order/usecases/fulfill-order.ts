// Use case: fulfill a shipped order. runFulfill() is the "fulfilling"
// state's "applying" actor body in ../order.status-machine.ts's single
// order-lifecycle machine (which the /fulfill endpoint in
// order.controller.ts drives via transitionOrder) — this file only holds
// the side effects of that transition. The status write itself is
// centralized in order.status-machine.ts's commitStatus; this function just
// returns which extra ws_orders columns it needs (none, here). See
// allocate-order.ts's header for the shared shape/trade-off every
// cross-service transition in this group uses.
import * as repo from "../order.repository";
import { db } from "../../../inventory/db";
import { inventory } from "~encore/clients";
import { orderFulfilled } from "../../order.topics";
import { toStockLedgerLines } from "../order.lifecycle";
import type { StatusExtra } from "../order.status-machine";

// --- the "fulfilling" state's "applying" actor body -----------------------
//
// `order` comes from the machine's context — fetched once by
// transitionOrder() before this actor was ever invoked, not re-fetched here.

export async function runFulfill(input: { order: repo.OrderRow; userId: number }): Promise<StatusExtra> {
  const { order } = input;
  const items = await repo.findItemsByOrderId(db, order.id);

  // Real Encore service-to-service RPC — finalizes in-transit -> consumed
  // for every affected line and inserts one ws_transactions row per line
  // (transaction_type_id = RECEIPTS, order_id set) — its own atomic unit.
  await inventory.fulfillStock({
    orderId: order.id,
    items: toStockLedgerLines(items),
    ledgerContext: { activityId: order.activity_id ?? null, entityId: order.customer_id, deviceType: order.device_type ?? null },
    userId: input.userId,
  });

  // order_type_id is immutable once set — no need to re-fetch the row just
  // to read a field this same commit never touches.
  await orderFulfilled.publish({ orderId: order.id, programId: order.order_type_id, userId: input.userId });

  return {};
}
