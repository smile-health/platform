import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type Partnership = {
  id: number;
  contract_start_date: string;
  contract_end_date: string;
  consumer_id: number;
  consumer_type: string;
  waste_category_id: number;
  provider_id: number;
  provider_type: string;
  partnership_status: string;
  has_incinerator: boolean;
  has_autoclave: boolean;
  contract_id: string;
  pic_name: string | null;
  pic_position: string | null;
  pic_phone_number: string | null;
  price_per_kg: number | null;
};

export interface TPartnershipVehicle {
  id: number;
  entityId: number;
  vehicleType: string;
  vehicleNumber: string;
  capacityInKgs: number;
  entityName?: string;
}

export type TPartnershipVehicleMap = {
  partnershipId: number;
  vehicleId: number;
  partnership: Partnership;
  partnerVehicle: TPartnershipVehicle;
};

export type GetPartnershipVehicleMapResponse = TCommonResponseList & {
  data: {
    data: TPartnershipVehicleMap[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetPartnershipVehicleResponse = TCommonResponseList & {
  data: {
    data: TPartnershipVehicle[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetPartnershipVehicleDetailResponse = {
  data: TPartnershipVehicle;
  status: string;
};

export type PartnershipVehiclePayload = {
  capacityInKgs: number;
  vehicleType: string;
  vehicleNumber: string;
};

export type UpdatePartnershipVehicleInput = PartnershipVehiclePayload & {
  updatedBy: string;
  entityId: number;
};

export type BulkHealthcarePartnershipVehicleInput = PartnershipVehiclePayload & {
  createdBy: string;
  entityIds: string;
};
