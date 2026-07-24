import React, { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import useSmileRouter from '#hooks/useSmileRouter'
import MasterListPage from '#pages/bmhp/master/list/MasterListPage'
import { useTranslation } from 'react-i18next'

import useMasterTable from './hooks/useMasterTable'
import { useTableFilter } from './hooks/useTableFilter'
import { GetBmhpParameterListParams, listBmhpParameter } from './master.service'
import BmhpPlanningDetailContext from '../../bmhp-planning/list/libs/bmhp-planning-list.context'

type BmhpParameterListPageProps = {
  withLayout?: boolean
}

const BmhpParameterListPage: React.FC<BmhpParameterListPageProps> = ({
  withLayout = true,
}) => {
  const { t } = useTranslation(['masterBmhp', 'common'])
  const router = useSmileRouter()
  const { yearData } = useContext(BmhpPlanningDetailContext)
  const isFinal = !!yearData?.is_final
  const { year_id } = router.query
  const basePath = `/v5/bmhp-planning/${year_id}/parameter/`
  const table = useMasterTable({ basePath })
  const filter = useTableFilter()
  const params: GetBmhpParameterListParams = {
    page: table.pagination.page,
    paginate: table.pagination.paginate,
    sort_by: table?.querySorting?.querySorting?.sort_by,
    sort_type: table?.querySorting?.querySorting?.sort_type,
    keyword: filter.filter.getValues('keyword'),
    program_plan_id: Number(year_id),
  }
  const { data, isLoading } = useQuery({
    queryKey: ['bmhp-parameter-list', params],
    queryFn: () => listBmhpParameter(params),
  })

  return (
    <>
      <MasterListPage
        filter={filter.filter}
        basePath={basePath}
        title={t('masterBmhp:title.bmhp_parameter')}
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

export default BmhpParameterListPage
