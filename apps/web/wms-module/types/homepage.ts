import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type GetSummaryWasteHierarchyResponse = TCommonResponseList & {
  data: {
    data: any[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type TWasteGroupHF = {
  wasteGroupNumber: string;
  wasteTypeName: string;
  wasteGroupName: string;
  wasteCharacteristicsName: string;
  wasteSource: string;
  wasteInDate: string;
  storageDateLimit: string | null;
  totalWeightInKgs: string;
  lastFollowUp: string | null;
  wasteStatus: string;
  healthcareFacilityId: number;
  wasteTypeId: number;
  wasteGroupId: number;
  wasteCharacteristicsId: number;
  transporterOperatorId: string;
  treatmentOperatorId: string;
  transporterOperatorName: string;
  treatmentOperatorName: string;
  groupId: number;
  treatmentType: string;
};

export type TWasteGroupTP = {
  wasteGroupId: number;
  wasteGroupNumber: string;
  healthcareFacilityId: number;
  totalWeightInKgs: string;
  transporterOperatorId: number;
  vehicleNumber: string;
  treatmentOperatorId: number;
  provinceId: number;
  cityId: number;
  transporterOperatorName: string;
  treatmentOperatorName: string;
  manifestNumber: string;
  healthcareName: string;
  transporterName: string;
  thirdPartyName: string;
  handOverTime: string;
};

export type GetWasteGroupHFResponse = TCommonResponseList & {
  data: {
    data: TWasteGroupHF[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetWasteGroupTPResponse = TCommonResponseList & {
  data: {
    data: TWasteGroupTP[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type TDetailTransactionWaste = {
  wasteGroupNumber: string;
  wasteTypeName: string;
  wasteGroupName: string;
  wasteCharacteristicsName: string;
  wasteSource: string;
  wasteInDate: string;
  storageDateLimit: string | null;
  totalWeightInKgs: string;
  lastFollowUp: string | null;
  wasteStatus: string;
  healthcareFacilityId: number;
  wasteTypeId: number;
  wasteGroupId: number;
  wasteCharacteristicsId: number;
  transporterOperatorId: string;
  treatmentOperatorId: string;
  transporterOperatorName: string;
  treatmentOperatorName: string;
  groupId: number;
  treatmentType: string;
};

export type GetDetailTransactionWasteResponse = TCommonResponseList & {
  data: {
    data: TDetailTransactionWaste[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type THistoryTransactionWaste = {
  wasteBagStatus: string;
  updatedAtStatus: string;
};

export type GetHistoryTransactionWasteResponse = TCommonResponseList & {
  data: {
    data: THistoryTransactionWaste[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type TWasteCharacteristicSummary = {
  wasteGroupName: string;
  wasteCharacteristicsName: string;
  wasteCode: string;
  totalWasteBag: number;
  totalWeight: string;
};

export type GetWasteCharacteristicSummaryResponse = TCommonResponseList & {
  data: {
    data: TWasteCharacteristicSummary[];
  };
  status: string;
};
