import React, { useContext } from 'react'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useTranslation } from 'react-i18next'

import StockOpnameListContext from '../libs/stock-opname-list.context'
import { ListStockOpnameResponse } from '../libs/stock-opname-list.types'
import { mainColumn } from './StockOpnameListColumn'

type Props = {
  data?: ListStockOpnameResponse
}
const StockOpnameListTable: React.FC<Props> = ({ data }): JSX.Element => {
  const { t, i18n } = useTranslation(['common', 'stockOpname'])
  const { setPagination } = useContext(StockOpnameListContext)
  return (
    <>
      <div>
        <DataTable
          id="stock__opname__list__table"
          data={data?.data}
          columns={mainColumn({
            t,
            locale: i18n.language,
          })}
        />
        <PaginationContainer className="ui-mt-5">
          <PaginationSelectLimit
            size={data?.item_per_page}
            perPagesOptions={data?.list_pagination}
            onChange={(paginate) => setPagination({ paginate, page: 1 })}
          />
          <PaginationInfo
            size={data?.item_per_page}
            currentPage={data?.page}
            total={data?.total_item}
          />
          <Pagination
            totalPages={data?.total_page ?? 0}
            currentPage={data?.page}
            onPageChange={(page) => setPagination({ page })}
          />
        </PaginationContainer>
      </div>
      <style>{`
        #stock__opname__list__table td {
          vertical-align: top !important;
        }
      `}</style>
    </>
  )
}

export default StockOpnameListTable
