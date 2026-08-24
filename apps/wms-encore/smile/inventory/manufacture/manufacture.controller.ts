// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/manufactures" (real), endpoint
// count (4) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
// apps/main's copy — SEPARATE from core's manufacture module, kept in asset-catalog, not yet deduped
import { api } from "encore.dev/api";

export const manufactureScaffold1 = api(
  { method: "GET", path: "/api/v1/main/manufactures/_scaffold-manufacture-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const manufactureScaffold2 = api(
  { method: "POST", path: "/api/v1/main/manufactures/_scaffold-manufacture-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const manufactureScaffold3 = api(
  { method: "PUT", path: "/api/v1/main/manufactures/_scaffold-manufacture-3", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const manufactureScaffold4 = api(
  { method: "PATCH", path: "/api/v1/main/manufactures/_scaffold-manufacture-4", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
