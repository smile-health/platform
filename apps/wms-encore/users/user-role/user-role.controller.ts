// Routes — mirrors apps/wms-service's userRoleRouters.ts (mounted at
// v1Router.use('/roles', userRoleRoutes)):
//
//   GET    /api/v1/roles   getAllUserRole

import { api } from "encore.dev/api";
import * as service from "./user-role.service";
import type { GetAllUserRoleRequest, GetAllUserRoleResponse } from "./user-role.types";

export const getAllUserRole = api(
  { method: "GET", path: "/api/v1/roles", auth: true, expose: true },
  async (req: GetAllUserRoleRequest): Promise<GetAllUserRoleResponse> => {
    const data = await service.getAllUserRole({
      limit: req.limit,
      page: req.page,
      search: req.search,
      lang: req.acceptLanguage,
    });
    return { status: "success", data };
  },
);
