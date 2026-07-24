import { createContext } from 'react'

import { OrderDetailResponse } from '../../../order/OrderDetail/order-detail.type'
import { DetailTicketingSystemResponse } from './ticketing-system-detail.type'

type Props = {
  detail?: DetailTicketingSystemResponse
  order?: OrderDetailResponse
  isLoading?: boolean
}
const TicketingSystemDetailContext = createContext<Props>({
  detail: undefined,
  order: undefined,
  isLoading: false,
})

export default TicketingSystemDetailContext
