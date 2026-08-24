// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/core/asset-vendors" (real), endpoint
// count (7) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
import { api } from "encore.dev/api";

export const assetVendorScaffold1 = api(
  { method: "GET", path: "/api/v1/core/asset-vendors/_scaffold-asset-vendor-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const assetVendorScaffold2 = api(
  { method: "POST", path: "/api/v1/core/asset-vendors/_scaffold-asset-vendor-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const assetVendorScaffold3 = api(
  { method: "PUT", path: "/api/v1/core/asset-vendors/_scaffold-asset-vendor-3", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const assetVendorScaffold4 = api(
  { method: "PATCH", path: "/api/v1/core/asset-vendors/_scaffold-asset-vendor-4", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const assetVendorScaffold5 = api(
  { method: "DELETE", path: "/api/v1/core/asset-vendors/_scaffold-asset-vendor-5", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const assetVendorScaffold6 = api(
  { method: "GET", path: "/api/v1/core/asset-vendors/_scaffold-asset-vendor-6", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const assetVendorScaffold7 = api(
  { method: "POST", path: "/api/v1/core/asset-vendors/_scaffold-asset-vendor-7", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
