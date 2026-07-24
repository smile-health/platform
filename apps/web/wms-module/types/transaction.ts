import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TWasteTransaction = {
  id: number;
  createdAt: string;
  wasteCode: string;
  qrCode: string;
  wasteCharacteristicsName: string;
  wasteCharacteristicsNameEn: string;
  wasteStatus: string;
  weightInKgs: string;
  actualStorageEndDatetime: string | null;
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  transporterId: number | null;
  thirdPartyId: number | null;
  wasteSource: string;
  wasteTreatment: string;
  healthcareFacilityName: string;
  provinceName: string;
  thirdPartyName: string | null;
  wasteTypeName: string;
  wasteTypeNameEn: string;
  wasteGroupName: string;
  wasteGroupNameEn: string;
  wasteStatusUpdatedAt: string;
  wasteGroupNumber: string;
  checkInDate: string;
  checkOutDate: string;
  storageMax: string;
  weightOutKgs: string;
  wasteBagOut: number;
  manifestDocNumber: string;
  transporterName: string;
  disposalMethod: string;
  operatorHealthcareName: string;
};

export type TWasteTransactionTotal = {
  wasteBags: number;
  weightInKgs: string;
  wasteInBags: number;
  weightOutKgs: string;
  wasteOutBags: number;
};

export type TWasteTrackingDetail = {
  wasteBagStatusUpdateDate: string;
  wasteAction: string;
  wasteStatus: string;
  groupId: string;
  totalBags: number;
  totalWeight: string;
  wasteBagQrCode: string;
  disposalMethod: string;
};

export type GetWasteTransactionResponse = TCommonResponseList & {
  data: {
    data: TWasteTransaction[];
    totals: TWasteTransactionTotal;
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetTransactionDetailResponse = {
  data: TWasteTrackingDetail[];
  status: string;
};
