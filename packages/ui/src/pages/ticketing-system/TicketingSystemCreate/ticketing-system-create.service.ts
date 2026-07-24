import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'

export type TicketingSystemCreateTicketRequest = {
  entity_id: number
  has_order: 1 | 0
  order_id: number | null
  do_number: string | null
  arrived_date: string
  items: Array<{
    material_id: number | null
    custom_material: string | null
    batch_code: string | null
    expired_date: string
    production_date: string | null
    qty: number
    reason_id: number
    child_reason_id: number
  }>
  comment: string | null
}

export type TicketingSystemCreateTicketResponse = {
  id: number
}

const createTicket = async (request: TicketingSystemCreateTicketRequest) => {
  const response = await axios.post(`${SERVICE_API.MAIN}/event-report`, request)
  return response.data as TicketingSystemCreateTicketResponse
}

const ticketingSystemCreateService = {
  createTicket,
}

export default ticketingSystemCreateService
