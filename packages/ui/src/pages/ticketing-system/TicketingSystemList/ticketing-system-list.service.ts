import axios from '#lib/axios'
import { Pagination } from '#types/common'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

import { APIResponse } from '../services'
import { TicketingSystemListItem } from './ticketing-system-list.type'

export type GetTicketingSystemListRequest = Pagination & {
  do_number?: string
  entity_tag_id?: string
  from_arrived_date?: string
  order_id?: number
  province_id?: string
  regency_id?: string
  status?: string
  to_arrived_date?: string
}

type GetTicketingSystemListResponse = APIResponse<TicketingSystemListItem[]>

export async function getTicketingSystemList(
  params: GetTicketingSystemListRequest
) {
  const response = await axios.get('/main/event-report', { params })
  return handleAxiosResponse<GetTicketingSystemListResponse>(response)
}

export async function exportTicketingSystemList(
  params: GetTicketingSystemListRequest
) {
  const response = await axios.get('/main/event-report/xls', {
    responseType: 'arraybuffer',
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
