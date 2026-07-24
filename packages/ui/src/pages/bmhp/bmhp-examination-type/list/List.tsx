import React, { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import MasterListPage from '#pages/bmhp/master/list/MasterListPage'
import { useTranslation } from 'react-i18next'

import useMasterTable from './hooks/useMasterTable'
import { useTableFilter } from './hooks/useTableFilter'
import {
  GetBmhpExaminationTypeListParams,
  listBmhpExaminationType,
} from './master.service'
import BmhpPlanningDetailContext from '../../bmhp-planning/list/libs/bmhp-planning-list.context'

type BmhpExaminationTypeListPageProps = {
  withLayout?: boolean
  yearId?: number
}

const BmhpExaminationTypeListPage: React.FC<
  BmhpExaminationTypeListPageProps
> = ({ withLayout = true, yearId }) => {
  const { t } = useTranslation(['masterBmhp', 'common'])
  const { yearData } = useContext(BmhpPlanningDetailContext)
  const isFinal = !!yearData?.is_final
  const basePath = `/v5/bmhp-planning/${yearId}/jenis-pemeriksaan/`
  const table = useMasterTable({ basePath })
  const filter = useTableFilter()
  const params: GetBmhpExaminationTypeListParams = {
    page: table.pagination.page,
    paginate: table.pagination.paginate,
    sort_by: table?.querySorting?.querySorting?.sort_by,
    sort_type: table?.querySorting?.querySorting?.sort_type,
    keyword: filter.filter.getValues('keyword'),
    program_plan_id: yearId,
  }
  const { data, isLoading } = useQuery({
    queryKey: ['bmhp-examination-type-list', params],
    queryFn: () => listBmhpExaminationType(params),
  })

  return (
    <>
      <MasterListPage
        filter={filter.filter}
        basePath={basePath}
        title={t('masterBmhp:title.bmhp_examination_type')}
        withLayout={withLayout}
        noAddButton={isFinal}
        data={{
          item: data?.data || [],
          total_item: data?.total_item || 0,
          total_page: data?.total_page || 0,
        }}
        isLoading={isLoading}
        masterTable={{
          columns: table.columns,
          pagination: {
            page: table.pagination.page,
            paginate: table.pagination.paginate,
            update: table.pagination.update,
          },
          querySorting: {
            querySorting: {
              sort_by: table.querySorting.querySorting.sort_by,
              sort_type: table.querySorting.querySorting.sort_type,
            },
            setQuerySorting: table.querySorting.setQuerySorting,
          },
          sorting: {
            sorting: table.sorting.sorting,
            setSorting: table.sorting.setSorting,
          },
        }}
      />
      <ModalConfirmation
        isLoading={isLoading}
        open={table.showDelete.isVisible}
        onSubmit={table.onDeleteTrigger}
        setOpen={() => table.setShowDelete({ isVisible: false, id: null })}
        title={t('masterBmhp:label.delete')}
        description={t('masterBmhp:message.delete')}
      />
    </>
  )
}

export default BmhpExaminationTypeListPage
