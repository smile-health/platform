// "releaseStock" actor body for ../order.status-machine.ts's "cancel"
// state (reachable from PENDING/CONFIRMED/ALLOCATED). Side effects only
// (inventory RPC + clearing local allocations) — status write and topic
// publish happen centrally in transitionOrder.
import * as repo from "../order.repository";
import { db } from "../../../inventory/db";
import { inventory } from "~encore/clients";
import type { CancelOrderRequest } from "../order.schema";
import { toStockLedgerLines } from "../order.lifecycle";
import type { StatusExtra } from "../order.status-machine";

// order_type_id values allowed to write a ws_transactions ledger row on
// cancel — ported from apps/main's order-status-cancel.module.ts.
const ALLOWED_ORDER_TYPES_FOR_CANCEL_TRANSACTION: readonly number[] = [1, 2, 3, 7];

export async function runCancel(input: { order: repo.OrderRow; request: CancelOrderRequest; userId: number }): Promise<StatusExtra> {
  const { order } = input;
  const items = await repo.findItemsByOrderId(db, order.id);
  const recordLedger = ALLOWED_ORDER_TYPES_FOR_CANCEL_TRANSACTION.includes(order.order_type_id);

  await inventory.cancelStock({
    orderId: order.id,
    items: toStockLedgerLines(items),
    ledgerContext: { activityId: order.activity_id ?? null, entityId: order.vendor_id, deviceType: order.device_type ?? null },
    recordLedger,
    userId: input.userId,
  });

  await repo.clearItemAllocations(db, order.id, input.userId);

  return { order_cancel_reason_id: input.request.order_cancel_reason_id ?? null };
}
