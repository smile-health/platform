import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TAssetDongle = {
  assetId: string;
  createdAt: string;
};

export type GetAssetDongleResponse = TCommonResponseList & {
  data: {
    data: TAssetDongle[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type CreateAssetDongleInput = {
  assetId: string;
};
