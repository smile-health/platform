import { ExternalProperties } from './auth';
import { TCommonPaginationResponse, TCommonResponseList } from './common';
import { TProgram } from './program';

export type TEntitiesTypeLabel = 'FASKES' | 'PROVINSI' | 'KOTA' | 'PKC';

export enum ENTITY_TYPE {
  PROVINCE = 1,
  REGENCY = 2,
  HEALTHCARE_FACILITY = 3,
  PKC = 4,
  VENDOR = 5,
  THIRD_PARTY = 6,
}

export enum ENTITY_TYPE_NAME {
  PROVINCE = 'province',
  REGENCY = 'regency',
  HEALTHCARE_FACILITY = 'healthcare_facility',
  PKC = 'district_health_center',
  VENDOR = 'central',
  THIRD_PARTY = 'third_party',
}

type TUser = {
  id: number;
  username: string;
  firstname: string;
  lastname: string | null;
  mobile_phone: string | null;
};

type TEntityLocation = {
  id: number;
  name: string;
  level: number;
};

export type TEntities = {
  // workspace
  id: number;
  id_satu_sehat: string;
  name: string;
  entity_tag_name: string;
  code: string | null;
  location: string | null;
  status: number;
  type_label: TEntitiesTypeLabel;
  address: string;
  type: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  province_id: string;
  regency_id: string;
  village_id: string | null;
  sub_district_id: string | null;
  lat: string | null;
  lng: string | null;
  latitude: string | null;
  longitude: string | null;
  postal_code: string | null;
  is_vendor: number;
  bpom_key: string | null;
  is_puskesmas: number;
  rutin_join_date: string | null;
  is_ayosehat: number;
  mapping_entity: string | null;
  entity_tags: Array<{ id: number; title: string }>;
  entity_tag?: { id: number; title: string };
  province: {
    id: string;
    name: string;
  } | null;
  regency: {
    id: string;
    name: string;
  } | null;
  sub_district: {
    id: string;
    name: string;
  } | null;
  village: {
    id: string;
    name: string;
  } | null;
  programs: TProgram[];
  locations?: Array<TEntityLocation>;
};

export interface TEntitiesWms {
  id: number;
  id_satu_sehat: string;
  name: string;
  type: number;
  address: string;
  count_dongle: number;
  tag: string;
  province_id: string;
  regency_id: string;
  sub_district_id: string;
  village_id: string;
  integration_type: number;
  integration_client_id: number;
  location: string;
  external_properties: ExternalProperties;
  entity_type_id: number;
  entity_type_name: string;
  entity_type_integration_type: number;
  province_name: string;
  regency_name: string;
  district_name: string;
  updated_at: string;
  code: string;
  nib: string;
  head_name: string;
  email: string;
  gender: number; // 1 = male, 0 = female
  mobile_phone: string;
  latitude: string;
  longitude: string;
  total_bad_room: number;
  percentage_bad_room: number;
  is_active: boolean;
}

export type TDetailActivityDate = {
  id?: number | null;
  activity_id?: number;
  name?: string;
  start_date: string | null | undefined;
  end_date?: string | null;
  entity_activity_id?: number | null;
  is_expired?: boolean;
};

export type TDetailEntity = {
  id: number;
  name: string;
  address: string;
  code: string;
  type: string | number;
  entity_type?: Array<{ id: number; name: string }>;
  province_name: string;
  regency_name: string;
  count_dongle: number;
  status: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  province_id: string;
  regency_id: string;
  village_id: string | null;
  sub_district_id: string;
  lat: string | null;
  lng: string | null;
  postal_code: string | null;
  is_vendor: number | null;
  bpom_key: string | null;
  is_puskesmas: number | null;
  rutin_join_date: string | null;
  is_ayosehat: number | null;
  users: Array<TUser> | null;
  entity_tags: Array<{
    id: number;
    title: string;
  }> | null;
  entity_tag: {
    id: number;
    title: string;
  } | null;
  activities_date: TDetailActivityDate[] | null;
  user_updated_by?: {
    firstname: string;
    lastname: string;
  };
  programs: TProgram[];
  locations: Array<{
    id: number;
    name: string;
    level: number;
  }>;
  location: string;
  entity_tag_name: string;
  last_update: string | null;
  entity_tag_id: number | null;
  province: {
    id: string;
    name: string;
  };
  regency: {
    id: string;
    name: string;
  };
  sub_district: {
    id: string;
    name: string;
  };
  village: {
    id: string;
    name: string;
  };
};

