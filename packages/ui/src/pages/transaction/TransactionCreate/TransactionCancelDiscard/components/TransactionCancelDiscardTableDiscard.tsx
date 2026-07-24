import { useContext } from 'react'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useTranslation } from 'react-i18next'

import { TransactionCreateCancellationContext } from '../../context/TransactionCreateCancellationProvider'
import { createColumnDiscard } from '../constants/table'
import { useCreateTransactionCancelDiscardTableDiscard } from '../hooks/useCreateTransactionCancelDiscardTableDiscard'

const TransactionCancelDiscardTableDiscard: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionCreate')
  const {
    filter,
    isFetching,
    datasource,
    handleChangePage,
    handleChangePaginate,
  } = useContext(TransactionCreateCancellationContext)

  const { items, handleSelectDiscardTransaction } =
    useCreateTransactionCancelDiscardTableDiscard()

  return (
    <div className="ui-flex ui-flex-col ui-gap-6 ui-mt-2">
      <p className="ui-text-base ui-font-normal ui-text-neutral-500">
        {t('cancel_transaction_discard.table.discard.description')}
      </p>

      <div className="ui-space-y-6">
        <DataTable
          data={datasource?.data || []}
          columns={createColumnDiscard({
            t,
            no: (filter.page - 1) * filter.paginate,
            language,
            selected: items.flatMap((x) => x.transaction_ids),
          })}
          isLoading={isFetching}
          className="ui-max-h-[464px]"
          isSticky
          onClickRow={(row) => handleSelectDiscardTransaction(row.original)}
        />
        <PaginationContainer>
          <PaginationSelectLimit
            size={filter.paginate}
            onChange={(paginate) => handleChangePaginate(paginate)}
            perPagesOptions={datasource?.list_pagination}
          />
          <PaginationInfo
            size={filter.paginate}
            currentPage={filter.page}
            total={datasource?.total_item}
          />
          <Pagination
            totalPages={datasource?.total_page ?? 0}
            currentPage={filter.page}
            onPageChange={(page) => handleChangePage(page)}
          />
        </PaginationContainer>
      </div>
    </div>
  )
}

export default TransactionCancelDiscardTableDiscard
