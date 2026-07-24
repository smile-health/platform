import { Color } from '../../../../packages/ui/src/types/component';
import { TCommonResponseList } from './common';
import { TEntityAPICommonFilters } from './entity';

export enum WorkingStatusEnum {
  FUNCTION = 1,
  STANDBY = 2,
  REPAIR = 3,
  DAMAGED = 4,
  NEED_REPAIR = 5,
  DISPOSED = 6,
}

export type WorkingStatusOption = {
  value: WorkingStatusEnum;
  label: string;
  color: Color;
};

export enum ASSET_INVENTORY_STATUS {
  INACTIVE = 0,
  ACTIVE = 1,
}

export type THealthcareAsset = {
  id: number;
  assetId?: string;
  serial_number: string;
  updated_at: string;
  other_asset_model_name: string | null;
  other_asset_type_name: string | null;
  other_manufacture_name: string | null;
  other_budget_source_name: string | null;
  asset_model: {
    id: number;
    name: string;
  } | null;
  asset_type: {
    id: number;
    name: string;
  } | null;
  manufacture: {
    id: number;
    name: string;
  } | null;
  working_status: {
    id: number;
    name: string;
  } | null;
  entity: {
    id: number;
    name: string;
    is_puskesmas: number;
  } | null;
  province: {
    id: string;
    name: string;
  } | null;
  regency: {
    id: string;
    name: string;
  } | null;
  ownership: {
    id: number;
    name: string;
    qty: number;
  } | null;
  status: {
    id: number;
    name: string;
  } | null;
  user_updated_by: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    fullname: string;
  } | null;
};

export type GetHealthcareAssetParams = TEntityAPICommonFilters & {
  status?: number;
  working_status_id?: number;
};

export type GetHealthcareAssetResponse = TCommonResponseList & {
  data: THealthcareAsset[];
  statusCode: number;
};

export type GetHealthcareAssetDetailResponse = {
  data: THealthcareAsset;
  status: string;
};

export type UpdateHealthcareAssetInput = {
  assetId?: string;
};
