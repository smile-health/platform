// Routes — mirrors apps/wms-service's wasteRecordRouter.ts (mounted at
// /waste-record, matching v1Router.use('/waste-record', wasteRecordRouter)):
//
//   POST /api/v1/waste-record          createWasteRecordController   (role: onlyAdmin)
//   GET  /api/v1/waste-record          getAllWasteRecordController   (role: allRead)
//   GET  /api/v1/waste-record/export   getWasteRecordCharacteristicsSummaryExportExcel (role: allRead)
//
// Role-based authorization (onlyAdmin / allRead) and the per-route
// rateLimitter middleware aren't enforced yet — same known gap as every
// other ported module.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./waste-bag-record.service";
import type {
  CreateWasteBagRecordRequest,
  CreateWasteBagRecordResponse,
  GetAllWasteBagRecordRequest,
  GetAllWasteBagRecordResponse,
} from "./waste-bag-record.types";

export const createWasteRecord = api(
  { method: "POST", path: "/api/v1/waste-record", auth: true, expose: true },
  async (req: CreateWasteBagRecordRequest): Promise<CreateWasteBagRecordResponse> => {
    const { userID, entityId } = getAuthData()!;
    // Original: `healthcareFacilityId: req.user?.entity.id, createdBy:
    // req.user?.user_uuid, updatedBy: req.user?.user_uuid` — updatedBy isn't
    // persisted anywhere in WasteBagRecordRepositoryImpl.createWasteBagRecord
    // (dead field in the original DTO spread), so it's dropped here too.
    const data = await service.createWasteBagRecord({
      ...req,
      createdBy: userID,
      healthcareFacilityId: entityId,
    });
    return { status: "success", data };
  }
);

export const getAllWasteRecord = api(
  { method: "GET", path: "/api/v1/waste-record", auth: true, expose: true },
  async (req: GetAllWasteBagRecordRequest): Promise<GetAllWasteBagRecordResponse> => {
    const { entityTag, entityId, isSuperAdmin, entityTypeName } = getAuthData()!;
    // Mirrors getAllWasteRecordController's entityTag override: for the
    // allowed entity types, unless the caller is a super admin, entityTag is
    // forced to 'hospital' regardless of what the auth payload's own tag
    // says. AuthData.entityTag already carries the "raw" tag value; isSuperAdmin
    // is used directly here instead of re-deriving it from a roles array (see
    // authHandler.ts's externalRoles field, which is a flattened string, not
    // an array, in this port).
    const allowedTypes = ["healthcare_facility", "regency", "province", "central"];
    const resolvedEntityTag =
      allowedTypes.includes(entityTypeName) && !isSuperAdmin ? "hospital" : entityTag;

    const data = await service.getAllWasteBagRecord({
      ...req,
      entityTag: resolvedEntityTag,
      entityId,
    });
    return { status: "success", data };
  }
);

// Binary .xlsx response — not representable by api()'s JSON request/response
// types, so this is ported as a raw endpoint, same as
// dashboard-activity.controller.ts's exportActivitySummariesForEntities.
// Query params are parsed manually off the URL.
export const getWasteRecordCharacteristicsSummaryExportExcel = api.raw(
  { method: "GET", path: "/api/v1/waste-record/export", auth: true, expose: true },
  async (req, resp) => {
    try {
      const url = new URL(req.url ?? "", "http://internal");
      const q = url.searchParams;
      const numOrUndefined = (v: string | null) =>
        v !== null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : undefined;

      const { entityId, entityTypeName, isSuperAdmin } = getAuthData()!;
      // Original: `let resolvedHealthcareId = healthcareFacilityId; const
      // allowedTypes = [...]; if (entityId && allowedTypes.includes(entityType)
      // && !isSuperAdmin) resolvedHealthcareId = entityId.toString();` — same
      // override pattern as getAllWasteRecordController, just forcing
      // healthcareFacilityId to the caller's own entity id instead of an
      // entityTag string.
      const allowedTypes = ["healthcare_facility", "regency", "province", "central"];
      let resolvedHealthcareId = numOrUndefined(q.get("healthcareFacilityId"));
      if (entityId && allowedTypes.includes(entityTypeName) && !isSuperAdmin) {
        resolvedHealthcareId = entityId;
      }

      const { buffer, filename } = await service.exportWasteRecordCharacteristicsSummary({
        startDate: q.get("startDate") ?? undefined,
        endDate: q.get("endDate") ?? undefined,
        provinceId: numOrUndefined(q.get("provinceId")),
        regencyId: numOrUndefined(q.get("regencyId")),
        healthcareFacilityId: resolvedHealthcareId,
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
      // "error" envelope — errorEnvelope only intercepts api() handlers, not
      // api.raw, so this raw handler builds the same {status:"error", ...}
      // shape by hand, same as dashboard-activity.controller.ts's analogous
      // raw export endpoint.
      const message = error instanceof Error ? error.message : String(error);
      const body = JSON.stringify({ status: "error", message, data: null });
      resp.writeHead(500, { "Content-Type": "application/json" });
      resp.end(body);
    }
  }
);
