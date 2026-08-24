// Demonstrates the real publish points — separate from
// order-status.controller.ts's generated stubs so those stay untouched.
// TODO: once order-status.controller.ts's real endpoints are ported, call
// these publishes from inside the actual status-transition handlers
// (mirrors legacy OrderStatus*Publisher classes in apps/main).

import { api } from "encore.dev/api";
import {
  orderValidated,
  orderConfirmed,
  orderAllocated,
  orderShipped,
  orderFulfilled,
  orderCancelled,
} from "../order.topics";

export const validateScaffold = api(
  { method: "POST", path: "/api/v1/main/orders/_scaffold-order-status-validate", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    await orderValidated.publish({ orderId: 0, programId: 0 });
    return { status: "success", data: null };
  },
);

export const confirmScaffold = api(
  { method: "POST", path: "/api/v1/main/orders/_scaffold-order-status-confirm", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    await orderConfirmed.publish({ orderId: 0, programId: 0 });
    return { status: "success", data: null };
  },
);

export const allocateScaffold = api(
  { method: "POST", path: "/api/v1/main/orders/_scaffold-order-status-allocate", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    await orderAllocated.publish({ orderId: 0, programId: 0, items: [] });
    return { status: "success", data: null };
  },
);

export const shipScaffold = api(
  { method: "POST", path: "/api/v1/main/orders/_scaffold-order-status-ship", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    await orderShipped.publish({ orderId: 0, programId: 0 });
    return { status: "success", data: null };
  },
);

export const fulfilledScaffold = api(
  { method: "POST", path: "/api/v1/main/orders/_scaffold-order-status-fulfilled", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    await orderFulfilled.publish({ orderId: 0, programId: 0 });
    return { status: "success", data: null };
  },
);

export const cancelScaffold = api(
  { method: "POST", path: "/api/v1/main/orders/_scaffold-order-status-cancel", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    await orderCancelled.publish({ orderId: 0, programId: 0 });
    return { status: "success", data: null };
  },
);
