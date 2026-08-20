// Mirrors apps/wms-service's domain/entities/Users.ts field-for-field, plus the
// EntitiesModel/UserRoleModel attributes actually selected via the `entity` and
// `userRole` associations in UsersRepositoryImpl (getUsersId/getAllUsers).
export interface UserEntitySummary {
  id: number;
  name?: string;
  provinceId?: number;
  regencyId?: number;
  tag?: string;
  isActive?: boolean;
  address?: string;
  type?: number;
  location?: string;
}

export interface UserRoleSummary {
  id: number;
  name?: string;
  nameEn?: string;
  type?: string;
}

export interface User {
  id?: number;
  userUuid: string;
  entityId: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  username?: string;
  mobilePhone?: string;
  gender?: number;
  genderLabel?: string;
  dateOfBirth?: string;
  role?: number;
  roleId?: number;
  roleLabel?: string;
  viewOnly?: boolean;
  status?: number;
  lastDevice?: number;
  lastLogin?: string;
  integrationClientId?: number;
  keycloakUuid?: string;
  externalRoles?: string;
  address?: string;
  manufactureId?: number;
  villageId?: string;
  // Encore's schema generator rejects a bare `object` type for anything
  // reachable from an api() response — Record<string, unknown> is the
  // supported equivalent for an open-ended map.
  externalProperties?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: number;
  updatedBy?: number;
  isActive?: boolean;
  entity?: UserEntitySummary | null;
  userRole?: UserRoleSummary | null;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedUsers {
  data: User[];
  pagination: PaginationMeta;
}

// ---- GET /api/v1/users ----
// Original (usersController.ts's getAllUsers): when the caller is a
// super_admin AND no explicit userId query param was supplied, returns the
// full paginated+filtered list. Otherwise (a non-super-admin, or a
// super_admin who *did* pass a userId), it looks up exactly one user by id
// (its own id for a non-super-admin) and ignores every other filter.
export interface GetAllUsersRequest {
  entityTypeId?: number;
  entityId?: number;
  // Comma-separated in the original (Express query parsing accepted both a
  // single string and repeated params); ported as a single comma-separated
  // string and split manually in service.ts.
  groupBy?: string;
  attributes?: string;
  limit?: number;
  page?: number;
  search?: string;
  provinceId?: number;
  regencyId?: number;
  userId?: number;
  role?: string;
  // plain string, not a boolean/union — see gotcha #3; parsed manually via
  // parseBoolean() in service.ts, same as the original's shared util.
  isActive?: string;
}

// Original: single-user branch responds success(null) when the user isn't
// found (getUsersById use case's `data === null` -> res.success(null)), and
// the "nobody is superAdmin and no userId resolved" branch throws an
// un-flagged Error (-> res.error -> 500), which is preserved in service.ts as
// an APIError(Internal). The response therefore has three possible shapes: a
// paginated list, a single user, or null (not found) — kept as a union of
// plain object/array/null shapes, same pattern as entity-location's
// `EntityLocation[] | PaginatedEntityLocations` response.
export interface GetAllUsersResponse {
  status: "success";
  data: PaginatedUsers | User | null;
}

// Internal shape passed from controller -> service, carrying values derived
// from the authenticated user (auth) rather than the request itself.
export interface GetAllUsersInput extends GetAllUsersRequest {
  isSuperAdmin: boolean;
  callerUserId: number;
}

// ---- PUT /api/v1/users/:id ----
export interface UpdateUsersRequest {
  id: string;
  // Original schema: z.union([z.boolean(), z.number().int().min(0).max(1)])
  // .transform(Boolean) — a union on a body field Encore decodes off the
  // wire, which gotcha #3 forbids for such fields. Narrowed to a plain
  // boolean here (the same tightening every other ported module makes for
  // wire-decoded unions); users.schema.ts still re-validates it in service.ts.
  is_active: boolean;
}
export interface UpdateUsersResponse {
  status: "success";
  data: User;
}
