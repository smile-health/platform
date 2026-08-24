import { Topic } from "encore.dev/pubsub";

// Mirrors the pattern in wms-encore/messaging/topics.ts (e.g. wasteBagCreated):
// scm/order publishes domain events here; other scm services subscribe
// without ever importing from order/ directly, keeping the dependency
// one-way (order -> topic -> subscriber), matching how wms already wires
// waste-bag-audit-trail off of the waste-bag-* topics.
//
// These aren't invented — they port 1:1 from packages/lib/rabbitmq/topic.ts's
// existing TOPIC.ORDER_STATUS_ORDER_* constants (RabbitMQ today), same as
// wms's milestone-per-topic split for waste bags. One Topic per status
// transition, not one generic "OrderStatusChanged" — matches both the
// existing RabbitMQ taxonomy and wms's own established pattern.

export interface OrderBaseEvent {
  orderId: number;
  programId: number;
  userId?: number;
  /** Carried through from the legacy publisher's client_key, for idempotency/tracing. */
  clientKey?: string;
}

export interface OrderCreatedEvent extends OrderBaseEvent {
  entityId: number;
  items: Array<{ materialId: number; quantity: number }>;
}
export const orderCreated = new Topic<OrderCreatedEvent>("order-created", {
  deliveryGuarantee: "at-least-once",
});

// Ports TOPIC.ORDER_STATUS_ORDER_VALIDATED ("order.status.order.validated")
export const orderValidated = new Topic<OrderBaseEvent>("order-validated", {
  deliveryGuarantee: "at-least-once",
});

// Ports TOPIC.ORDER_STATUS_ORDER_CONFIRM ("order.status.order.confirm")
export const orderConfirmed = new Topic<OrderBaseEvent>("order-confirmed", {
  deliveryGuarantee: "at-least-once",
});

// Ports TOPIC.ORDER_STATUS_ORDER_ALLOCATE ("order.status.order.allocate")
export interface OrderAllocatedEvent extends OrderBaseEvent {
  items: Array<{ materialId: number; allocatedQty: number; stockId: number }>;
}
export const orderAllocated = new Topic<OrderAllocatedEvent>("order-allocated", {
  deliveryGuarantee: "at-least-once",
});

// Ports TOPIC.ORDER_STATUS_ORDER_SHIPPED ("order.status.order.shipped")
export const orderShipped = new Topic<OrderBaseEvent>("order-shipped", {
  deliveryGuarantee: "at-least-once",
});

// Ports TOPIC.ORDER_STATUS_ORDER_FULFILLED ("order.status.order.fullfilled" [sic, legacy typo])
export const orderFulfilled = new Topic<OrderBaseEvent>("order-fulfilled", {
  deliveryGuarantee: "at-least-once",
});

// Ports TOPIC.ORDER_STATUS_ORDER_CANCEL ("order.status.order.cancel")
export interface OrderCancelledEvent extends OrderBaseEvent {
  reason?: string;
}
export const orderCancelled = new Topic<OrderCancelledEvent>("order-cancelled", {
  deliveryGuarantee: "at-least-once",
});

// Ports TOPIC.ORDER_DROPPING_CREATED ("order-dropping.created") — the
// allocation/central-delivery "drop" flow (see legacy
// base.order-dropping.publisher.ts), distinct from plain order creation.
export interface OrderDroppingCreatedEvent extends OrderBaseEvent {
  isAllocated: boolean;
}
export const orderDroppingCreated = new Topic<OrderDroppingCreatedEvent>("order-dropping-created", {
  deliveryGuarantee: "at-least-once",
});
