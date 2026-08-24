// Example of two DIFFERENT modules publishing the same shared event —
// scaffolding only, not meant to be called for real from here.
// TODO: remove this file once scm/materials and core/user publish
// exportRequested from their own real export-trigger endpoints instead.
import { api } from "encore.dev/api";
import { exportRequested } from "../../shared/export/export.topics";

export const scaffold = api(
  { method: "POST", path: "/api/v1/exporter/_scaffold", auth: false, expose: true },
  async (): Promise<{ status: "success"; data: null }> => {
    await exportRequested.publish({
      requestId: "scaffold",
      requestedBy: 0,
      exportType: "materials",
      filters: {},
    });
    return { status: "success", data: null };
  },
);
