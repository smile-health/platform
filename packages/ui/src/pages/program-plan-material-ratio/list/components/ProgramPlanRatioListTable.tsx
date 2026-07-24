import React, { useContext } from 'react'
import { useParams } from 'next/navigation'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import ProgramPlanDetailContext from '../../../program-plan/list/libs/program-plan-detail.context'
import { ProgramPlanRatioListTableProps } from '../libs/program-plan-ratio.list.type'
import { MainColumn } from './ProgramPlanRatioListTableColumn'

const ProgramPlanRatioListTable: React.FC<ProgramPlanRatioListTableProps> = ({
  data,
  pagination,
  onChangePage,
  onChangePaginate,
  onClickDelete,
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'programPlan'])
  const router = useSmileRouter()
  const params = useParams()
  const programPlanId = Number(params.id)
  const { detailProgramPlanData } = useContext(ProgramPlanDetailContext)

  const itemPerPage = pagination?.itemPerPage ?? 10
  const page = pagination?.page ?? 1
  const totalItem = pagination?.totalItem ?? data.length
  const totalPage = pagination?.totalPage ?? 1
  const perPagesOptions = pagination?.listPagination ?? [10, 25, 50]

  return (
    <>
      <DataTable
        data={data}
        columns={MainColumn({
          t,
          locale: language,
          programPlanId,
          detailProgramPlanData,
          setLink: router.getAsLink,
          onClickDelete,
        })}
        isHighlightedOnHover
        withBorder
        bodyClassName="ui-bg-white"
      />
      <PaginationContainer className="ui-mt-5">
        <PaginationSelectLimit
          size={itemPerPage}
          perPagesOptions={perPagesOptions}
          onChange={(size) => onChangePaginate?.(size)}
        />
        <PaginationInfo
          size={itemPerPage}
          currentPage={page}
          total={totalItem}
        />
        <Pagination
          totalPages={totalPage}
          currentPage={page}
          onPageChange={(p) => onChangePage?.(p)}
        />
      </PaginationContainer>
    </>
  )
}

export default ProgramPlanRatioListTable
