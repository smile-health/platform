// Routes — mirrors apps/wms-service's dashboardRoutes.ts (this module's
// subset only; that route file's summary-activity-entities/manual-scale-
// activity-entities/summary-users-activity routes belong to the already-
// ported dashboard-activity sibling, mounted from the same router at
// '/dashboard' — see routes/index.ts's `v1Router.use('/dashboard', ...)`):
//
//   GET  /api/v1/dashboard/waste-hierarchy-summary                        getSummaryWasteHierarchy
//   GET  /api/v1/dashboard/provinces/:provinceId/waste-hierarchy-summary  getSummaryWasteHierarchyByProvince
//   GET  /api/v1/dashboard/cities/:cityId/waste-hierarchy-summary         getSummaryWasteHierarchyByCity
//   GET  /api/v1/dashboard/waste-groups/admin-healthcare-facilities      getWasteGroupByAdminHealthcareFacility
//   GET  /api/v1/dashboard/waste-groups/transporter                      getWasteGroupByTransporter
//   GET  /api/v1/dashboard/waste-groups/treatment                        getWasteGroupByTreatment
//   GET  /api/v1/dashboard/waste-groups-details/:wasteGroupId            getWasteGroupDetailsByAction
//   GET  /api/v1/dashboard/waste-characteristics-summary                 getWasteCharacteristicsSummary
//   GET  /api/v1/dashboard/summary-per-day                               getSummaryPerDay
//
// All routes require `authenticate` + `authorizeRoles(allRead)` in the
// original -> `auth: true` here (role-based authorization isn't enforced
// yet — same known gap as every other ported module).

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./dashboard.service";
import type {
  GetSummaryPerDayRequest,
  GetSummaryPerDayResponse,
  GetSummaryWasteHierarchyByCityRequest,
  GetSummaryWasteHierarchyByCityResponse,
  GetSummaryWasteHierarchyByProvinceRequest,
  GetSummaryWasteHierarchyByProvinceResponse,
  GetSummaryWasteHierarchyRequest,
  GetSummaryWasteHierarchyResponse,
  GetWasteCharacteristicsSummaryRequest,
  GetWasteCharacteristicsSummaryResponse,
  GetWasteGroupByAdminHealthcareFacilityRequest,
  GetWasteGroupByAdminHealthcareFacilityResponse,
  GetWasteGroupByTransporterRequest,
  GetWasteGroupByTransporterResponse,
  GetWasteGroupByTreatmentRequest,
  GetWasteGroupByTreatmentResponse,
  GetWasteGroupDetailsByActionRequest,
  GetWasteGroupDetailsByActionResponse,
} from "./dashboard.types";

export const getSummaryWasteHierarchy = api(
  { method: "GET", path: "/api/v1/dashboard/waste-hierarchy-summary", auth: true, expose: true },
  async (req: GetSummaryWasteHierarchyRequest): Promise<GetSummaryWasteHierarchyResponse> => {
    const data = await service.getSummaryWasteHierarchy(req);
    return { status: "success", data };
  },
);

export const getSummaryWasteHierarchyByProvince = api(
  {
    method: "GET",
    path: "/api/v1/dashboard/provinces/:provinceId/waste-hierarchy-summary",
    auth: true,
    expose: true,
  },
  async (
    req: GetSummaryWasteHierarchyByProvinceRequest,
  ): Promise<GetSummaryWasteHierarchyByProvinceResponse> => {
    const data = await service.getSummaryWasteHierarchyByProvince(req);
    return { status: "success", data };
  },
);

export const getSummaryWasteHierarchyByCity = api(
  {
    method: "GET",
    path: "/api/v1/dashboard/cities/:cityId/waste-hierarchy-summary",
    auth: true,
    expose: true,
  },
  async (req: GetSummaryWasteHierarchyByCityRequest): Promise<GetSummaryWasteHierarchyByCityResponse> => {
    const data = await service.getSummaryWasteHierarchyByCity(req);
    return { status: "success", data };
  },
);

export const getWasteGroupByAdminHealthcareFacility = api(
  {
    method: "GET",
    path: "/api/v1/dashboard/waste-groups/admin-healthcare-facilities",
    auth: true,
    expose: true,
  },
  async (
    req: GetWasteGroupByAdminHealthcareFacilityRequest,
  ): Promise<GetWasteGroupByAdminHealthcareFacilityResponse> => {
    // Original resolves entityId/entityType/isSuperAdmin off req.user;
    // ported via getAuthData().
    const { entityId, entityTypeName, isSuperAdmin } = getAuthData()!;
    const data = await service.getWasteGroupByAdminHealthcareFacility({
      ...req,
      callerEntityId: entityId,
      callerEntityTypeName: entityTypeName,
      callerIsSuperAdmin: isSuperAdmin,
    });
    return { status: "success", data };
  },
);

export const getWasteGroupByTransporter = api(
  { method: "GET", path: "/api/v1/dashboard/waste-groups/transporter", auth: true, expose: true },
  async (req: GetWasteGroupByTransporterRequest): Promise<GetWasteGroupByTransporterResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getWasteGroupByTransporter({ ...req, callerEntityId: entityId });
    return { status: "success", data };
  },
);

export const getWasteGroupByTreatment = api(
  { method: "GET", path: "/api/v1/dashboard/waste-groups/treatment", auth: true, expose: true },
  async (req: GetWasteGroupByTreatmentRequest): Promise<GetWasteGroupByTreatmentResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getWasteGroupByTreatment({ ...req, callerEntityId: entityId });
    return { status: "success", data };
  },
);

export const getWasteGroupDetailsByAction = api(
  { method: "GET", path: "/api/v1/dashboard/waste-groups-details/:wasteGroupId", auth: true, expose: true },
  async (req: GetWasteGroupDetailsByActionRequest): Promise<GetWasteGroupDetailsByActionResponse> => {
    const data = await service.getWasteGroupDetailsByAction(req);
    return { status: "success", data };
  },
);

export const getWasteCharacteristicsSummary = api(
  { method: "GET", path: "/api/v1/dashboard/waste-characteristics-summary", auth: true, expose: true },
  async (req: GetWasteCharacteristicsSummaryRequest): Promise<GetWasteCharacteristicsSummaryResponse> => {
    const data = await service.getWasteCharacteristicsSummary(req);
    return { status: "success", data };
  },
);

export const getSummaryPerDay = api(
  { method: "GET", path: "/api/v1/dashboard/summary-per-day", auth: true, expose: true },
  async (_req: GetSummaryPerDayRequest): Promise<GetSummaryPerDayResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getSummaryPerDay(entityId);
    return { status: "success", data };
  },
);
