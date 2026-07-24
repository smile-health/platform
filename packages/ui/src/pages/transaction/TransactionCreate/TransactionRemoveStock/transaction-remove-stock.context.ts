import { createContext } from 'react'

import { TDetailMaterials } from './transaction-remove-stock.type'

type Props = {
  stockData: TDetailMaterials | null
  setStockData: (value: TDetailMaterials | null) => void
  savedStockData: TDetailMaterials | null
  setSavedStockData: (value: TDetailMaterials | null) => void
  errorForms: any
  setErrorForms: (value: any) => void
}
const TransactionRemoveStockContext = createContext<Props>({
  stockData: null,
  setStockData: () => {},
  savedStockData: null,
  setSavedStockData: () => {},
  errorForms: {},
  setErrorForms: () => {},
})

export default TransactionRemoveStockContext
