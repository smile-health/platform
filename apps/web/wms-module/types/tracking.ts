import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TWasteTrackingCharacteristics = {
  wasteStatus: string;
  totalWeightInKgs: string;
  avgWeightPerDay: string;
  totalWasteBag: number;
  avgWasteBagPerDay: string;
  wasteTypeName: string;
  wasteTypeNameEn: string;
  wasteGroupName: string;
  wasteGroupNameEn: string;
  wasteCharacteristicsName: string;
  wasteCharacteristicsNameEn: string;
  disposalMethod: string;
  healthcareFacilityName?: string;
};

export type TWasteTrackingWasteSource = {
  sourceType: string;
  totalWasteBag: number;
  totalWeightInKgs: string;
  wasteSourceName: string;
};

export type TWasteTrackingCharacteristicsRow = TWasteTrackingCharacteristics & {
  rowSpan: number;
  facilityRowSpan: number;
  isLabel: boolean;
};

export type GetWasteTrackingCharacteristicsResponse = TCommonResponseList & {
  data: {
    data: TWasteTrackingCharacteristics[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetWasteTrackingWasteSourceResponse = TCommonResponseList & {
  data: {
    data: TWasteTrackingWasteSource[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};
