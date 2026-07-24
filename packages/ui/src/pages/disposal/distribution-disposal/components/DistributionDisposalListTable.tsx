import React, { useContext } from 'react'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import { columns } from '../constants/table'
import DistributionDisposalListContext from '../utils/distribution-disposal-list.context'

const DistributionDisposalListTable = () => {
  const { t } = useTranslation(['common', 'distributionDisposal'])
  const { datasource, isFetching, additionalQuery, setAdditionalQuery } =
    useContext(DistributionDisposalListContext)
  useSetLoadingPopupStore(isFetching)
  
  return (
    <>
      <DataTable
        data={datasource?.data}
        columns={columns({
          t,
          no:
            ((additionalQuery?.page ?? 1) - 1) *
            (additionalQuery?.paginate ?? 10),
        })}
      />
      <PaginationContainer>
        <PaginationSelectLimit
          size={additionalQuery?.paginate}
          onChange={(paginate) => {
            setAdditionalQuery?.({
              ...additionalQuery,
              page: 1,
              paginate,
            })
          }}
          perPagesOptions={datasource?.list_pagination}
        />
        <PaginationInfo
          size={additionalQuery?.paginate ?? 10}
          currentPage={additionalQuery?.page}
          total={datasource?.total_item ?? 0}
        />
        <Pagination
          totalPages={datasource?.total_page as number}
          currentPage={additionalQuery?.page}
          onPageChange={(page) => {
            setAdditionalQuery?.({
              ...additionalQuery,
              page,
              paginate: additionalQuery?.paginate ?? 10,
            })
          }}
        />
      </PaginationContainer>
    </>
  )
}

export default DistributionDisposalListTable
