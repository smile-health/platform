import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TWasteGroup = {
  wasteQrCode: string;
  wasteTypeName: string;
  wasteTypeNameEn: string;
  wasteGroupName: string;
  wasteGroupNameEn: string;
  wasteCharacteristicsName: string;
  wasteCharacteristicsNameEn: string;
  wasteWeight: string;
};

export type GetWasteGroupResponse = TCommonResponseList & {
  data: {
    data: TWasteGroup[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export interface TWasteGroupDetail {
  groupId: string;
  wasteTypeName: string;
  wasteGroupName: string;
  wasteCharacteristicsName: string;
  totalWeightInKgs: number;
  wasteQrCode: string;
  wasteBags: WasteBag[];
}

export interface WasteBag {
  groupId: string;
  wasteBagQrcodeId: string;
  wasteTypeName: string;
  wasteGroupName: string;
  wasteCharacteristicsName: string;
  weightInKgs: number;
}

export type GetWasteGroupDetailResponse = {
  data: TWasteGroupDetail[];
  status: string;
};
