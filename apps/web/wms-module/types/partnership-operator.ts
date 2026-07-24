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

export type TPartnershipOperator = {
  partnershipId: number;
  operatorId: string;
  userName: string;
  firstName: string;
  lastName: string | null;
  entityName: string;
  email: string;
  mobilePhone: string;
  entityType?: string;
  userRole?: string;
  partnership?: Partnership;
};

export type GetPartnershipOperatorResponse = TCommonResponseList & {
  data: {
    data: TPartnershipOperator[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type TOperatorThirdparty = {
  partnershipId: number;
  operatorId: string;
  consumerName: string;
  operatorName: string;
};

export type GetOperatorThirdpartyResponse = TCommonResponseList & {
  data: {
    data: TOperatorThirdparty[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type OperatorThirdpartyInput = {
  partnershipId: number;
  operatorId: string;
};

export type CreateOperatorThirdpartyInput = OperatorThirdpartyInput;

export type UpdateOperatorThirdpartyInput = OperatorThirdpartyInput;

export type Operator = {
  operatorId: string;
  operatorName: string;
};

export type GetOperatorResponse = {
  data: Operator[];
  status: string;
};
