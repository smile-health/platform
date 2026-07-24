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
import { useTransactionCreateReturnFromFacility } from '../hooks/useTransactionCreateReturnFromFacility'
import { TTransactionReturnFacilityConsumptionData } from '../transaction-return-from-facility.type'
import { consumptionColumn } from './TransactionReturnFromFacilityConsumptionColumn'

const TransactionReturnFromFacilityConsumptionListTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['transactionCreate', 'common'])
  const {
    filter,
    isFetching,
    datasource,
    handleChangePage,
    handleChangePaginate,
  } = useContext(TransactionCreateCancellationContext)

  const { items, handleSelectConsumptionTransaction } =
    useTransactionCreateReturnFromFacility(t)

  return (
    <div className="ui-flex ui-flex-col ui-gap-6 ui-mt-2">
      <p className="ui-text-base ui-font-normal ui-text-neutral-500">
        {t(
          'transactionCreate:transaction_return_from_facility.description_consumption_table'
        )}
      </p>

      <div className="ui-space-y-6">
        <DataTable
          data={datasource?.data ?? []}
          columns={consumptionColumn({
            t,
            no: (filter.page - 1) * filter.paginate,
            language,
            items,
            isPatient: datasource?.data?.some(
              (item: TTransactionReturnFacilityConsumptionData) =>
                item?.patients?.length > 0
            ),
          })}
          isLoading={isFetching}
          className="ui-max-h-[464px]"
          isSticky
          onClickRow={(row) => handleSelectConsumptionTransaction(row.original)}
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

export default TransactionReturnFromFacilityConsumptionListTable
