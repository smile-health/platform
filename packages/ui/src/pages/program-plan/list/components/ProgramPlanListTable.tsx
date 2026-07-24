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

import ProgramPlanContext from '../libs/program-plan-list.context'
import { ListProgramPlanResponse } from '../libs/program-plan-list.type'
import { MainColumn } from './ProgramPlanListTableColumn'
import ProgramPlanActivateDeactivateModalConfirmation from './ProgramPlanMarkAsFinalModal'

type Props = {
  data?: ListProgramPlanResponse
  sorting: SortingState
  setSorting: (sorting: SortingState) => void
}
const ProgramPlanListTable: React.FC<Props> = ({
  data,
  sorting,
  setSorting,
}): JSX.Element => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'programPlan'])
  const { setPagination } = useContext(ProgramPlanContext)

  return (
    <>
      <ProgramPlanActivateDeactivateModalConfirmation />
      <DataTable
        id="program_plan_table"
        data={data?.data}
        columns={MainColumn({
          t,
          locale: language,
        })}
        sorting={sorting}
        setSorting={setSorting}
        isLoading={!data}
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

export default ProgramPlanListTable
