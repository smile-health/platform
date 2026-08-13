// Routes — mirrors apps/wms-service's interfaces/http/routes/mobile/scanQrRoutes.ts
// (mounted at v1RouterMobile.use('/scan-qr-code', scanQrRoutes), base
// app.use('/api/v1/mobile', v1RouterMobile)):
//
//   GET /api/v1/mobile/scan-qr-code/:id   scanQrCode
//
// Role-based authorization (allRead) isn't enforced — not a gap, since the original doesn't enforce it either (see partnership/rbac.ts), same as
// every other ported module.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./mobile-scan-qr.service";
import type { ScanQrCodeRequest, ScanQrCodeResponse } from "./mobile-scan-qr.types";

export const scanQrCode = api(
  { method: "GET", path: "/api/v1/mobile/scan-qr-code/:id", auth: true, expose: true },
  async (req: ScanQrCodeRequest): Promise<ScanQrCodeResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.scanQrCode(req.id, entityId, req.acceptLanguage);
    return { status: "success", data };
  }
);
