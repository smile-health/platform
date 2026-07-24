import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TEntityLocation = {
  id: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  entityId: number;
  entityName: string;
  locationName: string;
  latitude: number;
  longitude: number;
  distanceLimitInMeters: number;
  address: string;
  provinceId: number;
  provinceName: string;
  cityId: number;
  cityName: string;
};

export type GetEntityStorageLocationResponse = {
  data: TEntityLocation[];
  status: string;
};

export type GetEntityLocationResponse = {
  data: TEntityLocation;
  status: string;
};

export type GetTreatmentLocationResponse = TCommonResponseList & {
  data: {
    data: TEntityLocation[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type EntityLocationInput = {
  entityId?: number;
  locationName: string;
  latitude: number;
  longitude: number;
  distanceLimitInMeters: number;
  address: string;
  provinceId: number;
  provinceName: string;
  cityId: number;
  cityName: string;
};

export type CreateEntityLocationInput = EntityLocationInput & {
  createdBy: string;
};

export type UpdateEntityLocationInput = EntityLocationInput & {
  updatedBy: string;
};
