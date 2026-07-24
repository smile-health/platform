import {
  TCommonFilter,
  TCommonPaginationResponse,
  TCommonResponseList,
} from './common';

export type TManufacture = {
  id: number;
  assetType: string;
  manufacturerId: string;
  manufacturer: TManufacturer;
  name: string;
  description: string;
  updatedAt: string;
  updatedBy: string;
  userName: string;
};

export type TManufacturer = {
  id: number;
  name: string;
  description: string;
};

export type GetManufactureResponse = TCommonResponseList & {
  data: {
    data: TManufacture[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type ListManufacturersParams = TCommonFilter & {
  search?: string;
};

export type ListManufacturersResponse = TCommonResponseList & {
  data: {
    data: TManufacturer[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type ManufactureInput = {
  name: string;
  description: string;
  assetType: string;
  manufacturerId: number;
};

export type CreateManufactureInput = ManufactureInput & {
  createdBy: string;
};

export type UpdateManufactureInput = ManufactureInput & {
  updatedBy: string;
};

export type GetManufactureDetailResponse = {
  data: TManufacture;
  status: string;
};

export type CreateManufactureOptionInput = {
  name: string;
  description: string;
  createdBy: string;
};
