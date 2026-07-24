import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'

import { useTicketingSystemListContext } from '../../TicketingSystemListProvider'

export default function TicketingSystemListTable() {
  const ticketingSystemList = useTicketingSystemListContext()

  return (
    <>
      <DataTable
        data={ticketingSystemList.data}
        columns={ticketingSystemList.columns}
        isLoading={ticketingSystemList.isLoading}
        isSticky
      />
      <PaginationContainer>
        <PaginationSelectLimit
          size={ticketingSystemList.pagination.paginate}
          onChange={(limit) =>
            ticketingSystemList.pagination.update({ page: 1, paginate: limit })
          }
        />
        <PaginationInfo
          size={ticketingSystemList.pagination.paginate}
          currentPage={ticketingSystemList.pagination.page}
          total={ticketingSystemList.pagination.totalItem}
        />
        <Pagination
          totalPages={ticketingSystemList.pagination.totalPage}
          currentPage={ticketingSystemList.pagination.page}
          onPageChange={(page) =>
            ticketingSystemList.pagination.update({ page })
          }
        />
      </PaginationContainer>
    </>
  )
}
