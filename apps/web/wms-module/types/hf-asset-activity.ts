import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type THFAssetActivity = {
  hfAssetId: number;
  operatorId: string;
  activityType: string;
  createdAt: string;
  createdBy: string;
  startDate: string;
  endDate: string;
};

export type GetHFAssetActivityResponse = TCommonResponseList & {
  data: {
    data: THFAssetActivity[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type HFAssetActivityPayload = {
  hfAssetId: number;
  startDate: string;
  endDate?: string;
  operatorId: string;
  activityType: string;
};

export enum ActivityType {
  MAINTENANCE = 'MAINTENANCE',
  CALIBRATION = 'CALIBRATION',
}
