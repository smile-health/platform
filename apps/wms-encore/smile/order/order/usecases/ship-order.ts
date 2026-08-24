// "shipStock" actor body for ../order.status-machine.ts's "ship" state.
// Side effects only (inventory RPC) — status write and topic publish
// happen centrally in transitionOrder. See allocate-order.ts's header for
// the shared two-commit trade-off.
import * as repo from "../order.repository";
import { db } from "../../../inventory/db";
import { inventory } from "~encore/clients";
import { groupOrderItemsBy, toStockLedgerLines } from "../order.lifecycle";
import type { StatusExtra } from "../order.status-machine";

export async function runShip(input: { order: repo.OrderRow; userId: number }): Promise<StatusExtra> {
  const { order } = input;
  const items = await repo.findItemsByOrderId(db, order.id);

  // Parity with legacy buildToShipped — documents the parent/child shape
  // before flattening into the {stockId, qty} lines the RPC takes.
  groupOrderItemsBy(
    items as unknown as Array<{ material_id: number; parent_material_id: number | null; allocated_qty: number | null }>,
    "allocated_qty",
  );

  await inventory.shipStock({
    orderId: order.id,
    items: toStockLedgerLines(items),
    ledgerContext: { activityId: order.activity_id ?? null, entityId: order.vendor_id, deviceType: order.device_type ?? null },
    userId: input.userId,
  });

  return {};
}
