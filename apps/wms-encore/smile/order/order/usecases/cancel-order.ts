// Use case: cancel an order. runCancel() is the "cancelling" state's
// "applying" actor body in ../order.status-machine.ts's single
// order-lifecycle machine (which the /cancel endpoint in
// order.controller.ts drives via transitionOrder — cancel is reachable
// from pending, confirmed, AND allocated, and the machine falls back to
// whichever of those it came from if either of cancel's steps fails) —
// this file only holds the side effects of that transition. The status
// write itself is centralized in order.status-machine.ts's commitStatus;
// this function just returns which extra ws_orders columns it needs
// (order_cancel_reason_id).
import * as repo from "../order.repository";
import { db } from "../../../inventory/db";
import { inventory } from "~encore/clients";
import { orderCancelled } from "../../order.topics";
import type { CancelOrderRequest } from "../order.schema";
import { toStockLedgerLines } from "../order.lifecycle";
import type { StatusExtra } from "../order.status-machine";

// order_type_id values allowed to write a ws_transactions ledger row on
// cancel — ported verbatim from apps/main's order-status-cancel.module.ts's
// `allowedTypeUpdateTransaction` ([ORDER_TYPE.REQUEST,
// ORDER_TYPE.DISTRIBUTION, ORDER_TYPE.RETURN, ORDER_TYPE.RELOCATION]).
// Central distribution / extermination order types are deliberately
// excluded, matching legacy.
const ALLOWED_ORDER_TYPES_FOR_CANCEL_TRANSACTION: readonly number[] = [1, 2, 3, 7];

// --- the "cancelling" state's "applying" actor body -----------------------
//
// `order` comes from the machine's context — fetched once by
// transitionOrder() before this actor was ever invoked, not re-fetched here.

export async function runCancel(input: { order: repo.OrderRow; request: CancelOrderRequest; userId: number }): Promise<StatusExtra> {
  const { order } = input;
  const items = await repo.findItemsByOrderId(db, order.id);
  const recordLedger = ALLOWED_ORDER_TYPES_FOR_CANCEL_TRANSACTION.includes(order.order_type_id);

  // Real Encore service-to-service RPC — releases held allocated_qty back
  // (cancel is only ever legal from pending/confirmed/allocated — never
  // shipped/fulfilled — so there's never an in-transit bucket to unwind
  // here), and conditionally inserts the reversal ws_transactions row —
  // its own atomic unit.
  await inventory.cancelStock({
    orderId: order.id,
    items: toStockLedgerLines(items),
    ledgerContext: { activityId: order.activity_id ?? null, entityId: order.vendor_id, deviceType: order.device_type ?? null },
    recordLedger,
    userId: input.userId,
  });

  await repo.clearItemAllocations(db, order.id, input.userId);

  // order_type_id is immutable once set — no need to re-fetch the row just
  // to read a field this same commit never touches.
  await orderCancelled.publish({ orderId: order.id, programId: order.order_type_id, userId: input.userId, reason: input.request.reason ?? undefined });

  return { order_cancel_reason_id: input.request.order_cancel_reason_id ?? null };
}
