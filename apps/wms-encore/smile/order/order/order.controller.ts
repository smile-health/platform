// Order lifecycle endpoints (create/read/transition, ws_orders).
//
// DTOs are plain literal interfaces, not zod-inferred/Kysely types —
// Encore's static analyzer requires a literal interface in an api()
// signature; parse with the real zod schema, cast the result to the DTO.
import { api, APIError } from "encore.dev/api";
import { createOrder as createOrderUseCase } from "./usecases/create-order";
import { getOrder as getOrderUseCase, listOrders as listOrdersUseCase, OrderNotFoundError } from "./order.lifecycle";
import { transitionOrder } from "./order.status-machine";
import { CreateOrderRequestSchema, AllocateOrderRequestSchema, CancelOrderRequestSchema } from "./order.schema";

interface CreateOrderItemDto {
  material_id: number;
  ordered_qty: number;
}

interface CreateOrderRequestDto {
  customer_id: number;
  vendor_id: number;
  order_type_id: number;
  notes?: string | null;
  items: CreateOrderItemDto[];
}

interface AllocateOrderItemDto {
  material_id: number;
  allocated_qty: number;
  stock_id: number;
}

interface AllocateOrderRequestDto {
  items: AllocateOrderItemDto[];
}

interface CancelOrderRequestDto {
  order_cancel_reason_id?: number | null;
  reason?: string | null;
}

interface OrderResponseDto {
  id: number;
  customer_id: number;
  vendor_id: number;
  order_type_id: number;
  order_status_id: number;
  notes: string | null;
  is_allocated: number | null;
  order_cancel_reason_id: number | null;
  total_order_items: number | null;
  created_at: Date;
  updated_at: Date;
}

function toApiError(err: unknown): never {
  if (err instanceof OrderNotFoundError) throw APIError.notFound(err.message);
  throw err;
}

function parseOrThrow<T>(
  schema: {
    safeParse: (v: unknown) => { success: boolean; data?: T; error?: { issues: Array<{ path: (string | number)[]; message: string }> } };
  },
  body: unknown,
): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success || parsed.data === undefined) {
    const issues = parsed.error?.issues ?? [];
    throw APIError.invalidArgument(issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
  return parsed.data;
}

// --- Create / read ------------------------------------------------------------

export const createOrder = api(
  { method: "POST", path: "/api/v1/main/orders", auth: false, expose: true },
  async (body: CreateOrderRequestDto): Promise<{ status: "success"; data: OrderResponseDto }> => {
    const request = parseOrThrow(CreateOrderRequestSchema, body);
    // TODO: userId from auth context (hardcoded 0 for now).
    const order = await createOrderUseCase(request, 0);
    return { status: "success", data: order as unknown as OrderResponseDto };
  },
);

export const getOrder = api(
  { method: "GET", path: "/api/v1/main/orders/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: OrderResponseDto }> => {
    try {
      const order = await getOrderUseCase(id);
      return { status: "success", data: order as unknown as OrderResponseDto };
    } catch (err) {
      toApiError(err);
    }
  },
);

export const listOrders = api(
  { method: "GET", path: "/api/v1/main/orders", auth: false, expose: true },
  async (params: {
    limit?: number;
    page?: number;
    customerId?: number;
    vendorId?: number;
    orderStatusId?: number;
  }): Promise<{ status: "success"; data: OrderResponseDto[]; total: number }> => {
    const { data, total } = await listOrdersUseCase({
      limit: params.limit ?? 20,
      page: params.page ?? 1,
      customerId: params.customerId,
      vendorId: params.vendorId,
      orderStatusId: params.orderStatusId,
    });
    return { status: "success", data: data as unknown as OrderResponseDto[], total };
  },
);

// --- Transitions ----------------------------------------------------------

export const confirmOrder = api(
  { method: "POST", path: "/api/v1/main/orders/:id/confirm", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: OrderResponseDto }> => {
    try {
      // TODO: userId from auth context (hardcoded 0 for now).
      const order = await transitionOrder(id, { type: "CONFIRM", userId: 0 });
      return { status: "success", data: order as unknown as OrderResponseDto };
    } catch (err) {
      toApiError(err);
    }
  },
);

export const allocateOrder = api(
  { method: "POST", path: "/api/v1/main/orders/:id/allocate", auth: false, expose: true },
  async ({ id, ...body }: { id: number } & AllocateOrderRequestDto): Promise<{ status: "success"; data: OrderResponseDto }> => {
    const request = parseOrThrow(AllocateOrderRequestSchema, body);
    try {
      // TODO: userId from auth context (hardcoded 0 for now).
      const order = await transitionOrder(id, { type: "ALLOCATE", request, userId: 0 });
      return { status: "success", data: order as unknown as OrderResponseDto };
    } catch (err) {
      toApiError(err);
    }
  },
);

export const shipOrder = api(
  { method: "POST", path: "/api/v1/main/orders/:id/ship", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: OrderResponseDto }> => {
    try {
      // TODO: userId from auth context (hardcoded 0 for now).
      const order = await transitionOrder(id, { type: "SHIP", userId: 0 });
      return { status: "success", data: order as unknown as OrderResponseDto };
    } catch (err) {
      toApiError(err);
    }
  },
);

export const fulfillOrder = api(
  { method: "POST", path: "/api/v1/main/orders/:id/fulfill", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: OrderResponseDto }> => {
    try {
      // TODO: userId from auth context (hardcoded 0 for now).
      const order = await transitionOrder(id, { type: "FULFILL", userId: 0 });
      return { status: "success", data: order as unknown as OrderResponseDto };
    } catch (err) {
      toApiError(err);
    }
  },
);

export const cancelOrder = api(
  { method: "POST", path: "/api/v1/main/orders/:id/cancel", auth: false, expose: true },
  async ({ id, ...body }: { id: number } & CancelOrderRequestDto): Promise<{ status: "success"; data: OrderResponseDto }> => {
    const request = parseOrThrow(CancelOrderRequestSchema, body);
    try {
      // TODO: userId from auth context (hardcoded 0 for now).
      const order = await transitionOrder(id, { type: "CANCEL", request, userId: 0 });
      return { status: "success", data: order as unknown as OrderResponseDto };
    } catch (err) {
      toApiError(err);
    }
  },
);
