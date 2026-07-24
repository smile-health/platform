import { createContext } from 'react'

type Props = {
  modalStatusData?: {
    id: number
    status_label: string
  } | null
  setModalStatusData: (
    value:
      | {
          id: number
          status_label: string
        }
      | null
      | undefined
  ) => void
}
const TicketingSystemDetailChangeStatusContext = createContext<Props>({
  modalStatusData: null,
  setModalStatusData: () => {},
})

export default TicketingSystemDetailChangeStatusContext
