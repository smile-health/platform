import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type GetChartParams = {
  startDate?: string;
  endDate?: string;
  provinceId?: number;
  regencyId?: number;
  entityTag?: number;
  healthcareFacilityId?: string;
  wasteTypeId?: string;
  wasteGroupId?: string;
  wasteCharacteristicsId?: string;
  isBags?: number;
};

export type TChartResponse = {
  label: string;
  value: number;
  labelType?: string;
  color?: string;
};

export type GetChartResponse = {
  data: TChartResponse[];
  status: string;
};

export type TChartWasteGroupSummary = {
  data: TChartResponse[];
  total: number;
};

export type GetChartWasteGroupSummaryResponse = {
  data: TChartWasteGroupSummary;
  status: string;
};

export type DataValue = {
  label: string;
  value: number;
  labelType?: string;
  color?: string;
}[];

export type TDashboardTabs<T> = {
  id: T;
  label: string;
};

export type TEntity = {
  healthcareFacilityName: string;
  provinceName: string;
  regencyName: string;
  value: number;
  wasteGroupName?: string;
  wasteFullName?: string;
  avgValue?: number;
  maxValue?: number;
  gapValue?: number;
};

export type GetEntityResponse = TCommonResponseList & {
  data: {
    data: TEntity[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};
