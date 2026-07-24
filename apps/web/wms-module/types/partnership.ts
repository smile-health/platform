import { TCommonPaginationResponse, TCommonResponseList } from './common';
import { TEntities } from './entity';
import { WasteClassification } from './print-label';

export enum ConsumerType {
  HEALTHCARE_FACILITY = 'HEALTHCARE_FACILITY',
}

export enum ProviderType {
  LANDFILLER = 'LANDFILLER',
  TREATMENT = 'TREATMENT',
  RECYCLER = 'RECYCLER',
  SPECIALIZED_TREATMENT_PROVIDER = 'SPECIALIZED_TREATMENT_PROVIDER',
  TRANSPORTER = 'TRANSPORTER',
  TRANSPORTER_RECYCLER = 'TRANSPORTER_RECYCLER',
  TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER = 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
  TRANSPORTER_LANDFILL = 'TRANSPORTER_LANDFILL',
  TRANSPORTER_TREATMENT = 'TRANSPORTER_TREATMENT',
  TRANSPORTER_GOVERNMENT = 'TRANSPORTER_GOVERNMENT',
  TRANSPORTER_GOVERNMENT_WASTE_BANK = 'TRANSPORTER_GOVERNMENT_WASTE_BANK',
}

export enum PartnershipStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
}

export type TPartnership = {
  id: number;
  consumerDetail?: TEntities;
  picName?: string;
  picPhoneNumber?: string;
  picPosition?: string;
  pricePerKg?: string;
  contractId?: string;
  contractStartDate: string;
  contractEndDate: string;
  consumerId: number;
  consumerType: ConsumerType;
  consumerName: string;
  consumerProvinceName: string;
  consumerCityName: string;
  wasteCategoryId?: number;
  providerId: number;
  providerType: ProviderType;
  providerName: string;
  providerDetail: TEntities;
  partnershipStatus: PartnershipStatus;
  hasIncinerator: boolean;
  hasAutoclave: boolean;
  entity?: TEntities | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  treatmentCompanyName: string;
  landfilCompanyName: string;
  recycleCompanyName: string;
  wasteClassificationId: number;
  wasteClassification: WasteClassification;
  transporterId: number | null;
  nib: string;
};

export type TClassificationPartnership = {
  wasteClassificationId: number;
  wasteCharacteristicsName?: string;
  wasteCode?: string;
  price?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractId?: string;
  partnershipStatus?: PartnershipStatus;
  providerType?: ProviderType;
};

export type GetClassificationPartnershipResponse = TCommonResponseList & {
  data: {
    data: TClassificationPartnership[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetPartnershipResponse = TCommonResponseList & {
  data: {
    data: TPartnership[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetPartnershipDetailResponse = {
  data: TPartnership;
  status: string;
};

export type PartnershipPayload = {
  contractStartDate: string;
  contractEndDate: string;
  consumerId: number;
  consumerType: string;
  contractId: string;
  wasteClassificationId: number;
  providerId: number;
  providerType: string;
  partnershipStatus: string;
  hasIncinerator: boolean;
  hasAutoclave: boolean;
  picName: string;
  picPhoneNumber: number;
  picPosition: string;
  pricePerKg: number;
};

export type CreatePartnershipInput = PartnershipPayload & {
  createdBy: string;
};

export type UpdatePartnershipInput = PartnershipPayload & {
  updatedBy: string;
};

export type HealthcareThirdparty = {
  id: number;
  consumerId: string;
  consumerName: string;
};

export type ThirdpartyPatner = {
  id: number;
  providerId: string;
  providerName: string;
};

export type GetHealthcareThirdpartyResponse = {
  data: HealthcareThirdparty[];
  status: string;
};

export type GetThirdpartyPatnerResponse = {
  data: ThirdpartyPatner[];
  status: string;
};

export type WasteCassificationPartnership = {
  id: number;
  wasteClassificationId: number;
  wasteCharacteristicName: string;
  providerType: ProviderType;
  contractStartDate: Date;
  contractEndDate: Date;
  contractId: string;
};

export type GetWasteCassificationResponse = {
  data: WasteCassificationPartnership[];
  status: string;
};
