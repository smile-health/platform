// Route — see mobile-disposal.types.ts header.
//
//   GET /api/v1/mobile/disposal   getAllDisposalUseCaseController

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./mobile-disposal.service";
import type { GetAllMobileDisposalRequest, GetAllMobileDisposalResponse } from "./mobile-disposal.types";

export const getAllDisposal = api(
  { method: "GET", path: "/api/v1/mobile/disposal", auth: true, expose: true },
  async (req: GetAllMobileDisposalRequest): Promise<GetAllMobileDisposalResponse> => {
    const { entityId, entityTypeName, isSuperAdmin } = getAuthData()!;
    const data = await service.getAllDisposal(req, { entityId, entityTypeName, isSuperAdmin });
    return { status: "success", data };
  }
);
