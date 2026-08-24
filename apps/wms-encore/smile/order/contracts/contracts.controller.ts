// Placeholder endpoints — scaffolding only, empty implementation.
// Ported base path from legacy wire.ts: "/api/v1/main/contracts" (real), endpoint
// count (2) approximated from a grep-based survey of the legacy
// module — exact sub-paths/methods were not individually transcribed.
import { api } from "encore.dev/api";

export const contractsScaffold1 = api(
  { method: "GET", path: "/api/v1/main/contracts/_scaffold-contracts-1", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);

export const contractsScaffold2 = api(
  { method: "POST", path: "/api/v1/main/contracts/_scaffold-contracts-2", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    return { status: "success", data: null };
  },
);
