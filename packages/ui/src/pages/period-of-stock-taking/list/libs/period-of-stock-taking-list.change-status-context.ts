import { createContext } from 'react'

type Props = {
  mutateChangeStatus: (data: { id: number; status: number }) => void
  isPendingChangeStatus: boolean
}
const PeriodOfStockTakingChangeStatusContext = createContext<Props>({
  mutateChangeStatus: () => {},
  isPendingChangeStatus: false,
})

export default PeriodOfStockTakingChangeStatusContext
