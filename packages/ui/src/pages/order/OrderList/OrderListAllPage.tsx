import { useMemo } from 'react'
import { DataTable } from '#components/data-table'
import { useFilter, UseFilter } from '#components/filter'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import OrderListContainer from './components/OrderListContainer'
import OrderListFilter from './components/OrderListFilter'
import useOrderListTable from './hooks/useOrderListTable'
import orderListFilterFormSchema from './schemas/orderListFilterFormSchema'

export default function OrderListAllPage() {
  usePermission('order-list-all')
  const { t } = useTranslation(['common', 'orderList'])
  const { t: tDashboard } = useTranslation('dashboard')

  const filterSchema = useMemo<UseFilter>(
    () => orderListFilterFormSchema(t, tDashboard, 'all'),
    [t, tDashboard]
  )

  const filter = useFilter(filterSchema)

  const {
    page,
    paginate,
    isLoading,
    dataSource,
    tableColumns,
    handleChangePage,
    handleChangePaginate,
  } = useOrderListTable({
    filter: filter?.query,
    queryKey: 'order-list-all',
  })

  useSetLoadingPopupStore(isLoading)

  return (
    <OrderListContainer>
      <OrderListFilter
        filter={{
          ...filter,
          query: {
            ...filter?.query,
            page,
            paginate,
          },
        }}
        handleChangePage={handleChangePage}
      />
      <DataTable
        data={dataSource?.data}
        columns={tableColumns}
        isLoading={isLoading}
      />
      <PaginationContainer>
        <PaginationSelectLimit
          size={paginate}
          onChange={handleChangePaginate}
          perPagesOptions={dataSource?.list_pagination}
        />
        <PaginationInfo
          size={paginate}
          currentPage={page}
          total={dataSource?.total_item}
        />
        <Pagination
          totalPages={dataSource?.total_page ?? 1}
          currentPage={page}
          onPageChange={handleChangePage}
        />
      </PaginationContainer>
    </OrderListContainer>
  )
}
