import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TWasteSource = {
  id: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  healthcareFacilityId: number;
  sourceType: string;
  internalSourceName: string;
  internalTreatmentName: string;
  externalHealthcareFacilityId: number;
  externalHealthcareFacilityName: string;
  isActive: boolean;
  userName: string;
};

export enum SourceType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  INTERNAL_TREATMENT = 'INTERNAL_TREATMENT',
}

export type GetWasteSourceResponse = TCommonResponseList & {
  data: {
    data: TWasteSource[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type WasteSourceInput = {
  createdBy: string;
  sourceType: string;
  internalSourceName: string;
  internalTreatmentName?: string;
  externalHealthcareFacilityId?: number;
  externalHealthcareFacilityName?: string;
  isActive: boolean;
};

export type CreateWasteSourceInput = WasteSourceInput & {
  createdBy: string;
};

export type UpdateWasteSourceInput = WasteSourceInput & {
  updatedBy: string;
};

export type GetWasteSourceDetailResponse = {
  data: TWasteSource;
  status: string;
};
