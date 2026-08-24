// Use case: confirm a pending order. runConfirm() is the "confirming"
// state's "applying" actor body in ../order.status-machine.ts's single
// order-lifecycle machine (which the /confirm endpoint in
// order.controller.ts drives via transitionOrder) — this file only holds
// the side effects of that transition. No inventory involvement at all —
// legacy's order-status-confirm module never touches stock either. The
// status write itself (and what extra columns it sets) is centralized in
// order.status-machine.ts's commitStatus — this function just returns
// which extra columns it needs, if any.
import * as repo from "../order.repository";
import { orderConfirmed } from "../../order.topics";
import type { StatusExtra } from "../order.status-machine";

// --- the "confirming" state's "applying" actor body -----------------------
//
// `order` comes from the machine's context — fetched once by
// transitionOrder() before this actor was ever invoked, not re-fetched here.

export async function runConfirm(input: { order: repo.OrderRow; userId: number }): Promise<StatusExtra> {
  const { order } = input;

  // order_type_id is immutable once set — no need to re-fetch the row just
  // to read a field this same commit never touches.
  await orderConfirmed.publish({ orderId: order.id, programId: order.order_type_id, userId: input.userId });

  return {};
}
