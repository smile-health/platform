// Placeholder endpoint — scaffolding only.
// TODO: port apps/auth-service/src/routes/{authRoutes,authExecutiveRoutes,userRoutes}.ts
// and apps/core/src/modules/auth, reusing shared/auth/authHandler.ts + Keycloak client.

import { api } from "encore.dev/api";

export const scaffold = api(
  { method: "GET", path: "/api/v1/auth/_scaffold", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
