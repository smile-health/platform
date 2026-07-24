import React, { useContext } from 'react'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { TProgram } from '#types/program'
import { ListTransactionsResponse } from '#types/transaction'
import { useTranslation } from 'react-i18next'

import TransactionListContext from '../helpers/transaction-list.context'
import { MainColumn } from './TransactionListColumn'
import TransactionListDetailDialog from './TransactionListDetailDialog'

type Props = {
  data?: ListTransactionsResponse
}
const TransactionListTable: React.FC<Props> = ({ data }): JSX.Element => {
  const { t, i18n } = useTranslation(['common', 'transactionList'])

  const { setPagination, program } = useContext(TransactionListContext)

  return (
    <>
      <TransactionListDetailDialog />

      <DataTable
        id="transaction__list__table"
        data={data?.data}
        columns={MainColumn({
          t,
          locale: i18n.language,
          program: program as TProgram,
        })}
      />
      <PaginationContainer className="ui-mt-5">
        <PaginationSelectLimit
          size={data?.item_per_page}
          perPagesOptions={data?.list_pagination}
          onChange={(paginate) => setPagination({ paginate, page: 1 })}
        />
        <PaginationInfo
          size={data?.item_per_page}
          currentPage={data?.page}
          total={data?.total_item}
        />
        <Pagination
          totalPages={data?.total_page ?? 0}
          currentPage={data?.page}
          onPageChange={(page) => setPagination({ page })}
        />
      </PaginationContainer>
      <style>{`
        #transaction__list__table {
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

export default TransactionListTable
