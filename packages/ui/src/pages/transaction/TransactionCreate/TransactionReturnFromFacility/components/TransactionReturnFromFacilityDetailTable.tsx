import React, { useMemo, useState } from 'react'

import TransactionReturnFromFacilityContext from '../transaction-return-from-facility.context'
import { TTransactionReturnFacilityConsumptionData } from '../transaction-return-from-facility.type'
import TransactionReturnFromFacilityItemTable from './TransactionReturnFromFacilityItemTable'

const TransactionReturnFromFacilityDetailTable = () => {
  const [stockData, setStockData] =
    useState<TTransactionReturnFacilityConsumptionData | null>(null)
  const [discardStockData, setDiscardStockData] =
    useState<TTransactionReturnFacilityConsumptionData | null>(null)

  const [errorForms, setErrorForms] = useState({})

  const contextValue = useMemo(
    () => ({
      stockData,
      setStockData,
      errorForms,
      setErrorForms,
      discardStockData,
      setDiscardStockData,
    }),
    [
      stockData,
      setStockData,
      errorForms,
      setErrorForms,
      discardStockData,
      setDiscardStockData,
    ]
  )

  return (
    <TransactionReturnFromFacilityContext.Provider value={contextValue}>
      <TransactionReturnFromFacilityItemTable />
    </TransactionReturnFromFacilityContext.Provider>
  )
}

export default TransactionReturnFromFacilityDetailTable
