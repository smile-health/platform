// Routes — mirrors apps/wms-service's dashboardRoutes.ts (the dashboard-activity
// subset only; dashboardController.ts's other /dashboard/* routes are a
// separate module):
//
//   GET  /api/v1/dashboard/summary-activity-entities         getActivitySummariesForEntities
//   GET  /api/v1/dashboard/summary-activity-entities/export  exportActivitySummariesForEntities
//   GET  /api/v1/dashboard/manual-scale-activity-entities    getActivityManualScaleForEntities
//   GET  /api/v1/dashboard/summary-users-activity            getUserActivitySummary

import { api } from "encore.dev/api";
import * as service from "./dashboard-activity.service";
import type {
  GetActivitySummariesForEntitiesRequest,
  GetActivitySummariesForEntitiesResponse,
  GetActivityManualScaleForEntitiesRequest,
  GetActivityManualScaleForEntitiesResponse,
  GetUserActivitySummaryRequest,
  GetUserActivitySummaryResponse,
} from "./dashboard-activity.types";

export const getActivitySummariesForEntities = api(
  { method: "GET", path: "/api/v1/dashboard/summary-activity-entities", auth: true, expose: true },
  async (
    req: GetActivitySummariesForEntitiesRequest,
  ): Promise<GetActivitySummariesForEntitiesResponse> => {
    const data = await service.getActivitySummariesForEntities(req, req.limit, req.page);
    return { status: "success", data };
  },
);

export const getActivityManualScaleForEntities = api(
  { method: "GET", path: "/api/v1/dashboard/manual-scale-activity-entities", auth: true, expose: true },
  async (
    req: GetActivityManualScaleForEntitiesRequest,
  ): Promise<GetActivityManualScaleForEntitiesResponse> => {
    const data = await service.getActivityManualScaleForEntities(req, req.limit, req.page);
    return { status: "success", data };
  },
);

export const getUserActivitySummary = api(
  { method: "GET", path: "/api/v1/dashboard/summary-users-activity", auth: true, expose: true },
  async (req: GetUserActivitySummaryRequest): Promise<GetUserActivitySummaryResponse> => {
    const data = await service.getUserActivitySummary(req);
    return { status: "success", data };
  },
);

// Binary .xlsx response — not representable by api()'s JSON request/response
// types, so this is ported as a raw endpoint. Query params are parsed
// manually off the URL (there is no Encore-decoded request type here, so
// gotcha #3 about api() request fields doesn't apply to this handler).
export const exportActivitySummariesForEntities = api.raw(
  { method: "GET", path: "/api/v1/dashboard/summary-activity-entities/export", auth: true, expose: true },
  async (req, resp) => {
    try {
      const url = new URL(req.url ?? "", "http://internal");
      const q = url.searchParams;
      const numOrUndefined = (v: string | null) =>
        v !== null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : undefined;

      const { buffer, filename } = await service.exportActivitySummariesForEntities({
        startDate: q.get("startDate") ?? undefined,
        endDate: q.get("endDate") ?? undefined,
        provinceId: numOrUndefined(q.get("provinceId")),
        regencyId: numOrUndefined(q.get("regencyId")),
        healthcareFacilityId: numOrUndefined(q.get("healthcareFacilityId")),
        wasteTypeId: numOrUndefined(q.get("wasteTypeId")),
        wasteGroupId: numOrUndefined(q.get("wasteGroupId")),
        entityTag: q.get("entityTag") ?? undefined,
        typeOfProcessing: q.get("typeOfProcessing") ?? undefined,
      });

      resp.writeHead(200, {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": service.buildContentDisposition(filename),
        "Cache-Control": "no-store",
        "Content-Length": buffer.length.toString(),
      });
      resp.end(buffer);
    } catch (error) {
      // Mirrors the original controller's outer catch -> res.error(...) -> 500
      // "error" envelope (see dashboard-activity.service.ts's top comment) —
      // errorEnvelope only intercepts api() handlers, not api.raw, so this
      // raw handler builds the same {status:"error", ...} shape by hand.
      const message = error instanceof Error ? error.message : String(error);
      const body = JSON.stringify({ status: "error", message, data: null });
      resp.writeHead(500, { "Content-Type": "application/json" });
      resp.end(body);
    }
  },
);
