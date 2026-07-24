export type RequestloginResponse = {
  id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string | null;
  date_of_birth: string;
  gender: number;
  mobile_phone: string;
  address: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  created_at: string;
  updated_at: string;
  entity_id: number;
  role: number;
  village_id: string;
  status: number;
  last_login: string;
  last_device: number;
  view_only: number;
  manufacture_id: number | null;
  keycloak_uuid: string;
  user_uuid: string;
  external_properties: ExternalProperties;
  role_id: number;
  role_label: string;
  gender_label: string;
  external_roles: string[];
  entity: Entity;
  programs: Program[];
  providerType: string | null;
  providerTypes: string;
  user_is_active: boolean;
  entity_is_active: boolean;
  fcm_token: string | null;
};

export type ExternalProperties = {
  role: Role;
};

export type Role = {
  id: number;
  name: string;
  type: string;
};

type EntityType = {
  id: number;
  name: string;
  integration_type: number;
};

type Entity = {
  id: number;
  name: string;
  type: number;
  address: string;
  tag: string;
  province_id: string;
  regency_id: string;
  sub_district_id: string;
  village_id: string;
  integration_type: number;
  entity_type: EntityType;
  location: string;
};

interface Program {
  id: number;
  key: string;
  name: string;
  config: {
    material: {
      is_hierarchy_enabled: boolean;
      is_batch_enabled: boolean;
    };
    color: string;
  };
  status: number;
  entity_id: number;
  manufacture_id: number | null;
}

export type AuthDetail = {
  access_token: string;
  expires_in: number;
  'not-before-policy': number;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  session_state: string;
  token_type: string;
};

export type RequestLoginV2Response = {
  authDetails: AuthDetail;
};
