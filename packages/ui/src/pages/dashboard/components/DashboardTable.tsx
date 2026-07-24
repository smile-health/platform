import { EmptyState } from '#components/empty-state'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

type Props = {
  page: number
  paginate: number
  isLoading?: boolean
  headers: {
    label: string
    class?: string
    colSpan?: number
  }[][]
  rows: {
    value: string | number
    class?: string
  }[][]
  totalPage?: number
  totalItem?: number
  listPagination?: number[]
  handleChangePage: (paginate: number) => void
  handleChangePaginate: (paginate: number) => void
}

export default function DashboardTable({
  isLoading,
  headers,
  rows,
  page,
  paginate,
  totalPage = 1,
  totalItem = 0,
  listPagination,
  handleChangePage,
  handleChangePaginate,
}: Props) {
  const { t } = useTranslation()

  return (
    <div className="ui-relative ui-space-y-6">
      <Table
        withBorder
        rounded
        hightlightOnHover
        loading={isLoading}
        empty={!rows?.length}
      >
        <Thead>
          {headers?.map((head, index) => (
            <Tr key={JSON.stringify(head)}>
              {head?.map((item, i) => (
                <Th
                  key={item.label + i}
                  colSpan={item.colSpan}
                  className={cx(item.class, {
                    'ui-bg-slate-100': index === 0,
                    'ui-bg-slate-200': index > 0,
                  })}
                >
                  {item.label}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <TableEmpty colSpan={headers?.[0]?.length}>
          <EmptyState
            title={t('message.empty.title')}
            description={t('message.empty.description')}
            withIcon
          />
        </TableEmpty>
        <Tbody>
          {rows?.map((data) => (
            <Tr key={JSON.stringify(data)}>
              {data?.map((item) => (
                <Td
                  key={JSON.stringify(item?.value)}
                  className={cx(' ui-bg-white', item?.class)}
                >
                  {item?.value}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
      <PaginationContainer>
        <PaginationSelectLimit
          size={paginate}
          onChange={handleChangePaginate}
          perPagesOptions={listPagination}
        />
        <PaginationInfo size={paginate} currentPage={page} total={totalItem} />
        <Pagination
          totalPages={totalPage}
          currentPage={page}
          onPageChange={handleChangePage}
        />
      </PaginationContainer>
    </div>
  )
}
