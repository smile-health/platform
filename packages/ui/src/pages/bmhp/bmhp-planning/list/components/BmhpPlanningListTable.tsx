import React, { useContext, useMemo } from 'react'
import { SortingState } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useTranslation } from 'react-i18next'

import { BmhpPlanningListContext } from '../libs/bmhp-planning-list.context'
import {
  ListBmhpPlanningYearsResponse,
  TBmhpPlanningYear,
} from '../libs/bmhp-planning-list.type'
import { getBmhpPlanningListTableColumn } from './BmhpPlanningListTableColumn'

type TProps = {
  data: ListBmhpPlanningYearsResponse | undefined
  sorting: SortingState
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>
}

const BmhpPlanningListTable: React.FC<TProps> = ({
  data,
  sorting,
  setSorting,
}) => {
  const { t, i18n } = useTranslation(['common', 'bmhpPlanning'])
  const { setPagination } = useContext(BmhpPlanningListContext)

  const columns = useMemo(
    () => getBmhpPlanningListTableColumn({ t: t as any, locale: i18n.language }),
    [t, i18n.language]
  )

  return (
    <>
      <DataTable<TBmhpPlanningYear>
        id="bmhp_planning_table"
        data={data?.data ?? []}
        columns={columns}
        isLoading={!data}
        isSticky
        sorting={sorting}
        setSorting={setSorting}
      />
      <PaginationContainer className="ui-mt-5">
        <PaginationSelectLimit
          size={data?.item_per_page}
          perPagesOptions={data?.list_pagination}
          onChange={(paginate) => setPagination?.({ paginate, page: 1 })}
        />
        <PaginationInfo
          total={data?.total_item}
          currentPage={data?.page}
          size={data?.item_per_page}
        />
        <Pagination
          totalPages={data?.total_page ?? 1}
          currentPage={data?.page ?? 1}
          onPageChange={(page) => setPagination?.({ page })}
        />
      </PaginationContainer>
    </>
  )
}

export default BmhpPlanningListTable
