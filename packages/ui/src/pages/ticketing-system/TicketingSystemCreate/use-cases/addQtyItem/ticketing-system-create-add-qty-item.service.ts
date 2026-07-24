import axios from '#lib/axios'

export type GetTicketingSystemReasonResponse = {
  id: string
  title: string
  child: GetTicketingSystemReasonResponseChild[]
}

export type GetTicketingSystemReasonResponseChild = {
  id: string
  title: string
}

export async function getTicketingSystemReasons() {
  const response = await axios.get<GetTicketingSystemReasonResponse[]>(
    '/main/event-report/reasons'
  )
  return response.data
}
