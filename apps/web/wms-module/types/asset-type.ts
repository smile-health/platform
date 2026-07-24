import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TAssetType = {
  id: number;
  name: string;
  description: string;
  maxTemperature: string;
  minTemperature: string;
  updatedAt: string;
  updatedBy: string;
};

export type GetAssetTypeResponse = TCommonResponseList & {
  data: {
    data: TAssetType[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetAssetTypeDetailResponse = {
  data: TAssetType;
  status: string;
};

export type AssetTypeInput = {
  name: string;
  description: string;
};

export type CreateAssetTypeInput = AssetTypeInput & {
  createdBy: string;
};

export type UpdateAssetTypeInput = AssetTypeInput & {
  updatedBy: string;
};
