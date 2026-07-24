import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useMasterMethodTable } from '../hooks/useMasterMethodTable'

type FilterQuery = {
  name?: string
}

type Props = {
  filterQuery?: FilterQuery
}

export default function MasterMethodTable({ filterQuery }: Props) {
  const {
    tableColumns,
    dataSource,
    isLoading,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
  } = useMasterMethodTable(filterQuery)

  return (
    <div className="ui-space-y-4">
      <DataTable
        columns={tableColumns}
        data={dataSource?.data || []}
        isLoading={isLoading}
        withBorder
        isStriped
      />

      {dataSource && (
        <PaginationContainer>
          <PaginationSelectLimit
            size={paginate}
            onChange={handleChangePaginate}
            perPagesOptions={dataSource.list_pagination}
          />
          <PaginationInfo
            size={paginate}
            currentPage={page}
            total={dataSource.total_item}
          />
          <Pagination
            totalPages={dataSource.total_page || 1}
            currentPage={page}
            onPageChange={handleChangePage}
          />
        </PaginationContainer>
      )}
    </div>
  )
}
