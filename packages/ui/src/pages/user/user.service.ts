import axios from '#lib/axios'
import { ListUserChangeHistoryResponse, ListUsersParams } from '#services/user'
import { TUser, TUserDetail } from '#types/user'
import { parseDownload } from '#utils/download'

type DetailUserResponse = TUserDetail
type UpdateStatusUserResponse = TUser

export type CreateUserBody = {
  username: string
  role: number
  firstname: string
  lastname?: string
  mobile_phone?: string
  email: string
  gender: number
  view_only?: number
  address?: string
  entity_id: number
  date_of_birth?: string
  password: string
  village_id?: string
  program_ids: number[]
  beneficiaries_ids: number[]
  integration_client_id?: number
}

export async function detailUser(
  id: string | number
): Promise<DetailUserResponse> {
  const response = await axios.get(`/core/users/${id}`, {
    redirect: true,
  })
  return response?.data
}

export async function detailPlatformUser(
  id: string | number
): Promise<DetailUserResponse> {
  const response = await axios.get(`/main/users/${id}`, {
    redirect: true,
  })
  return response?.data
}

export async function listUserPlatformChangeHistory(
  id: string | number
): Promise<ListUserChangeHistoryResponse> {
  const response = await axios.get(`/main/users/${id}/chg_history`)
  return response?.data
}

export async function createUser(data: CreateUserBody) {
  const response = await axios.post('/core/users', data)

  return response?.data
}

export async function updateStatusUser(
  id: string,
  status: number
): Promise<UpdateStatusUserResponse> {
  const response = await axios.put(`/core/users/${id}/status`, { status })
  return response?.data
}

export async function updateStatusUserInProgram(id: string, status: number) {
  const response = await axios.put(`/main/users/${id}/status`, {
    status,
  })
  return response?.data
}

export async function exportUser(params: ListUsersParams) {
  const response = await axios.get('/core/users/xls', {
    responseType: 'blob',
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function downloadTemplateUser() {
  const response = await axios.get('/core/users/xls-template', {
    responseType: 'blob',
  })
  parseDownload(response?.data, 'template-user.xlsx')

  return response?.data
}

export async function importUser(data: FormData) {
  const response = await axios.post('/core/users/xls', data)

  return response?.data
}
