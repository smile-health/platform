// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/orders" (real), endpoint
// count (5) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
import { api } from "encore.dev/api";

export const orderCommentScaffold1 = api(
  { method: "GET", path: "/api/v1/main/orders/_scaffold-order-comment-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const orderCommentScaffold2 = api(
  { method: "POST", path: "/api/v1/main/orders/_scaffold-order-comment-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const orderCommentScaffold3 = api(
  { method: "PUT", path: "/api/v1/main/orders/_scaffold-order-comment-3", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const orderCommentScaffold4 = api(
  { method: "PATCH", path: "/api/v1/main/orders/_scaffold-order-comment-4", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const orderCommentScaffold5 = api(
  { method: "DELETE", path: "/api/v1/main/orders/_scaffold-order-comment-5", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
