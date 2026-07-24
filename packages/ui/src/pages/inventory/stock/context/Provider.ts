import { createContext, ReactNode } from 'react'

type TStockListContext = {
  setPagination: ({ page }: { page: number }) => void
  isHierarchical: boolean
  handleExport: () => void
  filter: {
    getValues: () => void
    reset: () => void
    renderField: () => ReactNode
    renderActiveFilter: () => ReactNode
    handleSubmit: () => void
  }
}

const defaultValue = {
  setPagination: () => {},
  isHierarchical: false,
  handleExport: () => {},
  filter: {
    getValues: () => {},
    reset: () => {},
    renderField: () => [],
    renderActiveFilter: () => [],
    handleSubmit: () => {},
  },
}

export const StockListContext = createContext<TStockListContext>(defaultValue)
