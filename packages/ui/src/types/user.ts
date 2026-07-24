import { TProgram } from './program'

type TUserBase = {
  id: number
  username: string
  email: string
  firstname: string
  lastname: string
  date_of_birth: null
  gender: number
  mobile_phone: string
  address: string
  created_by: null
  updated_by: null
  deleted_by: null
  created_at: string
  updated_at: string
  entity_id: number
  role: number
  role_label: string
  integration_client_id: number
  external_properties?: {
    role: {
      id: number
      name: string
      type: string
    }
  }
  external_roles: string[]
  village_id: null
  timezone_id: number
  token_login: string
  status: number
  last_login: string
  last_device: number
  mobile_phone_2: null
  mobile_phone_brand: null
  mobile_phone_model: null
  imei_number: null
  sim_provider: null
  sim_id: null
  iota_app_gui_theme: string
  permission: string
  application_version: null
  last_mobile_access: null
  view_only: number
  change_password: null
  manufacture_id: null
  fcm_token?: string | null
  manufacture: TUserManufacturer | null
  daily_recap_email?: number
}

export type TUser = TUserBase & {
  entity: TUserEntity
  programs: TProgram[]
  beneficiaries: TProgram[]
}

export type TUserRole = {
  created_at: string | null
  id: number
  name: string
  updated_at: string | null
}

export type TUserDetail = TUserBase & {
  entity: TUserDetailEntity
  location: TUserLocation
  program_ids: number[]
  beneficiaries_ids: number[]
  integration_client_id: number | null
  programs?: TProgram[]
}

type TUserLocation = {
  province: TUserLocationDetail
  regency: TUserLocationDetail
  subdistrict: TUserLocationDetail
  village: TUserLocationDetail
}

type TUserLocationDetail = {
  id: number
  name: string
}

type TUserEntity = {
  id: number
  name: string
  type: number
  address: string
  tag: string
  location: string
}

type TUserDetailEntity = TUserEntity & {
  programs: TProgram[]
  beneficiaries: TProgram[]
  integration_client_id: number | null
}

type TUserManufacturer = {
  id: number
  name: string
  type: number
  reference_id: string
  description: string
  contact_name: string
  phone_number: string
  email: string
  address: string
  status: number
  created_by: number
  updated_by: number
  deleted_by: number
  created_at: string
  updated_at: string
  deleted_at: string
}
