import React from 'react'
import { DataTable } from '#components/data-table'
import { useTranslation } from 'react-i18next'

import { TableSchemaTransactionDetail } from '../transaction-create.constant'

export const TransactionCreateDefaultTransactionTable = () => {
  const { t } = useTranslation('transactionCreate')
  return (
    <div className="ui-mt-5">
      <DataTable columns={TableSchemaTransactionDetail(t)} />
    </div>
  )
}
