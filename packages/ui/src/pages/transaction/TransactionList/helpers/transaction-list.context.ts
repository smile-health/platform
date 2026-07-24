import { createContext } from 'react'
import { TProgram } from '#types/program'
import { TTransactionData } from '#types/transaction'

type Props = {
  program: TProgram | null
  setPagination: (value: { page?: number; paginate?: number }) => void
  transactionData: TTransactionData | null
  setTransactionData: (value: TTransactionData | null) => void
}
const TransactionListContext = createContext<Props>({
  program: null,
  setPagination: () => {},
  transactionData: null,
  setTransactionData: () => {},
})

export default TransactionListContext
