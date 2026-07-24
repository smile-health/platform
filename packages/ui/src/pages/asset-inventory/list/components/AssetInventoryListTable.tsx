import React, { useContext } from 'react'
import { SortingState } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useTranslation } from 'react-i18next'

import AssetListContext from '../libs/asset-inventory-list.context'
import { TListAssetResponse } from '../libs/asset-inventory-list.types'
import { AssetInventoryMainColumn } from './AssetInventoryListColumn'

type Props = {
  data?: TListAssetResponse
  page?: number
  paginate?: number
  sorting?: SortingState
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>
}
const AssetInventoryListTable: React.FC<Props> = ({
  data,
  page,
  paginate,
  sorting,
  setSorting,
}): JSX.Element => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'assetInventory'])
  const { setPagination } = useContext(AssetListContext)
  return (
    <div>
      <DataTable
        id="stock__opname__list__table"
        data={data?.data}
        columns={AssetInventoryMainColumn({
          t,
          language,
          page,
          paginate,
        })}
        sorting={sorting}
        setSorting={setSorting}
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
  )
}

export default AssetInventoryListTable
