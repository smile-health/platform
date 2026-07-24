import axios from '#lib/axios'

import { TicketingSystemStatusEnum } from '../ticketing-system.constant'
import {
  DetailTicketingSystemResponse,
  ListTicketingSystemEventReportStatus,
} from './libs/ticketing-system-detail.type'

export async function detailTicketingSystem(id: string | number) {
  const response = await axios.get<DetailTicketingSystemResponse>(
    `/main/event-report/${id}`,
    {
      redirect: true,
    }
  )

  return response?.data
}

export async function listEventReportStatus() {
  const response = await axios.get<ListTicketingSystemEventReportStatus>(
    `/main/event-report/status`,
    {
      redirect: true,
    }
  )

  return response?.data
}

export async function updateTicketingSystemLink(
  id: string | number,
  link: string
) {
  const response = await axios.put(
    `/main/event-report/${id}/link`,
    {
      link,
    }
  )

  return response?.data
}

export type UpdateTicketingSystemStatusParams = {
  status: TicketingSystemStatusEnum
  comment: string | null
}
export async function updateTicketingSystemStatus(
  id: string | number,
  data: UpdateTicketingSystemStatusParams
) {
  const response = await axios.post(
    `/main/event-report/${id}/status`,
    data
  )

  return response?.data
}
