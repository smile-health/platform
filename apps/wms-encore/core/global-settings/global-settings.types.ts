// Mirrors apps/wms-service's domain/entities/GlobalSettings.ts field-for-field.
export interface GlobalSettings {
  id?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  settingName: string;
  settingValue: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedGlobalSettings {
  data: GlobalSettings[];
  pagination: PaginationMeta;
}

// GET /api/v1/global-settings/:id
export interface GetGlobalSettingsByIdRequest {
  id: string;
}
export interface GetGlobalSettingsByIdResponse {
  status: "success";
  data: GlobalSettings;
}

// GET /api/v1/global-settings
export interface GetAllGlobalSettingsRequest {
  limit?: number;
  page?: number;
  search?: string;
}
export interface GetAllGlobalSettingsResponse {
  status: "success";
  data: PaginatedGlobalSettings;
}

// POST /api/v1/global-settings
export interface CreateGlobalSettingsRequest {
  settingName: string;
  settingValue: string;
}
export interface CreateGlobalSettingsResponse {
  status: "success";
  data: GlobalSettings;
}

// PUT /api/v1/global-settings/:id
export interface UpdateGlobalSettingsRequest {
  id: string;
  settingName?: string;
  settingValue?: string;
}
export interface UpdateGlobalSettingsResponse {
  status: "success";
  data: GlobalSettings;
}

// DELETE /api/v1/global-settings/:id
export interface DeleteGlobalSettingsRequest {
  id: string;
}
export interface DeleteGlobalSettingsResponse {
  status: "success";
  data: boolean;
}
