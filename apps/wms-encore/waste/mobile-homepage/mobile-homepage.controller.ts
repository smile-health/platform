// Routes — mirrors apps/wms-service's interfaces/http/routes/mobile/homepageRoutes.ts
// (mounted at v1RouterMobile.use('/homepage', homepageRoutes), base
// app.use('/api/v1/mobile', v1RouterMobile)):
//
//   GET /api/v1/mobile/homepage/waste-bag-details/:wasteId   getDetailDataHomePage
//   GET /api/v1/mobile/homepage                               getDataHomePage
//
// Role-based authorization (allRead) isn't enforced — not a gap, since the original doesn't enforce it either (see partnership/rbac.ts), same as
// every other ported module.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./mobile-homepage.service";
import type {
  GetDataHomePageRequest,
  GetDataHomePageResponse,
  GetDetailDataHomePageRequest,
  GetDetailDataHomePageResponse,
} from "./mobile-homepage.types";

export const getDataHomePage = api(
  { method: "GET", path: "/api/v1/mobile/homepage", auth: true, expose: true },
  async (req: GetDataHomePageRequest): Promise<GetDataHomePageResponse> => {
    const { entityId, userID } = getAuthData()!;
    const data = await service.getDataHomePage(req, { entityId, userID });
    return { status: "success", data };
  }
);

export const getDetailDataHomePage = api(
  { method: "GET", path: "/api/v1/mobile/homepage/waste-bag-details/:wasteId", auth: true, expose: true },
  async (req: GetDetailDataHomePageRequest): Promise<GetDetailDataHomePageResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getDetailDataHomePage(req, { entityId });
    return { status: "success", data: data as GetDetailDataHomePageResponse["data"] };
  }
);
