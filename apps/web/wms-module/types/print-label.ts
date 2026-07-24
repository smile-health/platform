import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type WasteSource = {
  id: number;
  healthcareFacilityId: number;
  sourceType: string;
  internalSourceName: string | null;
  internalTreatmentName: string | null;
  externalHealthcareFacilityId: number | null;
  externalHealthcareFacilityName: string | null;
  isActive: boolean;
};

export type WasteClassificationChild = {
  id: number;
  description: string;
  descriptionEn: string;
  name: string;
  nameEn: string;
};

export type WasteClassification = {
  id: number;
  regionId: number;
  effectiveFrom: string;
  effectiveTo: string;
  wasteTypeId: number;
  wasteGroupId: number;
  wasteCharacteristicsId: number;
  wasteCode: string;
  wasteBagColorCode: string;
  storageRuleType: string;
  useColdStorage: boolean;
  coldStorageMinHours: number;
  coldStorageMaxHours: number;
  tempStorageMinHours: number;
  tempStorageMaxHours: number;
  storageRule: string;
  allowHealthcareFacilityTreatment: boolean;
  treatmentMethod: string;
  disposalMethod: string;
  allowedVehicleTypes: string;
  wasteType: WasteClassificationChild;
  wasteGroup: WasteClassificationChild;
  wasteCharacteristics: WasteClassificationChild;
};

export type TPrintLabel = {
  id: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  labelCount: number;
  qrCode: string;
  wasteSource: WasteSource;
  wasteClassification: WasteClassification;
  userName: string;
};

export type GetPrintLabelResponse = TCommonResponseList & {
  data: {
    data: TPrintLabel[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetPrintLabelDetailResponse = {
  data: TPrintLabel;
  status: string;
};

export type PrintQRCodePayload = {
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  labelCount: number;
};

export type CreatePrintLabelInput = PrintQRCodePayload & {
  createdBy: string;
};

export type UpdatePrintLabelInput = PrintQRCodePayload & {
  updatedBy: string;
};
