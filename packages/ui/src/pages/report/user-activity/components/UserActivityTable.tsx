import { EmptyState } from '#components/empty-state'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import cx from '#lib/cx'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import useGetEntityTable from '../hooks/useGetEntityTable'

type Props = Readonly<{
  filter: Values<Record<string, any>>
}>

export default function UserActivityTable({ filter }: Props) {
  const { t } = useTranslation()

  const {
    headers,
    entities,
    isLoading,
    page,
    paginate,
    totalItem,
    totalPage,
    listPagination,
    handleChangePage,
    handleChangePaginate,
  } = useGetEntityTable(filter)

  return (
    <div className="ui-relative ui-space-y-6">
      <Table
        withBorder
        rounded
        hightlightOnHover
        loading={isLoading}
        empty={!entities?.length}
      >
        <Thead>
          {headers.map((head, index) => (
            <Tr key={JSON.stringify(head)}>
              {head.map((item) => (
                <Th
                  key={item.label}
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
        <Tbody>
          {entities?.map((data) => (
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
        <TableEmpty>
          <EmptyState
            title={t('message.empty.title')}
            description={t('message.empty.description')}
            withIcon
          />
        </TableEmpty>
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
