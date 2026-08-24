import { Subscription } from "encore.dev/pubsub";
import {
  orderCreated,
  orderAllocated,
  orderShipped,
  orderFulfilled,
  orderCancelled,
  type OrderCreatedEvent,
  type OrderAllocatedEvent,
  type OrderBaseEvent,
} from "../order/order.topics";

// ARCHITECTURE CHANGE: stock mutation for allocate/ship/fulfilled/cancel
// moved OUT of these subscriptions and into smile/inventory's own
// synchronous endpoints (stock.internal.ts / stock.service.ts), called via
// the generated Encore client (~encore/clients) from each order use-case
// file (allocate-order.ts, ship-order.ts, fulfill-order.ts, cancel-order.ts)
// — synchronously, awaited, alongside the order-status write and (for
// ship/fulfilled/cancel) the ws_transactions ledger insert. This matches
// the real legacy behavior (apps/main's order-status-{allocate,ship,
// fulfilled,cancel} repositories/modules do everything in ONE
// request-scoped `c.var.trx` — there is no async worker in that path) and
// fixes a real bug the previous async-only design had: a throw in an
// async subscriber can no longer roll back an order status that's already
// committed, and there was no ledger row at all for order-driven stock
// movement.
//
// These handlers are kept only as documented no-ops / placeholders for a
// genuinely async concern that isn't built yet (e.g. notifications) — they
// must NOT call into stockRepo's mutating functions any more, or the
// mutation already done synchronously by smile/inventory's endpoints would
// be double-applied. The topics still publish (after commit) for exactly
// this kind of future consumer.

const onOrderCreated = async (event: OrderCreatedEvent) => {
  // No-op, matching legacy behavior — see prior note: no reservation bucket
  // exists on ws_stocks for order create/validate/confirm. Unaffected by
  // the stock-mutation-ownership change above.
  void event;
};

const onOrderAllocated = async (event: OrderAllocatedEvent) => {
  // No-op: ws_stocks.allocated_qty is now incremented synchronously inside
  // allocate-order.ts's allocateOrder, in the same trx as the order-status
  // write. Kept as a placeholder for a future async-only concern (e.g. a
  // notification/audit-log side effect) — must NOT call
  // stockRepo.allocateStocks here, that would double-apply the allocation.
  void event;
};

const onOrderShipped = async (event: OrderBaseEvent) => {
  // No-op: allocated -> in-transit stock move + the ws_transactions ISSUES
  // ledger row are now written synchronously inside ship-order.ts's
  // shipOrder, in the same trx as the order-status write. Placeholder only.
  void event;
};

const onOrderFulfilled = async (event: OrderBaseEvent) => {
  // No-op: in-transit finalization + the ws_transactions RECEIPTS ledger
  // row are now written synchronously inside fulfill-order.ts's
  // fulfillOrder, in the same trx as the order-status write. Placeholder only.
  void event;
};

const onOrderCancelled = async (event: OrderBaseEvent) => {
  // No-op: releasing held allocated_qty + the gated ws_transactions
  // reversal row are now written synchronously inside cancel-order.ts's
  // cancelOrder, in the same trx as the order-status write. Placeholder only.
  void event;
};

new Subscription(orderCreated, "inventory-reserve-on-order-created", { handler: onOrderCreated });
new Subscription(orderAllocated, "inventory-commit-on-order-allocated", { handler: onOrderAllocated });
new Subscription(orderShipped, "inventory-transit-on-order-shipped", { handler: onOrderShipped });
new Subscription(orderFulfilled, "inventory-finalize-on-order-fulfilled", { handler: onOrderFulfilled });
new Subscription(orderCancelled, "inventory-release-on-order-cancelled", { handler: onOrderCancelled });
