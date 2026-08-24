// Zod schemas for the order lifecycle (smile/order/order/). Field set is a
// deliberately small slice of ws_orders/ws_order_item_stocks — only what
// create + the transition endpoints need — not a full port of apps/main's
// order request DTOs (see OUT OF SCOPE note in order.controller.ts).
//
// NOTE (scope correction): "validate" is intentionally NOT modeled here.
// There is no validate transition/status/endpoint in this pass — see
// order.lifecycle.ts's transition map for details. orderValidated stays
// defined in ../order.topics.ts (untouched) but is never published from here.
import { z } from "zod";

export const CreateOrderItemSchema = z.object({
  material_id: z.number().positive(),
  ordered_qty: z.number().positive(),
});

export const CreateOrderRequestSchema = z.object({
  customer_id: z.number().positive(),
  vendor_id: z.number().positive(),
  order_type_id: z.number().positive(),
  notes: z.string().max(1000).nullish(),
  items: z.array(CreateOrderItemSchema).min(1),
});

export const AllocateOrderItemSchema = z.object({
  material_id: z.number().positive(),
  allocated_qty: z.number().nonnegative(),
  stock_id: z.number().positive(),
});

export const AllocateOrderRequestSchema = z.object({
  items: z.array(AllocateOrderItemSchema).min(1),
});

export const ShipOrderRequestSchema = z.object({});

export const FulfillOrderRequestSchema = z.object({});

export const CancelOrderRequestSchema = z.object({
  order_cancel_reason_id: z.number().positive().nullish(),
  reason: z.string().max(500).nullish(),
});

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type AllocateOrderRequest = z.infer<typeof AllocateOrderRequestSchema>;
export type CancelOrderRequest = z.infer<typeof CancelOrderRequestSchema>;
