import { createContext } from 'react'
import { TCommonResponseList } from '#types/common'

import { TRANSACTION_TYPE } from '../transaction-create.constant'
import {
  Filter,
  TransactionsDiscard,
} from '../TransactionCancelDiscard/transaction-cancel-discard.type'
import { TTransactionReturnFacilityConsumptionData } from '../TransactionReturnFromFacility/transaction-return-from-facility.type'

type TransactionCreateCancellationContextProps = {
  filter: Filter
  handleSearch: (filter: Filter) => void
  handleReset: () => void
  isFetching: boolean
  datasource?:
    | (TCommonResponseList & {
        data: Array<
          TransactionsDiscard | TTransactionReturnFacilityConsumptionData
        >
        count_fetch?: number
      })
    | null
  handleChangePage: (page: number) => void
  handleChangePaginate: (paginate: number) => void
}

const defaultValue = {
  filter: {
    page: 1,
    paginate: 10,
    transaction_type_id: TRANSACTION_TYPE.DISCARD,
  },
  handleSearch: () => {},
  handleReset: () => {},
  isFetching: false,
  datasource: {
    data: [],
    page: 1,
    item_per_page: 10,
    total_item: 0,
    total_page: 0,
    list_pagination: [10, 20, 30, 40, 50],
    count_fetch: 0,
  },
  handleChangePage: () => {},
  handleChangePaginate: () => {},
}

export const TransactionCreateCancellationContext =
  createContext<TransactionCreateCancellationContextProps>(defaultValue)