export type GetEntityListResponse = TCommonResponseList & {
  data: TEntities[];
  status: string;
  statusCode: number;
};

export type GetEntityDetailResponse = {
  data: TEntities;
  status: string;
};

export type GetEntityWmsDetailResponse = {
  data: TEntitiesWms;
  status: string;
};

export type UpdateEntityInput = {
  head_name: string;
  email: string;
  mobile_phone: string;
  nib: string;
  gender: number;
};

export type TEntityForm = {
  id?: string;
  code: string;
  name: string;
  type: number;
  entity_tag_id?: number;
  is_vendor?: number;
  is_puskesmas?: number;
  is_ayosehat?: number;
  province_id?: string | null;
  regency_id?: string | null;
  sub_district_id?: string | null;
  village_id?: string | null;
  postal_code: string | null;
  address: string;
  lat: string | null;
  lng: string | null;
  program_ids: number[];
  activities_date: Array<{
    activity_id: number;
    start_date: string | null;
    end_date: string | null;
  }>;
  rutin_join_date: string | null;
};

export type TUpdateActivityImplementationTimeBody = {
  activities: TDetailActivityDate[][];
};

export type TSubmitActivityImplementationTime = {
  activities: TDetailActivityDate[] | Partial<TDetailActivityDate>[];
};

export type TDetailEntityCustomer = {
  type_label: TEntitiesTypeLabel;
  id: number;
  name: string;
  address: string;
  code: string;
  type: number;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  province_id: string;
  regency_id: string | null;
  village_id: string | null;
  sub_district_id: string | null;
  lat: string | null;
  lng: string | null;
  postal_code: string | null;
  is_vendor: number;
  bpom_key: string | null;
  is_puskesmas: number;
  rutin_join_date: string | null;
  is_ayosehat: number;
  customers: Array<{
    id: number;
    name: string;
    address: string;
    customer_vendors: {
      customer_id: number;
      vendor_id: number;
    };
  }>;
  mapping_entity: null;
};

export type TEntityVendor = {
  id: number;
  code: string;
  name: string;
  address: string;
};

export type TEntityCustomer = {
  id: number;
  code: string;
  name: string;
  address: string;
  activities: Array<{
    id: number;
    name: string;
  }> | null;
  customer_vendors: {
    is_consumption: number;
    is_distribution: number;
    is_extermination: number;
  };
  entity_tags: {
    id: number;
    title: string;
  }[];
  mapping_entity: string | null;
  [key: string]: any;
};

export type TFilter = {
  keyword?: string;
  type?: string;
  entity_tag?: string;
};

export type TEntityMasterMaterial = {
  entity_master_material_activities_id: number;
  available: number;
  id: number;
  entity_material_id: number;
  activity_id: number;
  consumption_rate: number | null;
  retailer_price: number | null;
  tax: number | null;
  min: number;
  max: number;
  allocated: number;
  stock_on_hand: number;
  created_by: number | null;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  entity_master_material: {
    stock_update?: string | null;
    id: number;
    material_id: number;
    entity_id: number;
    min: number;
    max: number;
    allocated_stock: number;
    on_hand_stock: number;
    stock_last_update: string | null;
    total_open_vial: number;
    updated_at: string | null;
  };
  activity: {
    id: number;
    name: string | null;
  };
  user_updated_by: null | {
    id: number;
    firstname: string | null;
    lastname: string | null;
  };
  unit_of_distribution: string | null;
  code: string | null;
  description: string | null;
  pieces_per_unit: number;
  unit: string | null;
  temperature_sensitive: number;
  managed_in_batch: number;
  status: number;
  is_vaccine: number;
  is_stockcount: number;
  is_addremove: number;
  is_openvial: number;
  kfa_code: string | null;
  need_sequence: string | null;
  parent_id: string | null;
  kfa_level_id: number;
  material_id: { label: string; value: number } | number | null;
  name: string | null;
  temperature_min: number | null;
  temperature_max: number | null;
};

