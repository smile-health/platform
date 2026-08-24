// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/notifications" (real), endpoint
// count (5) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
// from apps/main's notification module
import { api } from "encore.dev/api";

export const notificationMainScaffold1 = api(
  { method: "GET", path: "/api/v1/main/notifications/_scaffold-notification-main-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const notificationMainScaffold2 = api(
  { method: "POST", path: "/api/v1/main/notifications/_scaffold-notification-main-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const notificationMainScaffold3 = api(
  { method: "PUT", path: "/api/v1/main/notifications/_scaffold-notification-main-3", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const notificationMainScaffold4 = api(
  { method: "PATCH", path: "/api/v1/main/notifications/_scaffold-notification-main-4", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const notificationMainScaffold5 = api(
  { method: "DELETE", path: "/api/v1/main/notifications/_scaffold-notification-main-5", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
