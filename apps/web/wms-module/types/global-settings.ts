import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TGlobalEntitySettings = {
  id: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  entityId: number;
  settingName: string;
  settingValue: string;
};

export type GetGlobalEntitySettingsResponse = TCommonResponseList & {
  data: {
    data: TGlobalEntitySettings[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GlobalEntitySettingsInput = {
  entityId?: number;
  settingName: string;
  settingValue: string;
};

export type CreateGlobalEntitySettingsInput = GlobalEntitySettingsInput & {
  createdBy: string;
};

export type UpdateGlobalEntitySettingsInput = GlobalEntitySettingsInput & {
  updatedBy: string;
};
