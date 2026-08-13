// Mirrors apps/wms-service's domain/entities/EntitySettings.ts field-for-field.
export interface EntitySettings {
  id: number;
  entityId: number;
  settingName: string;
  settingValue: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GetEntitySettingsByIdRequest {
  id: string;
}
export interface GetEntitySettingsByIdResponse {
  status: "success";
  data: EntitySettings;
}

export interface GetAllEntitySettingsRequest {
  limit?: string;
  page?: string;
  search?: string;
}
export interface GetAllEntitySettingsResponse {
  status: "success";
  data: {
    data: EntitySettings[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  };
}

export interface CreateEntitySettingsRequest {
  entityId?: number;
  settingName: string;
  settingValue: string;
}
// CreateEntitySettingUseCase's success path returns the created EntitySettings
// entity directly (not wrapped) — res.success(data) in the original controller.
export interface CreateEntitySettingsResponse {
  status: "success";
  data: EntitySettings;
}

export interface UpdateEntitySettingsRequest {
  id: string;
  entityId?: number;
  settingName?: string;
  settingValue?: string;
}
// UpdateEntitySettingsUseCase returns EntitySettings | string (a not-found
// message string when the row doesn't exist). The original controller only
// checks `data === null` — which the use-case never actually returns on the
// not-found path — so that not-found string falls through to res.success(data)
// verbatim, a pre-existing bug. Preserved as-is; see entity-settings.service.ts.
export interface UpdateEntitySettingsResponse {
  status: "success";
  data: EntitySettings | string;
}

export interface DeleteEntitySettingsRequest {
  id: string;
}
export interface DeleteEntitySettingsResponse {
  status: "success";
  data: boolean;
}
