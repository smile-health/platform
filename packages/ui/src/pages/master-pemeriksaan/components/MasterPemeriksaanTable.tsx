import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'

import { DataTable } from '../../../components/data-table'
import { useMasterPemeriksaanTable } from '../hooks/useMasterPemeriksaanTable'

type FilterQuery = {
  name?: string
  examination_type_id?:
    | { value: number; label: string }
    | { value: number; label: string }[]
}

type Props = {
  filterQuery?: FilterQuery
}

export default function MasterPemeriksaanTable({ filterQuery }: Props) {
  const {
    tableColumns,
    dataSource,
    isLoading,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
  } = useMasterPemeriksaanTable(filterQuery)

  return (
    <div className="ui-space-y-4">
      <DataTable
        columns={tableColumns}
        data={dataSource?.data}
        isLoading={isLoading}
        withBorder
        isStriped
      />

      <PaginationContainer>
        <PaginationSelectLimit
          size={paginate}
          onChange={(limit) => {
            handleChangePage(1)
            handleChangePaginate(limit)
          }}
        />
        <PaginationInfo
          size={paginate}
          currentPage={page}
          total={dataSource?.total_item}
        />
        <Pagination
          totalPages={dataSource?.total_page ?? 0}
          currentPage={page}
          onPageChange={handleChangePage}
        />
      </PaginationContainer>
    </div>
  )
}
