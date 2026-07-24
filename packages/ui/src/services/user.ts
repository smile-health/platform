import axios from '#lib/axios'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import type { TUser, TUserRole } from '#types/user'
import { handleAxiosResponse } from '#utils/api'

export type ListUsersParams = TCommonFilter & {
  keyword?: string
  role?: string
  status?: string
  start_date?: string
  end_date?: string
  province_ids?: string
  regency_ids?: string
  entity_id?: string | number
  program_ids?: string
  beneficiaries_ids?: string
}

export type ListUsersResponse = TCommonResponseList & {
  data: TUser[]
}

export type UserChangeHistoryType = {
  id: number
  user_id: number
  old_value: Record<string, string | number>
  new_value: Record<string, string | number>
  created_at: string
  updated_at: string
  updated_by: number | string
}

export type ListUserChangeHistoryResponse = UserChangeHistoryType[]

export type UpdateUserBody = {
  username: string
  role: number
  firstname: string
  lastname?: string | null
  mobile_phone?: string | null
  email: string
  gender: number
  view_only?: number
  address?: string
  entity_id: number
  date_of_birth?: string
  password?: string
  village_id?: string
  program_ids?: number[]
  beneficiaries_ids?: number[]
  integration_client_id?: number
}

export async function listUserChangeHistory(
  id: string | number
): Promise<ListUserChangeHistoryResponse> {
  const response = await axios.get(`/core/users/${id}/chg_history`)
  return response?.data
}

export async function listUsers(
  params: ListUsersParams
): Promise<ListUsersResponse> {
  const response = await axios.get('/core/users', {
    params,
  })

  return handleAxiosResponse<ListUsersResponse>(response)
}

export async function updateUser(id: string | number, data: UpdateUserBody) {
  const response = await axios.put(`/core/users/${id}`, data)
  return response?.data
}

export async function listPlatformUsers(
  params: ListUsersParams
): Promise<ListUsersResponse> {
  const response = await axios.get('/main/users', {
    params,
  })
  return handleAxiosResponse<ListUsersResponse>(response)
}

export type ListUserRolesParams = TCommonFilter & {
  keyword?: string
  role?: string
  status?: string
  start_date?: string
  end_date?: string
  province_ids?: string
  regency_ids?: string
  entity_id?: string | number
  program_ids?: string
  beneficiaries_ids?: string
  integration_client_id?: string | number
}

export type ListUserRolesResponse = {
  list: TUserRole[]
  statusCode: number
}

export async function listUserRoles(
  params: ListUserRolesParams
): Promise<ListUserRolesResponse> {
  const response = await axios.get('/core/master/roles', {
    params,
  })
  return handleAxiosResponse<ListUserRolesResponse>(response)
}

export async function loadUserRoles(
  keyword: string,
  _: unknown,
  additional: Omit<ListUserRolesParams, 'paginate'>
) {
  const result = await listUserRoles({
    paginate: 25,
    keyword,
    ...additional,
  })

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page,
      },
    }
  }

  const options = result?.list?.map((item) => ({
    label: item?.name,
    value: Number(item.id),
  }))

  return {
    options,
    hasMore: false,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}
