import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TWasteHierarchy = {
  id: number;
  parentHierarchyId: number;
  regionId: number;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  isResidue: boolean;
  level: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  isActive?: boolean;
  userName?: string;
  wasteClassification?: WasteClassificationChild;
};

export type WasteClassificationChild = {
  id: number;
  wasteCode: string;
};

export type TWasteHierarchyChild = {
  id: number;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
};

export type TWasteGroup = TWasteHierarchy & {
  wasteType: TWasteHierarchyChild;
};

export type TWasteCharacteristic = TWasteHierarchy & {
  wasteType: TWasteHierarchyChild;
  wasteGroup: TWasteHierarchyChild;
};

export type GetWasteTypeResponse = TCommonResponseList & {
  data: {
    data: TWasteHierarchy[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetWasteGroupResponse = TCommonResponseList & {
  data: {
    data: TWasteGroup[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetWasteCharacteristicResponse = TCommonResponseList & {
  data: {
    data: TWasteCharacteristic[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetAllByParentHierarchyResponse = {
  data: TWasteHierarchy[];
  status: string;
};

export type WasteTypeInput = {
  name: string;
  description: string;
  regionId: number;
};

export type CreateWasteTypeInput = WasteTypeInput & {
  createdBy: string;
};

export type WasteGroupInput = {
  name: string;
  description: string;
  regionId: number;
  parentHierarchyId: number;
  level: number;
};

export type CreateWasteGroupInput = WasteGroupInput & {
  createdBy: string;
};

export type WasteCharacteristicInput = {
  name: string;
  description: string;
  regionId: number;
  parentHierarchyId: number;
  level: number;
};

export type CreateWasteCharacteristicInput = WasteCharacteristicInput & {
  createdBy: string;
};

export type GetWasteTypeDetailResponse = {
  data: TWasteHierarchy;
  status: string;
};

export type GetWasteGroupDetailResponse = {
  data: TWasteGroup;
  status: string;
};

export type GetWasteCharacteristicDetailResponse = {
  data: TWasteCharacteristic;
  status: string;
};

export type UpdateWasteTypeInput = WasteTypeInput & {
  updatedBy: string;
};

export type UpdateWasteGroupInput = WasteGroupInput & {
  updatedBy: string;
};

export type UpdateWasteCharacteristicInput = WasteCharacteristicInput & {
  updatedBy: string;
};

export type TWasteHierarchyClassification = {
  wasteTypeName: string;
  wasteTypeNameEn: string;
  wasteTypeDescription: string;
  wasteTypeDescriptionEn: string;
  wasteGroupName: string;
  wasteGroupNameEn: string;
  wasteGroupDescription: string;
  wasteGroupDescriptionEn: string;
  wasteCharacteristicsName: string;
  wasteCharacteristicsNameEn: string;
  wasteCharacteristicsDescription: string;
  wasteCharacteristicsDescriptionEn: string;
};

export type GetWasteHierarchyClassificationResponse = {
  data: TWasteHierarchyClassification[];
  status: string;
};

export type WasteType = {
  name: string;
  description: string;
};

export type WasteGroup = {
  name: string;
  description: string;
};

export type WasteCharacteristics = {
  name: string;
  description: string;
};

export type TWasteHierarchyClassificationDataRow = {
  wasteType: WasteType;
  wasteGroup: WasteGroup;
  wasteCharacteristicsList: WasteCharacteristics[];
  id: string;
};
