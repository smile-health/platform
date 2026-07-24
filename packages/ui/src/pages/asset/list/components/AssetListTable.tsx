import React, { useContext } from 'react'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useTranslation } from 'react-i18next'

import AssetListContext from '../libs/asset-list.context'
import { ListAssetResponse } from '../libs/asset-list.types'
import { MainColumn } from './AssetListColumn'

type Props = {
  data?: ListAssetResponse
}
const AssetListTable: React.FC<Props> = ({ data }): JSX.Element => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'asset'])
  const { setPagination } = useContext(AssetListContext)
  return (
    <>
      <div>
        <DataTable
          id="stock__opname__list__table"
          data={data?.data}
          columns={MainColumn({
            t,
            language,
          })}
        />
        <PaginationContainer className="ui-mt-5">
          <PaginationSelectLimit
            size={data?.item_per_page}
            perPagesOptions={data?.list_pagination ?? [10, 25, 50, 100]}
            onChange={(paginate) => setPagination({ paginate })}
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

export default AssetListTable
