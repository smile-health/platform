import { useContext } from 'react'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useTranslation } from 'react-i18next'

import AnnualPlanningSubstitutionListContext from '../libs/annual-planning-substitution-list.context'
import { ListAnnualPlanningSubstitutionResponse } from '../libs/annual-planning-substitution-list.type'
import AnnualPlanningSubstitutionDeleteRowConfirmation from './AnnualPlanningSubstitutionDeleteRowConfirmation'
import { MainColumn } from './AnnualPlanningSubstitutionListTableColumn'

type AnnualPlanningSubstitutionListPageProps = {
  data?: ListAnnualPlanningSubstitutionResponse
}
const AnnualPlanningSubstitutionListTable = ({
  data,
}: AnnualPlanningSubstitutionListPageProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'annualPlanningSubstitution'])
  const { setPagination } = useContext(AnnualPlanningSubstitutionListContext)

  return (
    <>
      <AnnualPlanningSubstitutionDeleteRowConfirmation />
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

export default AnnualPlanningSubstitutionListTable
