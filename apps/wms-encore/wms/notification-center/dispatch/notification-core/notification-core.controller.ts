// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/core/notifications" (real), endpoint
// count (8) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
// from apps/core's notification module
import { api } from "encore.dev/api";

export const notificationCoreScaffold1 = api(
  { method: "GET", path: "/api/v1/core/notifications/_scaffold-notification-core-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const notificationCoreScaffold2 = api(
  { method: "POST", path: "/api/v1/core/notifications/_scaffold-notification-core-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const notificationCoreScaffold3 = api(
  { method: "PUT", path: "/api/v1/core/notifications/_scaffold-notification-core-3", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const notificationCoreScaffold4 = api(
  { method: "PATCH", path: "/api/v1/core/notifications/_scaffold-notification-core-4", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const notificationCoreScaffold5 = api(
  { method: "DELETE", path: "/api/v1/core/notifications/_scaffold-notification-core-5", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const notificationCoreScaffold6 = api(
  { method: "GET", path: "/api/v1/core/notifications/_scaffold-notification-core-6", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const notificationCoreScaffold7 = api(
  { method: "POST", path: "/api/v1/core/notifications/_scaffold-notification-core-7", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const notificationCoreScaffold8 = api(
  { method: "PUT", path: "/api/v1/core/notifications/_scaffold-notification-core-8", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
