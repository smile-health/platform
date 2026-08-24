import type { Header } from "encore.dev/api";

// Mirrors apps/wms-service's domain/entities/UserRole.ts (file itself is
// misnamed "GlobalSettings" internally, but is the User Role domain entity)
// field-for-field, plus the infrastructure/database/models/UserRoleModel.ts
// columns actually selected by UserRoleRepositoryImpl.
export interface UserRole {
  id: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  name: string;
  type: string;
  description?: string;
  regionId?: number;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedUserRoles {
  data: UserRole[];
  pagination: PaginationMeta;
}

// ---- GET /api/v1/roles ----
export interface GetAllUserRoleRequest {
  limit?: number;
  page?: number;
  search?: string;
  // Original reads Accept-Language off the request header (not a body/query
  // field) inside userRoleController.ts to pick 'en' vs 'id' translations.
  // Encore's Header<> decodes this off the wire directly, so it is not
  // subject to gotcha #3 (that rule is about union/z.infer body/query
  // fields, not the Header<> wire-decoding helper type itself).
  acceptLanguage?: Header<"Accept-Language">;
}

export interface GetAllUserRoleResponse {
  status: "success";
  data: PaginatedUserRoles;
}

// Internal shape passed from controller -> service.
export interface GetAllUserRoleInput {
  limit?: number;
  page?: number;
  search?: string;
  lang?: string;
}
