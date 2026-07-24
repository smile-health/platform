import { TCommonPaginationResponse, TCommonResponseList } from './common';
import { TWasteHierarchyChild } from './waste-hierarchy';

export type TWasteSpecification = {
  id: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  regionId: number;
  effectiveFrom: string;
  effectiveTo: string;
  wasteTypeId: number;
  wasteGroupId: number;
  wasteCharacteristicsId: number;
  wasteCode: string;
  wasteBagColorCode: WasteBag;
  storageRuleType: number;
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
  wasteType: TWasteHierarchyChild;
  wasteGroup: TWasteHierarchyChild;
  wasteCharacteristics: TWasteHierarchyChild;
  userName: string;
  minimunDecayDay?: number;
  hasMultipleTransporters: boolean;
};

export enum WasteBag {
  BLACK = 'BLACK',
  GRAY = 'GRAY',
  YELLOW = 'YELLOW',
  PURPLE = 'PURPLE',
  BROWN = 'BROWN',
  RED = 'RED',
  NONE = 'NONE',
}

export enum TreatmentMethod {
  PYROLYSIS = 'PYROLYSIS',
  DISINFECTION = 'DISINFECTION',
}

export enum DisposalMethod {
  TRANSPORT = 'TRANSPORTER',
  TRANSPORTER_TREATMENT = 'TRANSPORTER_TREATMENT',
  TRANSPORTER_LANDFILL = 'TRANSPORTER_LANDFILL',
  TRANSPORTER_RECYCLER = 'TRANSPORTER_RECYCLER',
  SPECIALIZED_TREATMENT_PROVIDER = 'SPECIALIZED_TREATMENT_PROVIDER',
  TRANSPORTER_GOVERNMENT = 'TRANSPORTER_GOVERNMENT',
  TRANSPORTER_GOVERNMENT_WASTE_BANK = 'TRANSPORTER_GOVERNMENT_WASTE_BANK',
}

export enum VehicleTypes {
  BOX_TRUCK = 'BOX_TRUCK',
  REFRIGERATED_BOX_TRUCK = 'REFRIGERATED_BOX_TRUCK',
  OPEN_BODY_TRUCK = 'OPEN_BODY_TRUCK',
  TANKER = 'TANKER',
  HAZARDOUS_MATERIAL_TRUCK = 'HAZARDOUS_MATERIAL_TRUCK',
  RADIOACTIVE_MATERIAL_TRUCK = 'RADIOACTIVE_MATERIAL_TRUCK',
  FLATBED_TRUCK = 'FLATBED_TRUCK',
  LOADER_TRUCK = 'LOADER_TRUCK',
  TRAILER = 'TRAILER',
  VAN = 'VAN',
}

export type GetWasteSpecificationResponse = TCommonResponseList & {
  data: {
    data: TWasteSpecification[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetWasteSpecificationDetailResponse = {
  data: TWasteSpecification;
  status: string;
};

export type WasteSpecificationInput = {
  wasteTypeId: number;
  wasteGroupId: number;
  wasteCharacteristicsId: number;
  wasteCode: string;
  wasteBagColorCode: string;
  storageRuleType: string;
  useColdStorage: number;
  coldStorageMaxHours: number;
  tempStorageMaxHours: number;
  storageRule: string;
  allowHealthcareFacilityTreatment: number;
  treatmentMethod: string;
  disposalMethod: string;
  allowedVehicleTypes: string;
};

export type CreateWasteSpecificationInput = WasteSpecificationInput & {
  createdBy: string;
};

export type UpdateWasteSpecificationInput = WasteSpecificationInput & {
  updatedBy: string;
};
