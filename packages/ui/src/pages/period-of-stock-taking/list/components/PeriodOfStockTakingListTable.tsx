import React, { useContext, useMemo } from 'react'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import { useSubmitEnableDisableStatus } from '../hooks/useSubmitEnableDisableStatus'
import PeriodOfStockTakingChangeStatusContext from '../libs/period-of-stock-taking-list.change-status-context'
import PeriodOfStockTakingContext from '../libs/period-of-stock-taking-list.context'
import { ListPeriodOfStockTakingResponse } from '../libs/period-of-stock-taking-list.type'
import PeriodOfStockTakingEnableDisableModalConfirmation from './PeriodOfStockTakingEnableDisableModalConfirmation'
import { MainColumn } from './PeriodOfStockTakingListTableColumn'

type Props = {
  data?: ListPeriodOfStockTakingResponse
}
const PeriodOfStockTakingListTable: React.FC<Props> = ({
  data,
}): JSX.Element => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'periodOfStockTaking'])
  const { setPagination } = useContext(PeriodOfStockTakingContext)
  const { mutateChangeStatus, isPendingChangeStatus } =
    useSubmitEnableDisableStatus(t, language)

  const contextValue = useMemo(
    () => ({
      mutateChangeStatus,
      isPendingChangeStatus,
    }),
    [mutateChangeStatus, isPendingChangeStatus]
  )

  useSetLoadingPopupStore(isPendingChangeStatus)
  
  return (
    <PeriodOfStockTakingChangeStatusContext.Provider value={contextValue}>
      <PeriodOfStockTakingEnableDisableModalConfirmation />
      <DataTable
        id="priod_of_stock_opname__table"
        data={data?.data}
        columns={MainColumn({
          t,
          locale: language,
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
      <style>{`
        #priod_of_stock_opname__table {
          tr:hover {
            background-color: #f5f5f5;
          }
          td {
            vertical-align: top !important;
          }
        }
      `}</style>
    </PeriodOfStockTakingChangeStatusContext.Provider>
  )
}

export default PeriodOfStockTakingListTable
