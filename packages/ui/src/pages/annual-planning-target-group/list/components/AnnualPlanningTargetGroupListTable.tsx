import { useContext } from 'react'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useTranslation } from 'react-i18next'

import AnnualPlanningTargetGroupListContext from '../libs/annual-planning-target-group-list.context'
import { ListAnnualPlanningTargetGroupResponse } from '../libs/annual-planning-target-group-list.type'
import AnnualPlanningTargetGroupActivateDecativateConfirmation from './AnnualPlanningTargetGroupActivateDecativateConfirmation'
import { MainColumn } from './AnnualPlanningTargetGroupListTableColumn'

type AnnualPlanningTargetGroupListTableProps = {
  data?: ListAnnualPlanningTargetGroupResponse
}
const AnnualPlanningTargetGroupListTable = ({
  data,
}: AnnualPlanningTargetGroupListTableProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'annualPlanningTargetGroup'])
  const { setPagination } = useContext(AnnualPlanningTargetGroupListContext)

  return (
    <>
      <AnnualPlanningTargetGroupActivateDecativateConfirmation />
      <DataTable
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
    </>
  )
}

export default AnnualPlanningTargetGroupListTable
