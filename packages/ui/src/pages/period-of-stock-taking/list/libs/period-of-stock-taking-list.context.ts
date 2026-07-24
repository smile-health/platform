import { createContext } from 'react'

import { TPeriodOfStockTakingData } from './period-of-stock-taking-list.type'

type Props = {
  activeStockTakingData?: TPeriodOfStockTakingData | null
  setActiveStockTakingData?: (value: TPeriodOfStockTakingData | null) => void
  setPagination: (value: { page?: number; paginate?: number }) => void
  page: number
  popUpDataRow: TPeriodOfStockTakingData | null
  setPopUpDataRow: (value: TPeriodOfStockTakingData | null) => void
}
const PeriodOfStockTakingListContext = createContext<Props>({
  activeStockTakingData: null,
  setActiveStockTakingData: () => {},
  setPagination: () => {},
  page: 1,
  popUpDataRow: null,
  setPopUpDataRow: () => {},
})

export default PeriodOfStockTakingListContext
