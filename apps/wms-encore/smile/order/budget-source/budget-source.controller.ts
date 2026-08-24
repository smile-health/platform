// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/budget-sources" (real), endpoint
// count (4) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
// apps/main's copy — SEPARATE from core's budget-source module, not yet deduped
import { api } from "encore.dev/api";

export const budgetSourceScaffold1 = api(
  { method: "GET", path: "/api/v1/main/budget-sources/_scaffold-budget-source-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const budgetSourceScaffold2 = api(
  { method: "POST", path: "/api/v1/main/budget-sources/_scaffold-budget-source-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const budgetSourceScaffold3 = api(
  { method: "PUT", path: "/api/v1/main/budget-sources/_scaffold-budget-source-3", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const budgetSourceScaffold4 = api(
  { method: "PATCH", path: "/api/v1/main/budget-sources/_scaffold-budget-source-4", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
