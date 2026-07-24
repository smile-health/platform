import axios from '#lib/axios'
import { TProgram } from '#types/program'
import { getUserStorage } from '#utils/storage/user'

import { detailCoreEntity } from './entity'

export type GetProfileResponse = {
  role_label: string
  entity_name: string
  status_label: string
  gender_label: string
  province_name: string
  regency_name: string
  id: number
  username: string
  email: string
  firstname: string
  lastname: any
  gender: number
  date_of_birth: string
  mobile_phone: any
  role: number
  village_id: string
  entity_id: number
  timezone_id: any
  created_by: number
  updated_by: number
  status: number
  last_login: string
  last_device: number
  created_at: string
  updated_at: string
  address: string
  view_only: number
  change_password: number
  manufacture_id: any
  fcm_token: any
  entity: TEntity
  village: TVillage
  programs: TProgram[]
  manufacture: any
  is_disabled_notification: number
  external_properties?: {
    role: {
      id: number
      name: string
      type: string
    }
  }
  external_roles: string[]
  client: {
    id: number
    key: string
  }
  integration_client_id: number | null
}

export type Workspace = {
  id: number
  name: string
}

export type UserProvince = {
  id: string
  name: string
  level: number
}

export type UserRegency = {
  id: string
  name: string
  province_id: string
  level: number
}

export type TEntity = {
  id: number
  name: string
  address: string
  code: string
  type: number
  status: number
  entity_type: TEntityType
  created_at: string
  updated_at: string
  deleted_at: any
  province_id: string
  regency_id: string
  village_id: string
  sub_district_id: string
  lat: any
  lng: any
  postal_code: any
  is_vendor: number
  bpom_key: any
  is_puskesmas: number
  rutin_join_date: any
  is_ayosehat: number
  province?: UserProvince
  regency?: UserRegency
  integration_client_id: number | null
  entity_tag_id?: number | null
}

export type TEntityType = {
  external_properties?: {
    role: {
      id: number
      name: string
      type: string
    }
  }
  id: number
  name: string
}

export type TVillage = {
  id: string
  name: string
  sub_district_id: string
  created_at: string
  updated_at: string
  deleted_at: any
  subDistrictId: string
  sub_district: {
    id: string
    name: string
    regency_id: string
    created_at: string
    updated_at: string
    deleted_at: any
    regencyId: string
    regency: {
      id: string
      name: string
      province_id: string
      created_at: string
      updated_at: string
      deleted_at: any
      provinceId: string
      province: {
        id: string
        name: string
        created_at: string
        updated_at: string
        deleted_at: any
      }
    }
  }
}

export async function getProfile(): Promise<GetProfileResponse> {
  const user = getUserStorage()
  if (!user) {
    throw new Error('User not found')
  }

  const response = await axios.get(`/platform/user/${user.id}`)
  return response?.data
}

export async function getProfileV2(): Promise<GetProfileResponse> {
  const response = await axios.get<GetProfileResponse>(
    '/core/account/profile',
    {
      headers: {
        'account-id': '1',
        'workspace-id': '1',
      },
    }
  )

  const data = response.data as GetProfileResponse

  const entity = await detailCoreEntity(data.entity_id.toString())

  const province = entity.locations
    .map((item) => ({ ...item, id: String(item.id) }))
    .find(
      (item) => item.id === data.entity.province_id && item.level === 0
    ) as UserProvince

  const regency = entity.locations
    .map((item) => ({ ...item, id: String(item.id) }))
    .find(
      (item) => item.id === data.entity.regency_id && item.level === 1
    ) as UserRegency

  if (regency) {
    regency.province_id = province.id
  }

  data.entity.province = province
  data.entity.regency = regency

  return data
}
