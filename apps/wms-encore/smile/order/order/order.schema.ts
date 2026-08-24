// Zod schemas for the order lifecycle — only the fields create + the
// transition endpoints need, not a full port of apps/main's DTOs.
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
