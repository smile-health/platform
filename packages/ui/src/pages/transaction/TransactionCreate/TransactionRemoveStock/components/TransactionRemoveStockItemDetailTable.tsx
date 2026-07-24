import React, { useMemo, useState } from 'react'

import TransactionRemoveStockContext from '../transaction-remove-stock.context'
import { TDetailMaterials } from '../transaction-remove-stock.type'
import TransactionRemoveStockItemTable from './TransactionRemoveStockItemTable'

const TransactionRemoveStockItemDetailTable = () => {
  const [stockData, setStockData] = useState<TDetailMaterials | null>(null)
  const [savedStockData, setSavedStockData] = useState<TDetailMaterials | null>(
    null
  )
  const [errorForms, setErrorForms] = useState({})

  const contextValue = useMemo(
    () => ({
      stockData,
      setStockData,
      savedStockData,
      setSavedStockData,
      errorForms,
      setErrorForms,
    }),
    [
      stockData,
      setStockData,
      savedStockData,
      setSavedStockData,
      errorForms,
      setErrorForms,
    ]
  )

  return (
    <TransactionRemoveStockContext.Provider value={contextValue}>
      <TransactionRemoveStockItemTable />
    </TransactionRemoveStockContext.Provider>
  )
}

export default TransactionRemoveStockItemDetailTable
