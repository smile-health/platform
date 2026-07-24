import { useMemo } from 'react'
import { DataTable } from '#components/data-table'
import { useFilter, UseFilter } from '#components/filter'
import { CursorPagination, PaginationContainer } from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import OrderListContainer from '../components/OrderListContainer'
import OrderListFilter from '../components/OrderListFilter'
import useOrderListTable from '../hooks/useOrderListTable'
import orderListFilterFormSchema from '../schemas/orderListFilterFormSchema'

export default function OrderListCustomerCursorPage() {
  const { t } = useTranslation(['common', 'orderList'])
  const { t: tDashboard } = useTranslation('dashboard')

  const filterSchema = useMemo<UseFilter>(
    () => orderListFilterFormSchema(t, tDashboard, 'customer'),
    [t, tDashboard]
  )

  const filter = useFilter(filterSchema)
  const filterQuery = {
    ...filter?.query,
    purpose: 'purchase',
  }

  const {
    paginate,
    isLoading,
    dataSource,
    tableColumns,
    setPagination,
    totalCursor,
  } = useOrderListTable({
    queryKey: 'order-list-customer-cursor',
    filter: filterQuery,
    isCursor: true,
  })

  const filterParams = {
    ...filterQuery,
    paginate,
  }

  useSetLoadingPopupStore(isLoading)

  return (
    <OrderListContainer isCursor>
      <OrderListFilter
        filter={{
          ...filter,
          query: filterParams,
        }}
      />
      <DataTable
        data={dataSource?.data}
        columns={tableColumns}
        isLoading={isLoading}
      />
      <PaginationContainer>
        <CursorPagination
          pagination={{
            paginate,
          }}
          onChangePagination={setPagination}
          totalCount={totalCursor}
          isLoadingCount={isLoading}
          nextCursor={dataSource?.next_cursor}
          prevCursor={dataSource?.prev_cursor}
        />
      </PaginationContainer>
    </OrderListContainer>
  )
}
