// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/orders" (real), endpoint
// count (3) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
import { api } from "encore.dev/api";

export const orderAllocationScaffold1 = api(
  { method: "GET", path: "/api/v1/main/orders/_scaffold-order-allocation-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const orderAllocationScaffold2 = api(
  { method: "POST", path: "/api/v1/main/orders/_scaffold-order-allocation-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const orderAllocationScaffold3 = api(
  { method: "PUT", path: "/api/v1/main/orders/_scaffold-order-allocation-3", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
