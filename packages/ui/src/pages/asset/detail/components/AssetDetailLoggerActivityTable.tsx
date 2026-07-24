import React, { useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import { listHistory } from '../../services/asset.services'
import AssetDetailLoggerActivityContext from '../libs/asset-detail-logger-activity.context'
import { TFilterLoggerActivity } from '../libs/asset-detail.types'
import { AssetDetailLoggerActivityColumns } from './AssetDetailLoggerActivityTableColumns'

const AssetDetailLoggerActivityTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation()

  const [pagination, setPagination] = useState({
    page: 1,
    paginate: 10,
  })

  const { filter, shouldFetch, setShouldFetch } = useContext(
    AssetDetailLoggerActivityContext
  )

  const {
    data: loggerActivity,
    isLoading: loggerActivityLoading,
    isFetching: loggerActivityFetching,
  } = useQuery({
    queryKey: [
      'asset-logger-activity',
      { ...filter, page: pagination.page, paginate: pagination.paginate },
    ],
    queryFn: async () => {
      setShouldFetch(false)
      const result = listHistory({
        ...filter,
        page: pagination.page,
        paginate: pagination.paginate,
      } as TFilterLoggerActivity)
      return result
    },
    enabled: shouldFetch,
  })

  useSetLoadingPopupStore(loggerActivityLoading || loggerActivityFetching)

  return (
    <>
      <DataTable
        columns={AssetDetailLoggerActivityColumns(t, language)}
        data={loggerActivity?.data ?? []}
      />
      <PaginationContainer className="ui-mt-5">
        <PaginationSelectLimit
          size={loggerActivity?.item_per_page}
          perPagesOptions={loggerActivity?.list_pagination}
          onChange={(paginate) => {
            setShouldFetch(true)
            setPagination({ paginate, page: 1 })
          }}
        />
        <PaginationInfo
          size={loggerActivity?.item_per_page}
          currentPage={loggerActivity?.page}
          total={loggerActivity?.total_item}
        />
        <Pagination
          totalPages={loggerActivity?.total_page ?? 0}
          currentPage={loggerActivity?.page}
          onPageChange={(page) => {
            setShouldFetch(true)
            setPagination({
              ...pagination,
              page,
            })
          }}
        />
      </PaginationContainer>
    </>
  )
}

export default AssetDetailLoggerActivityTable
