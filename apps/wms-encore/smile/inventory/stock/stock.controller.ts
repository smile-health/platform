// Minimal real read endpoints backed by stock.repository.ts — the priority
// for this pass was the order-lifecycle subscriber logic in
// ../inventory.subscriptions.ts, not a full stock CRUD/report surface (that
// remains future work; the legacy module has far more than these two
// endpoints — see the previous scaffold's header for the full count).
import { api, APIError } from "encore.dev/api";
import * as repo from "./stock.repository";

// Plain literal response DTO, not the Kysely `Selectable<WsStocksTable>`
// repo type directly — Encore's static analyzer needs a literal interface
// in api() signatures (see order.controller.ts's header for the full
// explanation of why, discovered via `encore check`).
interface StockResponseDto {
  id: number;
  material_id: number | null;
  entity_id: number | null;
  batch_id: number | null;
  batch_code: string | null;
  qty: number;
  allocated_qty: number | null;
  in_transit_qty: number | null;
  price: number | null;
  total_price: number | null;
  year: number | null;
}

export const getStock = api(
  { method: "GET", path: "/api/v1/main/stocks/:id", auth: false, expose: true },
  async ({ id }: { id: number }): Promise<{ status: "success"; data: StockResponseDto }> => {
    const stock = await repo.findById(id);
    if (!stock) throw APIError.notFound(`Stock ${id} not found`);
    return { status: "success", data: stock as unknown as StockResponseDto };
  },
);

export const getStockAvailability = api(
  { method: "GET", path: "/api/v1/main/stocks/:id/availability", auth: false, expose: true },
  async ({
    id,
  }: {
    id: number;
  }): Promise<{ status: "success"; data: { qty: number; allocated_qty: number; in_transit_qty: number; available: number } }> => {
    const availability = await repo.findAvailability(id);
    if (!availability) throw APIError.notFound(`Stock ${id} not found`);
    return { status: "success", data: availability };
  },
);
