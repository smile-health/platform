import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import {
  GetNotificationConfirmationParams,
  GetNotificationConfirmationResponse,
  GetNotificationReasonResponse,
  GetNotificationResponse,
  PayloadStopNotification,
  StopNotificationResponse,
} from '../types/notification'

export type TNotificationParams = {
  page?: number
  paginate?: number
  keyword?: string
  province_id?: number
  city_district_id?: number
  health_center_id?: number
  received_start_date?: string
  received_end_date?: string
  entity_tag_ids?: string
  receive_date?: string
  notification_type?: string
  program_ids?: number[]
}

export async function getNotificationTypes(
  params: TNotificationParams
): Promise<GetNotificationResponse> {
  const response = await axios.get(
    `${SERVICE_API.CORE}
/notifications/types`,
    {
      params,
    }
  )

  return handleAxiosResponse<GetNotificationResponse>(response)
}

export async function getNotification(
  params: TNotificationParams
): Promise<GetNotificationResponse> {
  const url = `${SERVICE_API.CORE}/notifications`
  const response = await axios.get(url, {
    params,
  })

  return handleAxiosResponse<GetNotificationResponse>(response)
}

export async function getNotificationHeader(): Promise<GetNotificationResponse> {
  const url = `${SERVICE_API.CORE}/notifications`
  const response = await axios.get(url, {
    params: {
      limit: 3,
    },
  })

  return handleAxiosResponse<GetNotificationResponse>(response)
}

export async function requestReadById(id: number) {
  const response = await axios.put(
    `${SERVICE_API.CORE}/notifications/${id}/read`
  )

  return response?.data
}

export async function requestReadAllNotification() {
  const response = await axios.put(`${SERVICE_API.CORE}/notifications/read`)

  return response?.data
}

export async function getNotificationCount(): Promise<{ unread: number }> {
  const response = await axios.get(`${SERVICE_API.CORE}/notifications/count`)

  return response?.data
}

export async function downloadNotification(url: string) {
  const response = await axios.get(url, {
    responseType: 'blob',
    baseURL: process.env.API_BIG_DATA_URL,
  })
  parseDownload(response?.data, response.headers.filename)

  return response?.data
}

export async function loadNotificationTypes(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    isGlobal: boolean
    lang?: string
  }
) {
  let result

  result = await getNotificationTypes({
    paginate: 10,
    keyword,
    ...additional,
  })

  if (result?.data.length === 0)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }

  const options = result?.data?.map((item) => ({
    label: item?.title,
    value: item?.type,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function getReasonFinishedVaccine(): Promise<GetNotificationReasonResponse> {
  const DEFAULT_PROGRAM = 1
  const url = `${SERVICE_API.MAIN}/notifications/stop-reason`
  const response = await axios.get(url, {
    params: {
      page: 1,
      paginate: 100,
    },
    programId: DEFAULT_PROGRAM,
  })

  return handleAxiosResponse<GetNotificationReasonResponse>(response)
}

export async function stopNotification(
  programId: number,
  payload: PayloadStopNotification,
  defaultResponse?: { status: string; message: string }
) {
  const response = await axios.put(
    `${SERVICE_API.MAIN}/notifications/stop`,
    payload,
    { programId }
  )

  return handleAxiosResponse<StopNotificationResponse>(
    response,
    defaultResponse
  )
}

export async function getNotificationConfirmation(
  params: GetNotificationConfirmationParams,
  defaultResponse?: { identity_number: string; next_sequence: string }
) {
  const response = await axios.get(
    `${SERVICE_API.MAIN}/notifications/stop-confirmation`,
    {
      params: { consumption_id: params.consumption_id },
      programId: params.program_id,
    }
  )

  return handleAxiosResponse<GetNotificationConfirmationResponse>(
    response,
    defaultResponse
  )
}
