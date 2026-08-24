// Internal-only (expose: false) Encore endpoints that let smile/order call
// into smile/inventory as a real service-to-service RPC instead of importing
// stock.repository.ts's *InTrx functions directly across the service
// boundary (the anti-pattern an earlier pass introduced: a shared
// db.transaction() spanning two services, coupling their schemas/txns
// together — breaks the moment they're on separate databases).
//
// Thin wrapper only — parse input, call stock.service.ts, map errors,
// return. All the actual orchestration (transactions, loops, ledger writes)
// lives in stock.service.ts; this file being reachable via Encore RPC (which
// requires an api() endpoint) doesn't mean it should hold business logic,
// same as order.controller.ts wraps each order use-case file. Each
// allocate/ship/fulfill/cancel-order.ts use case awaits these and only
// writes the order's own status AFTER they succeed; see allocate-order.ts's
// header comment for the accepted narrow inconsistency window this implies.
import { api, APIError } from "encore.dev/api";
import * as service from "./stock.service";
import { InsufficientStockError } from "./stock.repository";

type VoidResult = { status: "success"; data: null };

export const allocateStock = api(
  { expose: false, auth: false },
  async (input: service.AllocateStockInput): Promise<VoidResult> => {
    try {
      await service.allocateStock(input);
    } catch (err) {
      if (err instanceof InsufficientStockError) {
        throw APIError.failedPrecondition(err.message);
      }
      throw err;
    }
    return { status: "success", data: null };
  },
);

export const shipStock = api({ expose: false, auth: false }, async (input: service.ShipStockInput): Promise<VoidResult> => {
  await service.shipStock(input);
  return { status: "success", data: null };
});

export const fulfillStock = api({ expose: false, auth: false }, async (input: service.FulfillStockInput): Promise<VoidResult> => {
  await service.fulfillStock(input);
  return { status: "success", data: null };
});

export const cancelStock = api({ expose: false, auth: false }, async (input: service.CancelStockInput): Promise<VoidResult> => {
  await service.cancelStock(input);
  return { status: "success", data: null };
});
