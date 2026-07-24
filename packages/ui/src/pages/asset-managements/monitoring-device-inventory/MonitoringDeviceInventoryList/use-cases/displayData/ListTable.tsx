import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'

import { useListFilter } from '../filter/useListFilter'
import { useListTable } from './useListTable'

export const ListTable = () => {
  const listFilter = useListFilter()
  const listTable = useListTable()

  return (
    <>
      <DataTable
        columns={listTable.columns}
        data={listTable.data}
        isLoading={listTable.isLoading}
        sorting={listTable.sorting}
        setSorting={listTable.setSorting}
      />
      <PaginationContainer>
        <PaginationSelectLimit
          size={listTable.pagination.paginate}
          onChange={(limit) =>
            listFilter.pagination.set({
              page: 1,
              paginate: limit,
            })
          }
        />
        <PaginationInfo
          size={listTable.pagination.paginate}
          currentPage={listTable.pagination.page}
          total={listTable.totalItem}
        />
        <Pagination
          totalPages={listTable.totalPages}
          currentPage={listTable.pagination.page}
          onPageChange={(page) => listFilter.pagination.set({ page })}
        />
      </PaginationContainer>
    </>
  )
}
