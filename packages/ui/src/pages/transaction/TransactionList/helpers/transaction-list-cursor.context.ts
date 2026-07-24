import { createContext } from 'react'
import { TProgram } from '#types/program'
import { TTransactionData } from '#types/transaction'

type Props = {
  program: TProgram | null
  setPagination: (value: { paginate?: number; cursor?: string | null; page?: number }) => void
  transactionData: TTransactionData | null
  setTransactionData: (value: TTransactionData | null) => void
  isLoadingCount: boolean
  nextCursor?: string | null
  prevCursor?: string | null
  pagination: {
    paginate: number
    cursor: string | null
    page: number
  }
  totalCountData?: number | null
}
const TransactionListCursorContext = createContext<Props>({
  program: null,
  setPagination: () => {},
  transactionData: null,
  setTransactionData: () => {},
  isLoadingCount: false,
  nextCursor: undefined,
  prevCursor: undefined,
  totalCountData: undefined,
  pagination: {
    paginate: 0,
    cursor: null,
    page: 1,
  },
})

export default TransactionListCursorContext
