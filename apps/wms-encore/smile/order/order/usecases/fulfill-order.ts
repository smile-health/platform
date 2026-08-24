// "fulfillStock" actor body for ../order.status-machine.ts's "fulfill"
// state. Side effects only (inventory RPC) — status write and topic
// publish happen centrally in transitionOrder. See allocate-order.ts's
// header for the shared two-commit trade-off.
import * as repo from "../order.repository";
import { db } from "../../../inventory/db";
import { inventory } from "~encore/clients";
import { toStockLedgerLines } from "../order.lifecycle";
import type { StatusExtra } from "../order.status-machine";

export async function runFulfill(input: { order: repo.OrderRow; userId: number }): Promise<StatusExtra> {
  const { order } = input;
  const items = await repo.findItemsByOrderId(db, order.id);

  await inventory.fulfillStock({
    orderId: order.id,
    items: toStockLedgerLines(items),
    ledgerContext: { activityId: order.activity_id ?? null, entityId: order.customer_id, deviceType: order.device_type ?? null },
    userId: input.userId,
  });

  return {};
}
