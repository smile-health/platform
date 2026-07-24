import { Fragment, useMemo } from 'react'
import { EmptyState } from '#components/empty-state'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import cx from '#lib/cx'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import {
  TMaterial,
  TStockTakingDashboard,
} from '../dashboard-stock-taking.type'

type Props = Readonly<{
  page: number
  paginate: number
  handleChangePage: (page: number) => void
  handleChangePaginate: (paginate: number) => void
  isLoading: boolean
  table?: TStockTakingDashboard & {
    data: TMaterial[]
    materials?: {
      id: number
      name: string
    }[]
  }
}>

export default function DashboardStockTakingMaterialTable({
  table,
  page,
  paginate,
  isLoading,
  handleChangePage,
  handleChangePaginate,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardStockTaking')
  const { t: tCommon } = useTranslation()

  const formatNumber = (value: string | number) => {
    if (typeof value === 'number') {
      return numberFormatter(value, language)
    }

    return value ?? '0'
  }

  const materials = table?.materials ?? []

  return (
    <Fragment>
      <Table
        rounded
        withBorder
        withColumnBorders={Boolean(materials?.length)}
        loading={isLoading}
        empty={!table?.data?.length}
      >
        <Thead>
          <Tr>
            <Th rowSpan={2} className="ui-sticky ui-left-0 ui-bg-slate-100">
              No
            </Th>
            <Th rowSpan={2} className="ui-sticky ui-left-9 ui-bg-slate-100">
              {t('column.entity.main')}
            </Th>
            {materials?.map((item) => (
              <Th
                key={item?.id}
                colSpan={2}
                className="ui-text-center ui-text-nowrap"
              >
                {item?.name}
              </Th>
            ))}
            {Boolean(table?.data?.length) && (
              <Th rowSpan={2} className="ui-text-center">
                {t('column.opname_recap')}
              </Th>
            )}
          </Tr>
          <Tr>
            {materials?.map((item, index) => (
              <Fragment key={item?.id}>
                <Th className="ui-text-center">SMILE</Th>
                <Th
                  className={cx('ui-text-center ui-border-r', {
                    'ui-border-gray-300': index === materials?.length - 1,
                  })}
                >
                  {t('column.material.real')}
                </Th>
              </Fragment>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {table?.data?.map((item, index) => (
            <Tr key={item?.row}>
              <Td className="ui-sticky ui-left-0 ui-bg-white">
                {(page - 1) * paginate + (index + 1)}
              </Td>
              <Td className="ui-sticky ui-left-9 ui-bg-white ui-text-nowrap">
                {item?.entity?.name}
              </Td>

              {item?.materials?.map((item) => {
                const isDifferent = Boolean(item?.is_different)
                const isMandatory = Boolean(item?.is_mandatory)
                const isStockOpnamed = Boolean(item?.is_stock_opnamed)

                return (
                  <Fragment key={item?.id}>
                    <Td
                      className={cx('ui-text-center', {
                        'ui-bg-yellow-200': isStockOpnamed && isDifferent,
                        'ui-bg-red-50': !isStockOpnamed && isMandatory,
                      })}
                    >
                      <span>{formatNumber(item?.smile_stock)}</span>
                      {isMandatory && (
                        <span className="ui-text-danger-600 ui-text-lg ui-ml-1">
                          *
                        </span>
                      )}
                    </Td>
                    <Td
                      className={cx('ui-text-center', {
                        'ui-bg-yellow-200': isStockOpnamed && isDifferent,
                        'ui-bg-red-50': !isStockOpnamed && isMandatory,
                      })}
                    >
                      <span>{formatNumber(item?.real_stock)}</span>
                      {isMandatory && (
                        <span className="ui-text-danger-600 ui-text-lg ui-ml-1">
                          *
                        </span>
                      )}
                    </Td>
                  </Fragment>
                )
              })}
              <Td className="ui-text-center">{item?.opname_recap}</Td>
            </Tr>
          ))}
        </Tbody>
        <TableEmpty>
          <EmptyState
            title={tCommon('message.empty.title')}
            description={tCommon('message.empty.description')}
            withIcon
          />
        </TableEmpty>
      </Table>
      <PaginationContainer>
        <PaginationSelectLimit
          size={paginate}
          onChange={handleChangePaginate}
          perPagesOptions={table?.list_pagination}
        />
        <PaginationInfo
          size={paginate}
          currentPage={page}
          total={table?.total_item}
        />
        <Pagination
          totalPages={table?.total_page ?? 1}
          currentPage={page}
          onPageChange={handleChangePage}
        />
      </PaginationContainer>
    </Fragment>
  )
}
