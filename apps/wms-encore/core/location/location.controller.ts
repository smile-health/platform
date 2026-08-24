// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/locations" (real), endpoint
// count (4) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
// generic level+path model — NOT a port of province/regency/sub-district/village, those are dropped
import { api } from "encore.dev/api";

export const locationScaffold1 = api(
  { method: "GET", path: "/api/v1/main/locations/_scaffold-location-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const locationScaffold2 = api(
  { method: "POST", path: "/api/v1/main/locations/_scaffold-location-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const locationScaffold3 = api(
  { method: "PUT", path: "/api/v1/main/locations/_scaffold-location-3", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const locationScaffold4 = api(
  { method: "PATCH", path: "/api/v1/main/locations/_scaffold-location-4", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
