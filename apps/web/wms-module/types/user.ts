import { ExternalProperties } from './auth';
import { TCommonPaginationResponse, TCommonResponseList } from './common';
import { TProgram } from './program';

type TUserBase = {
  id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  date_of_birth: null;
  gender: number;
  mobile_phone: string;
  address: string;
  created_by: null;
  updated_by: null;
  deleted_by: null;
  created_at: string;
  user_uuid: string;
  updated_at: string;
  entity_id: number;
  role: number;
  role_label: string;
  village_id: null;
  timezone_id: number;
  token_login: string;
  status: number;
  last_login: string;
  last_device: number;
  mobile_phone_2: null;
  mobile_phone_brand: null;
  mobile_phone_model: null;
  imei_number: null;
  sim_provider: null;
  sim_id: null;
  iota_app_gui_theme: string;
  permission: string;
  application_version: null;
  last_mobile_access: null;
  view_only: number;
  change_password: null;
  manufacture_id: null;
  fcm_token: null;
  manufacture: TUserManufacturer | null;
  external_properties: ExternalProperties;
};

type TUserRole = {
  id: number;
  name: string;
  name_en: string;
  type: string;
};

export type TUser = TUserBase & {
  entity: TUserEntity;
  programs: TProgram[];
  is_active: boolean;
  userRole: TUserRole;
};

export type TUserDetail = TUserBase & {
  entity: TUserDetailEntity;
  location: TUserLocation;
  program_ids: number[];
  external_roles: string[];
};

type TUserLocation = {
  province: TUserLocationDetail;
  regency: TUserLocationDetail;
  subdistrict: TUserLocationDetail;
  village: TUserLocationDetail;
};

type TUserLocationDetail = {
  id: number;
  name: string;
};

type TUserEntity = {
  id: number;
  name: string;
  type: number;
  address: string;
  tag: string;
  location: string;
};

type EntityType = {
  id: number;
  name: string;
  integration_type: number;
};

type TUserDetailEntity = TUserEntity & {
  programs: TProgram[];
  entity_type: EntityType;
};

type TUserManufacturer = {
  id: number;
  name: string;
  type: number;
  reference_id: string;
  description: string;
  contact_name: string;
  phone_number: string;
  email: string;
  address: string;
  status: number;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

export type GetUsersResponse = TCommonResponseList & {
  data: TUser[];
};

export type GetUserWmsResponse = TCommonResponseList & {
  data: {
    data: TUser[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetUserWmsDetailResponse = {
  data: TUser;
  status: string;
};
