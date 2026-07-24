import { createContext } from 'react'

import { TPeriodOfStockTakingData } from '../../list/libs/period-of-stock-taking-list.type'

type Props = {
  activeStockTakingData?: TPeriodOfStockTakingData | null
  setActiveStockTakingData?: (value: TPeriodOfStockTakingData | null) => void
}
const PeriodOfStockTakingFormContext = createContext<Props>({
  activeStockTakingData: null,
  setActiveStockTakingData: () => {},
})

export default PeriodOfStockTakingFormContext
