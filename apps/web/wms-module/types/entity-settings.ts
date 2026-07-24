import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TEntitySettings = {
  id: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  entityId: number;
  settingName: string;
  settingValue: string;
};

export type GetEntitySettingsResponse = TCommonResponseList & {
  data: {
    data: TEntitySettings[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type EntitySettingsInput = {
  entityId?: number;
  settingName: string;
  settingValue: string;
};

export type CreateEntitySettingsInput = EntitySettingsInput & {
  createdBy: string;
};

export type UpdateEntitySettingsInput = EntitySettingsInput & {
  updatedBy: string;
};
