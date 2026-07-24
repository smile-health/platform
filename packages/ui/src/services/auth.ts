import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { RequestLoginV2Response } from '#types/auth'

const CORE_SERVICE = SERVICE_API.CORE

export type UpdatePasswordResponse = {
  message: string
}

export type UpdatePasswordBody = {
  password: string
  new_password: string
  password_confirmation: string
}

export async function updatePassword(
  data: UpdatePasswordBody
): Promise<UpdatePasswordResponse> {
  const response = await axios.post(
    `${CORE_SERVICE}/account/update-password`,
    data
  )

  return response?.data
}

export type RequestloginBody = {
  username: string
  password: string
  fcm_token: string
}
export async function requestlogin({
  data,
}: {
  data: RequestloginBody
}): Promise<RequestLoginV2Response> {
  const res = await axios.post(`/auth/login`, data, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  })

  return res.data
}

export async function requestlogout() {
  await axios.post(`/auth/logout`)
}

export async function requestForgotPassword(data: {
  username: string
}): Promise<{ message: string }> {
  const res = await axios.post(`${CORE_SERVICE}/account/forgot-password`, data)

  return res.data
}
