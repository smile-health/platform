// Routes — mirrors apps/wms-service's usersRoutes.ts (mounted at /users,
// matching v1Router.use('/users', usersRoutes)):
//
//   GET /api/v1/users       getAllUsers   (role: allRead)
//   PUT /api/v1/users/:id   updateUsers   (role: onlyAdmin)
//
// Note: usersController.ts also exports a `getUsersById` handler, but no
// route in usersRoutes.ts (or anywhere else in interfaces/http/routes/)
// wires it up — it is dead code in the original and is intentionally NOT
// ported here (gotcha #4: don't invent endpoints the original doesn't
// actually have).
//
// Role-based authorization (allRead / onlyAdmin) isn't enforced yet — same
// known gap as every other ported module.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./users.service";
import type {
  GetAllUsersRequest,
  GetAllUsersResponse,
  UpdateUsersRequest,
  UpdateUsersResponse,
} from "./users.types";

export const getAllUsers = api(
  { method: "GET", path: "/api/v1/users", auth: true, expose: true },
  async (req: GetAllUsersRequest): Promise<GetAllUsersResponse> => {
    const { isSuperAdmin, userNumericId } = getAuthData()!;
    const data = await service.getAllUsers({ ...req, isSuperAdmin, callerUserId: userNumericId });
    return { status: "success", data };
  }
);

export const updateUsers = api(
  { method: "PUT", path: "/api/v1/users/:id", auth: true, expose: true },
  async (req: UpdateUsersRequest): Promise<UpdateUsersResponse> => {
    const data = await service.updateUsers(req.id, req.is_active);
    return { status: "success", data };
  }
);
