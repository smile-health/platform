import {
  TCommonFilter,
  TCommonPaginationResponse,
  TCommonResponseList,
} from './common';

export type GetOverviewParams = {
  from?: string;
  to?: string;
  activity_ids?: number;
  material_type_ids?: number;
  material_ids?: number;
  province_id?: number;
  regency_id?: number;
  entity_tag_ids?: number;
  entity_id?: string;
  period?: string;
  transaction_type?: string;
  information_type?: string;
  transaction_type_ids?: number;
  api_list_type?: string;
};

export type GetEntityParams = TCommonFilter & GetOverviewParams;

export type GetEntityResponse = TCommonResponseList & {
  data: {
    data: TEntityItem[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type TEntityItem = {
  healthcareFacilityId: number;
  healthcareFacilityName: string;
  provinceId: number;
  provinceName: string;
  regencyId: number;
  regencyName: string;
  [key: string]: any;
};

export type TOverviewEntityItem = {
  activeEntities: number;
  inactiveEntities: number;
  totalEntities: number;
};

export type GetOverviewEntityResponse = {
  data: TOverviewEntityItem;
  status: string;
};
