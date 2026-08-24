// Routes — mirrors apps/wms-service's interfaces/http/routes/mobile/enterWeightRoutes.ts
// (mounted at v1RouterMobile.use('/enter-weight', enterWeightRoutes), base
// app.use('/api/v1/mobile', v1RouterMobile)):
//
//   POST /api/v1/mobile/enter-weight   createWasteController
//
// Role-based authorization (allRead) isn't enforced — not a gap, since the original doesn't enforce it either (see partnership/rbac.ts), same as
// every other ported module. Request-shape validation happens inside
// waste-bag.service.ts's createWasteBag (createWasteBagSchema), applied to
// the already-mapped payload.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./mobile-enter-weight.service";
import type { EnterWeightRequest, EnterWeightResponse } from "./mobile-enter-weight.types";

export const createWaste = api(
  { method: "POST", path: "/api/v1/mobile/enter-weight", auth: true, expose: true },
  async (req: EnterWeightRequest): Promise<EnterWeightResponse> => {
    const { entityId, userID } = getAuthData()!;
    const data = await service.createWaste(req, { entityId, userID });
    return { status: "success", data };
  }
);
