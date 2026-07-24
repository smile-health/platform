import React, { useContext } from 'react'
import { DataTable } from '#components/data-table'
import { ICursorPaginatedResponse } from '#types/cursor-pagination'
import { TProgram } from '#types/program'
import { TTransactionData } from '#types/transaction'
import { useTranslation } from 'react-i18next'

import TransactionListCursorContext from '../helpers/transaction-list-cursor.context'
import { MainColumnCursor } from './TransactionListColumnCursor'
import TransactionListCursorPagination from './TransactionListCursorPagination'
import TransactionListDetailCursorDialog from './TransactionListDetailCursorDialog'

type Props = {
  data?: ICursorPaginatedResponse<TTransactionData>
}

const TransactionListCursorTable: React.FC<Props> = ({ data }): JSX.Element => {
  const { t, i18n } = useTranslation(['common', 'transactionList'])
  const { program } = useContext(TransactionListCursorContext)

  return (
    <>
      <TransactionListDetailCursorDialog />
      <DataTable
        id="transaction__cursor__list__table"
        data={data?.data}
        columns={MainColumnCursor({
          t,
          locale: i18n.language,
          program: program as TProgram,
        })}
      />
      <TransactionListCursorPagination data={data} />
      <style>{`
        #transaction__cursor__list__table {
          tr:hover {
            background-color: #f5f5f5;
          }
          td {
            vertical-align: top !important;
          }
        }
      `}</style>
    </>
  )
}

export default TransactionListCursorTable
