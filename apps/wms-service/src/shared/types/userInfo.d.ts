export interface DeviceInfo {
  deviceId?: string;
  deviceType?: 'mobile' | 'web' | 'tablet';
  deviceName?: string;
  appVersion?: string;
  osName?: string;
  osVersion?: string;
  browserName?: string;
  browserVersion?: string;
  userAgent?: string;
}

declare global {
  namespace Express {
    interface Request {
      user: UserInfo | null;
      deviceInfo?: DeviceInfo;
    }
  }
}
export interface UserInfo {
  address: any;
  created_at: string;
  created_by: number;
  date_of_birth: any;
  deleted_at: any;
  deleted_by: any;
  email: string;
  entity_id: number;
  external_properties: ExternalProperties;
  firstname: string;
  gender: number;
  id: number;
  keycloak_uuid: string;
  last_device: number;
  last_login: string;
  lastname: any;
  manufacture_id: any;
  mobile_phone: any;
  role: number;
  status: number;
  updated_at: string;
  updated_by: number;
  user_uuid: string;
  user_uuid_wms: string;
  username: string;
  view_only: number;
  village_id: any;
  role_id: number;
  role_label: string;
  integration_client_id: number;
  gender_label: string;
  external_roles: string[];
  client: Client;
  entity: Entity;
  programs: any[];
  providerType: string;
  providerTypes: string;
  fcm_token?: string;
  is_active?: boolean;
}

export interface Client {
  id: number;
  key: string;
}

export interface Entity {
  external_properties: string;
  client_id: number;
  id: number;
  code: string;
  name: string;
  type: number;
  address: string;
  tag: string;
  province_id: string;
  regency_id: any;
  sub_district_id: any;
  village_id: string;
  integration_type: number;
  entity_type: any;
  location: string;
  integration_client_id: number;
  id_satu_sehat?: number;
  latitude: number;
  longitude: number;
  is_active?: boolean;
}

export interface ExternalProperties {
  role: Role;
}

export interface Role {
  id: number;
  name: string;
  type: string;
}
