// Routes — mirrors apps/wms-service's routes/mobile/wasteRoutes.ts, mounted at
// /api/v1/mobile (v1RouterMobile.use('/waste', wasteRoutes) in
// routes/mobile/index.ts, with v1RouterMobile itself mounted at
// /api/v1/mobile in app.ts — the mobile router's OWN '/waste' segment is
// dropped here per the task's expected prefixes below, which put these
// endpoints directly under /api/v1/mobile/...).
//
//   POST /api/v1/mobile/follow-up-treatment           followUpTreatmentList
//   GET  /api/v1/mobile/detail                        getWasteBagDetail
//   GET  /api/v1/mobile/report                         getWasteBagReport
//   GET  /api/v1/mobile/report-waste-status            getWasteBagReportByStatus
//   GET  /api/v1/mobile                                getAllWasteBags
//   POST /api/v1/mobile/receiving-treatment-external   receivingTreatmentExternal
//   POST /api/v1/mobile/follow-up-action               mobileWasteFollowUp
//   POST /api/v1/mobile/post-treatment                 mobileWastePostTreatment
//
// Role-based authorization (allRead/onlyAdmin) and rateLimitter aren't
// enforced yet — same known gap as every other ported module (see
// ../waste-bag/waste-bag.controller.ts and
// ../../manual-scale-request/manual-scale-request.controller.ts).

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./mobile-waste.service";
import type {
  MobileFollowUpTreatmentRequest,
  MobileFollowUpTreatmentResponse,
  MobileWasteBagDetailRequest,
  MobileWasteBagDetailResponse,
  MobileGetAllWasteBagRequest,
  MobileGetAllWasteBagResponse,
  MobileReceivingTreatmentExternalRequest,
  MobileReceivingTreatmentExternalResponse,
  MobileWasteFollowUpRequest,
  MobileWasteFollowUpResponse,
  MobileWastePostTreatmentRequest,
  MobileWastePostTreatmentResponse,
  MobileWasteBagReportRequest,
  MobileWasteBagReportResponse,
  MobileWasteBagReportByStatusRequest,
  MobileWasteBagReportByStatusResponse,
} from "./mobile-waste.types";

export const mobileFollowUpTreatmentList = api(
  { method: "POST", path: "/api/v1/mobile/follow-up-treatment", auth: true, expose: true },
  async (req: MobileFollowUpTreatmentRequest): Promise<MobileFollowUpTreatmentResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.followUpTreatmentList({
      wasteBagQrCodeIds: req.wasteBagQrCodeIds,
      updatedBy: userID,
    });
    return { status: "success", data };
  }
);

export const getWasteBagDetail = api(
  { method: "GET", path: "/api/v1/mobile/detail", auth: true, expose: true },
  async (req: MobileWasteBagDetailRequest): Promise<MobileWasteBagDetailResponse> => {
    const data = await service.getWasteBagDetail(req);
    return { status: "success", data: (data as Record<string, unknown> | null) ?? null };
  }
);

export const getWasteBagReport = api(
  { method: "GET", path: "/api/v1/mobile/report", auth: true, expose: true },
  async (req: MobileWasteBagReportRequest): Promise<MobileWasteBagReportResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getWasteBagReport({
      ...req,
      healthcareFacilityId: req.healthcareFacilityId ?? entityId,
    });
    return { status: "success", data };
  }
);

export const getWasteBagReportByStatus = api(
  { method: "GET", path: "/api/v1/mobile/report-waste-status", auth: true, expose: true },
  async (req: MobileWasteBagReportByStatusRequest): Promise<MobileWasteBagReportByStatusResponse> => {
    const { entityId } = getAuthData()!;
    const result = await service.getWasteBagReportByStatus({
      ...req,
      healthcareFacilityId: req.healthcareFacilityId ?? entityId,
    });
    return {
      status: "success",
      data: { data: result.data as unknown as Record<string, unknown>[], pagination: result.pagination },
    };
  }
);

export const mobileGetAllWasteBags = api(
  { method: "GET", path: "/api/v1/mobile", auth: true, expose: true },
  async (req: MobileGetAllWasteBagRequest): Promise<MobileGetAllWasteBagResponse> => {
    const data = await service.getAllWasteBags(req);
    return { status: "success", data };
  }
);

export const receivingTreatmentExternal = api(
  { method: "POST", path: "/api/v1/mobile/receiving-treatment-external", auth: true, expose: true },
  async (
    req: MobileReceivingTreatmentExternalRequest
  ): Promise<MobileReceivingTreatmentExternalResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.receivingTreatmentExternal({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const mobileWasteFollowUp = api(
  { method: "POST", path: "/api/v1/mobile/follow-up-action", auth: true, expose: true },
  async (req: MobileWasteFollowUpRequest): Promise<MobileWasteFollowUpResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.mobileWasteFollowUp({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const mobileWastePostTreatment = api(
  { method: "POST", path: "/api/v1/mobile/post-treatment", auth: true, expose: true },
  async (req: MobileWastePostTreatmentRequest): Promise<MobileWastePostTreatmentResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.mobileWastePostTreatment({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);
