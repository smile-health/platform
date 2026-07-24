import axios from '#lib/axios'
import { TCommonFilter } from '#types/common'
import { handleAxiosResponse } from '#utils/api'

import { TicketingSystemStatusEnum } from './ticketing-system.constant'

export async function updateTicketingSystemLink(
  id: string | number,
  link: string
) {
  const response = await axios.put(
    `/main/event-report/${id}/link`,
    {
      link,
    },
    {
      cleanBody: true,
      cleanParams: true,
    }
  )

  return response?.data
}

export type UpdateTicketingSystemStatusParams = {
  update_status_id: TicketingSystemStatusEnum
  comment: string | null
}
export async function updateTicketingSystemStatus(
  id: string | number,
  data: UpdateTicketingSystemStatusParams
) {
  const response = await axios.put(`/main/event-report/${id}`, data, {
    cleanBody: true,
    cleanParams: true,
  })

  return response?.data
}

type GetEventReportReasonResponse = TCommonFilter & {
  list: {
    id: number
    title: string
  }[]
}

type GetEventReporChildtReasonResponse = TCommonFilter & {
  list: {
    id: number
    title: string
    parent_id: number
  }[]
}

export async function listEventReason(params: TCommonFilter) {
  const response = await axios.get('/main/event-report-reasons', {
    params,
  })
  return handleAxiosResponse<GetEventReportReasonResponse>(response)
}

export async function listEventChildReason(params: TCommonFilter) {
  const response = await axios.get('/main/event-report-child-reasons', {
    params,
  })
  return handleAxiosResponse<GetEventReporChildtReasonResponse>(response)
}

type CreateTicketingSystemPayload = {
  entity_id?: number
  has_order: number | null
  order_id?: number
  no_packing_slip: string | null
  arrived_date: string | null
  comments: {
    comment: string
  }[]
  items: []
}

export async function createTicketingSystem(
  data: CreateTicketingSystemPayload
) {
  const response = await axios.post(`/main/event-report`, data)

  return response?.data
}
