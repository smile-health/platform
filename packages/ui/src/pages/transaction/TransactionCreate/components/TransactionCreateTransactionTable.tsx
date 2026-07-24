import React from 'react'
import { useRouter } from 'next/router'

import { TRANSACTION_TYPE } from '../transaction-create.constant'
import { TransactionCreateAddStockTable } from '../TransactionAddStock/components/TransactionCreateAddStockTable'
import TransactionCancelDiscardTableDiscard from '../TransactionCancelDiscard/components/TransactionCancelDiscardTableDiscard'
import TransactionCreateConsumptionTabel from '../TransactionConsumption/components/TransactionCreateConsumptionTabel'
import TransactionDiscardTable from '../TransactionDiscard/components/TransactionDiscardTable'
import TransactionRemoveStockItemDetailTable from '../TransactionRemoveStock/components/TransactionRemoveStockItemDetailTable'
import TransactionReturnFromFacilityConsumptionListTable from '../TransactionReturnFromFacility/components/TransactionReturnFromFacilityConsumptionListTable'
import TransactionCreateTransferStockTable from '../TransactionTransferStock/components/TransactionCreateTransferStockTable'
import { TransactionCreateDefaultTransactionTable } from './TransactionCreateDefaultTransactionTable'

export const TransactionCreateTransactionTable = () => {
  const { query } = useRouter()
  const { type } = query as { type: string }

  // Transaction Detail Form Table Located in Footer
  if (!Number(type)) {
    return <TransactionCreateDefaultTransactionTable />
  }

  if (Number(type) === TRANSACTION_TYPE.ADD_STOCK) {
    return <TransactionCreateAddStockTable />
  }

  if (Number(type) === TRANSACTION_TYPE.REMOVE_STOCK) {
    return <TransactionRemoveStockItemDetailTable />
  }

  if (Number(type) === TRANSACTION_TYPE.DISCARD) {
    return <TransactionDiscardTable />
  }

  if (Number(type) === TRANSACTION_TYPE.CANCELLATION_OF_DISCARD) {
    return <TransactionCancelDiscardTableDiscard />
  }

  if (Number(type) === TRANSACTION_TYPE.LAST_MILE) {
    return <TransactionCreateConsumptionTabel />
  }

  if (Number(type) === TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES) {
    return <TransactionReturnFromFacilityConsumptionListTable />
  }

  if (Number(type) === TRANSACTION_TYPE.TRANSFER_STOCK) {
    return <TransactionCreateTransferStockTable />
  }
}
