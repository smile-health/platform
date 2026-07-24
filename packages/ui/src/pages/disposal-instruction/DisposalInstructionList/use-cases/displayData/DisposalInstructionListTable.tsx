import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'

import { useDisposalInstructionList } from '../../DisposalInstructionListContext'
import useDisposalInstructionListTable from './useDisposalInstructionListTable'

export default function DisposalInstructionListTable() {
  const disposalInstructionList = useDisposalInstructionList()
  const disposalInstructionListTable = useDisposalInstructionListTable()

  return (
    <>
      <DataTable
        data={disposalInstructionList.response?.data}
        columns={disposalInstructionListTable.columns}
        isLoading={disposalInstructionList.isLoading}
        isSticky
      />
      <PaginationContainer>
        <PaginationSelectLimit
          size={disposalInstructionListTable.pagination.paginate}
          onChange={(limit) =>
            disposalInstructionListTable.pagination.update({
              page: 1,
              paginate: limit,
            })
          }
        />
        <PaginationInfo
          size={disposalInstructionListTable.pagination.paginate}
          currentPage={disposalInstructionListTable.pagination.page}
          total={disposalInstructionList.response?.total_item}
        />
        <Pagination
          totalPages={disposalInstructionList.response?.total_page ?? 0}
          currentPage={disposalInstructionListTable.pagination.page}
          onPageChange={(page) =>
            disposalInstructionListTable.pagination.update({ page })
          }
        />
      </PaginationContainer>
    </>
  )
}
