import { createContext } from 'react'

import { TTransactionReturnFacilityConsumptionData } from './transaction-return-from-facility.type'

type Props = {
  stockData: TTransactionReturnFacilityConsumptionData | null
  setStockData: (
    value: TTransactionReturnFacilityConsumptionData | null
  ) => void
  errorForms: any
  setErrorForms: (value: any) => void
  discardStockData: TTransactionReturnFacilityConsumptionData | null
  setDiscardStockData: (
    value: TTransactionReturnFacilityConsumptionData | null
  ) => void
}
const TransactionReturnFromFacilityContext = createContext<Props>({
  stockData: null,
  setStockData: () => {},
  errorForms: {},
  setErrorForms: () => {},
  discardStockData: null,
  setDiscardStockData: () => {},
})

export default TransactionReturnFromFacilityContext
