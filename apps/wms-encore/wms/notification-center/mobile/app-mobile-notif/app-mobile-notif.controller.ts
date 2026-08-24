// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/app/notif" (real), endpoint
// count (4) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
// from apps/main's app-mobile-notif module
import { api } from "encore.dev/api";

export const appMobileNotifScaffold1 = api(
  { method: "GET", path: "/api/v1/main/app/notif/_scaffold-app-mobile-notif-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const appMobileNotifScaffold2 = api(
  { method: "POST", path: "/api/v1/main/app/notif/_scaffold-app-mobile-notif-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const appMobileNotifScaffold3 = api(
  { method: "PUT", path: "/api/v1/main/app/notif/_scaffold-app-mobile-notif-3", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const appMobileNotifScaffold4 = api(
  { method: "PATCH", path: "/api/v1/main/app/notif/_scaffold-app-mobile-notif-4", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