export type TMaterialEntity = {
  material_id: number;
  name: string;
  min_temperature: number;
  max_temperature: number;
  entity_master_materials: TEntityMasterMaterial[];
} | null;

export type TPayloadMaterialEntity = {
  id?: number;
  entity_master_material_activities_id?: number;
  material_id: number;
  activity_id: number;
  entity_id: number;
  min: string;
  max: string;
  consumption_rate: number;
  retailer_price: number;
  tax: number;
  entity_material_id?: number;
};

export type TDetailCoreEntity = {
  id: number;
  code: string;
  name: string;
  type: number;
  status: number;
  address: string;
  country: string;
  province_id: null;
  regency_id: null;
  sub_district_id: null;
  village_id: null;
  postal_code: null;
  lat: null;
  lng: string;
  is_puskesmas: boolean;
  is_vendor: boolean;
  created_by: null;
  updated_by: null;
  created_at: string;
  updated_at: string;
  entity_tag: { id: number; title: string };
  workspaces: { id: number; name: string }[];
  locations: Array<TEntityLocation>;
};

export type TActivityImpelemtationTime = {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
};

export type TUpdateMaterialEntity = {
  entity_master_material_activities_id: number | null;
  activity_id:
    | { id?: number | null; name?: string | null }
    | { value?: number | null; label?: string | null }
    | null
    | undefined;
  entity_id: number | null;
  min: number | null;
  max: number | null;
  consumption_rate: number | null;
  retailer_price: number | null;
  tax: number | null;
  material_id: { label: string; value: number } | number | null;
  entity_material_id: number | null;
};

export type TEntityDetailUser = {
  id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string | null;
  date_of_birth: string | null;
  gender: number | null;
  mobile_phone: string | null;
  address: string | null;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  entity_id: number;
  role: number;
  village_id: string | null;
  status: number;
  last_login: string | null;
  last_device: number | null;
  view_only: number;
  manufacture_id: number | null;
  keycloak_uuid: string | null;
  user_uuid: string | null;
  external_properties: ExternalProperties;
  entity: {
    id: number;
    name: string;
    type: number;
    address: string;
    tag: string;
    location: string;
  };
  programs: TProgram[];
  role_label: string;
  user_created_by?: {
    id?: number | null;
    username?: string | null;
    firstname?: string | null;
    lastname?: string | null;
  } | null;
  user_updated_by?: {
    id?: number | null;
    username?: string | null;
    firstname?: string | null;
    lastname?: string | null;
  } | null;
};

export type GetEntityDetailUsersResponse = TCommonResponseList & {
  data: TEntityDetailUser[];
  status: string;
};

export type TEntityAPICommonFilters = {
  keyword?: string;
  page: number;
  paginate: number;
  sort_by?: string;
  sort_type?: string;
};

export type GetEntityListParams = TEntityAPICommonFilters & {
  entity_tags_ids?: number;
  type_ids?: string;
  is_vendor?: number;
  province_ids?: string;
  regency_ids?: string;
};

export type GetEntityDetailUsersListParams = TEntityAPICommonFilters & {
  entity_id?: string | string[];
};

export type GetEntityWmsResponse = TCommonResponseList & {
  data: {
    data: TEntitiesWms[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};
