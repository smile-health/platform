import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type Manufacturer = {
  id: number;
  name: string;
  description: string;
};

export type AssetModel = {
  id: number;
  name: string;
  description: string;
  assetType: string;
  manufacturerId: number;
  manufacturer: Manufacturer;
};
export type THealthcare = {
  id: number;
  createdBy: string;
  updatedBy: string;
  assetStatus: string;
  healthcareFacilityId: number;
  healthcareFacilityName?: string;
  assetId: string;
  modelId: number;
  isIotEnable: number;
  assetModel: AssetModel;
  yearOfProduction: number;
  warrantyEndDate: string;
  warrantyStartDate: string;
  createdAt: string;
  updatedAt: string;
  entityName?: string;
  dateCalibrationActivity?: string;
  dateMaintenanceActivity?: string;
};

export type GetHealthcareResponse = TCommonResponseList & {
  data: {
    data: THealthcare[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetHealthcareDetailResponse = {
  data: THealthcare;
  status: string;
};

export type HealthcarePayload = {
  healthcareFacilityId: number;
  modelId: number;
  isIotEnable: number;
  assetId: string;
  assetStatus: string;
};

export type CreateHealthcareInput = HealthcarePayload & {
  createdBy: string;
};

export type UpdateHealthcareInput = HealthcarePayload & {
  updatedBy: string;
};
